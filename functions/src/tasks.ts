import { CloudTasksClient } from "@google-cloud/tasks";
import { Buffer } from "buffer";
import { logger } from "firebase-functions";
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

const tasksClient = new CloudTasksClient();
const projectId = process.env.GCP_PROJECT_ID;
const region = "asia-northeast1";
const queue = "deadline-notification-queue";
const marginTime = 10;

// queuePath, postData, etaを受け取り、タスクを作成
const createTask = async (
  queuePath: string,
  postData: { goalId: string; marginTime: number },
  eta: Date
) => {
  const accessToken = process.env.NOTIFICATION_KEY;
  const goalId = postData.goalId;

  const now = new Date();
  // タスクの名前をgoalIdと作成日時を結合したものに設定
  const name = `${queuePath}/tasks/${goalId}-${now.getTime()}`;
  logger.info(`Creating task: ${name}`);
  await tasksClient.createTask({
    parent: queuePath,
    task: {
      name,
      httpRequest: {
        httpMethod: "POST",
        url: "https://firestore-okdtj725ta-an.a.run.app/notification",
        headers: {
          "Content-Type": "application/json",
          token: `${accessToken}`,
        },
        body: Buffer.from(JSON.stringify(postData)).toString("base64"),
      },
      scheduleTime: { seconds: Math.floor(eta.getTime() / 1000) },
    },
  });
  logger.info(`Task created for ${goalId} with ${name}`);
};

// queuePath, goalIdで始まるタスクを削除
const deleteTask = async (queuePath: string, goalId: string) => {
  const taskPrefix = `${queuePath}/tasks/${goalId}`;
  logger.info(`Deleting tasks for ${goalId} with prefix ${taskPrefix}`);

  const [tasks] = await tasksClient.listTasks({ parent: queuePath });
  const tasksToDelete = tasks.filter(
    (task) => task.name && task.name.startsWith(taskPrefix)
  );

  for (const task of tasksToDelete) {
    if (task.name) {
      logger.info("Deleting task:", task.name);
      await tasksClient.deleteTask({ name: task.name });
      logger.info("Task deleted:", task.name);
    }
  }

  logger.info("All tasks with prefix deleted for goalId:", goalId);
};

export const createTasksOnGoalCreate = onDocumentCreated(
  { region: region, document: "goal/{goalId}" },
  async (event) => {
    // production以外はスキップ(Cloud Tasksがエミュレーターで実行できないため)
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!projectId) {
      logger.error("GCP_PROJECT_ID is not defined.");
      return;
    }

    if (!event.data) {
      logger.error("No data found in event.");
      return;
    }

    try {
      const goalData = event.data.data();
      const postData = {
        goalId: event.params.goalId,
        marginTime,
      };
      // 期限のmarginTime分前にタスクを設定
      const deadline = new Date(
        goalData.deadline.toDate().getTime() - marginTime * 60 * 1000
      );
      createTask(
        tasksClient.queuePath(projectId, region, queue),
        postData,
        deadline
      );
    } catch (error) {
      logger.error("Error scheduling task:", error);
    }
  }
);

// 目標を完了した時にtasksから通知予定を削除する
export const updateTasksOnPostUpdate = onDocumentUpdated(
  {
    region: region,
    document: "goal/{goalId}",
  },
  async (event) => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!projectId) {
      logger.error("GCP_PROJECT_ID is not defined.");
      return;
    }

    if (!event.data) {
      logger.error("No data found in event.");
      return;
    }

    if (
      event.data.before.data().post === null &&
      event.data.after.data().post !== null
    ) {
      // 目標を完了(完了投稿を作成)した場合
      // null -> post に変更された場合はタスクを削除
      try {
        const goalId = event.params.goalId;
        const queuePath = tasksClient.queuePath(projectId, region, queue);
        await deleteTask(queuePath, goalId);
      } catch (error) {
        logger.error("Error deleting task:", error);
      }
    } else if (
      event.data.before.data().post !== null &&
      event.data.after.data().post === null
    ) {
      // 完了投稿を削除した場合
      // post -> null に変更された場合はタスクを作成(deadlineが今よりも後の場合のみ)
      if (
        event.data.after.data().deadline.toDate().getTime() <=
        new Date().getTime()
      ) {
        return;
      }

      // taskを作成
      try {
        const postData = {
          goalId: event.params.goalId,
          marginTime,
        };
        createTask(
          tasksClient.queuePath(projectId, region, queue),
          postData,
          event.data.after.data().deadline.toDate()
        );
      } catch (error) {
        logger.error("Error scheduling task:", error);
      }
    } else if (
      event.data.before.data().post === null &&
      event.data.after.data().post === null
    ) {
      // deadlineが変更された場合はタスクを削除して再作成
      if (event.data.before.data() === event.data.after.data()) {
        return;
      }
      try {
        // taskを削除
        const goalId = event.params.goalId;
        const queuePath = tasksClient.queuePath(projectId, region, queue);
        await deleteTask(queuePath, goalId);

        const postData = {
          goalId: event.params.goalId,
          marginTime,
        };
        // taskを作成
        createTask(
          queuePath,
          postData,
          event.data.after.data().deadline.toDate()
        );
      } catch (error) {
        logger.error("Error updating task:", error);
      }
    }
  }
);

// 目標を削除した時にtasksから通知予定を削除する
export const deleteTasksOnGoalDelete = onDocumentDeleted(
  { region: region, document: "goal/{goalId}" },
  async (event) => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!projectId) {
      logger.error("GCP_PROJECT_ID is not defined.");
      return;
    }

    if (!event.data) {
      logger.error("No data found in event.");
      return;
    }

    try {
      const goalId = event.params.goalId;
      const queuePath = tasksClient.queuePath(projectId, region, queue);
      await deleteTask(queuePath, goalId);
    } catch (error) {
      logger.error("Error deleting task:", error);
    }
  }
);
