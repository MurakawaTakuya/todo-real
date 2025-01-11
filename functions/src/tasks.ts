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

export const createTasksOnGoalCreate = onDocumentCreated(
  { region: region, document: "goal/{goalId}" },
  async (event) => {
    // production以外はスキップ(Cloud Tasksがエミュレーターで実行できないため)
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!projectId) {
      logger.info("GCP_PROJECT_ID is not defined.");
      return;
    }

    if (!event.data) {
      logger.info("No data found in event.");
      return;
    }

    try {
      const goalData = event.data.data();
      const marginTime = 5;
      // 期限のmarginTime分前にタスクを設定
      const deadline = new Date(
        goalData.deadline.toDate().getTime() - marginTime * 60 * 1000
      );
      const goalId = event.params.goalId;
      const postData = {
        goalId,
        marginTime,
      };
      const queuePath = tasksClient.queuePath(projectId, region, queue);
      const accessToken = process.env.NOTIFICATION_KEY;

      await tasksClient.createTask({
        parent: queuePath,
        task: {
          name: `${queuePath}/tasks/${goalId}`, // タスクの名前をgoalIdに設定
          httpRequest: {
            httpMethod: "POST",
            url: "https://firestore-okdtj725ta-an.a.run.app/notification",
            headers: {
              "Content-Type": "application/json",
              token: `${accessToken}`,
            },
            body: Buffer.from(JSON.stringify(postData)).toString("base64"),
          },
          scheduleTime: { seconds: Math.floor(deadline.getTime() / 1000) },
        },
      });
      logger.info("Task created for goalId:", goalId);
    } catch (error) {
      logger.error("Error scheduling task:", error);
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
      logger.info("GCP_PROJECT_ID is not defined.");
      return;
    }

    if (!event.data) {
      logger.info("No data found in event.");
      return;
    }

    try {
      const goalId = event.params.goalId;
      const queuePath = tasksClient.queuePath(projectId, region, queue);
      const taskName = `${queuePath}/tasks/${goalId}`; // goalIdが名前になっているタスクを削除
      await tasksClient.deleteTask({ name: taskName });
      logger.info("Task deleted for goalId:", goalId);
    } catch (error) {
      logger.info("Error deleting task:", error);
    }
  }
);

// 目標を完了した時にtasksから通知予定を削除する
export const deleteTasksOnPostCreate = onDocumentUpdated(
  {
    region: region,
    document: "goal/{goalId}",
  },
  async (event) => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!projectId) {
      logger.info("GCP_PROJECT_ID is not defined.");
      return;
    }

    if (!event.data) {
      logger.info("No data found in event.");
      return;
    }

    if (event.data.after.data().post !== null) {
      return;
    }

    try {
      const goalId = event.params.goalId;
      const queuePath = tasksClient.queuePath(projectId, region, queue);
      const taskName = `${queuePath}/tasks/${goalId}`; // goalIdが名前になっているタスクを削除
      await tasksClient.deleteTask({ name: taskName });
      logger.info("Task deleted for goalId:", goalId);
    } catch (error) {
      logger.info("Error deleting task:", error);
    }
  }
);
