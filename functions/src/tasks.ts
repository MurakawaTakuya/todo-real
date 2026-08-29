import { CloudTasksClient } from "@google-cloud/tasks";
import { Buffer } from "buffer";
import { logger } from "firebase-functions";
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

const tasksClient = new CloudTasksClient();
const projectId =
  process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT_ID || "todo-real-c28fa";
const region = "asia-northeast1";
const queue = "deadline-notification-queue";
const marginTime = 10;
const taskInvokerServiceAccount =
  "todo-real-task-invoker@todo-real-c28fa.iam.gserviceaccount.com";
const taskSchedulerServiceAccount =
  "todo-real-task-scheduler@todo-real-c28fa.iam.gserviceaccount.com";
const notificationUrl =
  "https://asia-northeast1-todo-real-c28fa.cloudfunctions.net/deadlineNotification";

const createTask = async (
  queuePath: string,
  postData: { goalId: string; marginTime: number },
  eta: Date
) => {
  if (eta.getTime() <= Date.now()) {
    logger.info("Skipping notification task whose schedule is in the past", {
      goalId: postData.goalId,
    });
    return;
  }

  const name = `${queuePath}/tasks/${postData.goalId}-${Date.now()}`;
  await tasksClient.createTask({
    parent: queuePath,
    task: {
      name,
      httpRequest: {
        httpMethod: "POST",
        url: notificationUrl,
        headers: { "Content-Type": "application/json" },
        oidcToken: {
          serviceAccountEmail: taskInvokerServiceAccount,
          audience: notificationUrl,
        },
        body: Buffer.from(JSON.stringify(postData)).toString("base64"),
      },
      scheduleTime: { seconds: Math.floor(eta.getTime() / 1000) },
    },
  });
  logger.info("Notification task created", { goalId: postData.goalId, name });
};

const deleteTask = async (queuePath: string, goalId: string) => {
  const taskPrefix = `${queuePath}/tasks/${goalId}`;
  const [tasks] = await tasksClient.listTasks({ parent: queuePath });
  for (const task of tasks) {
    if (task.name?.startsWith(taskPrefix)) {
      await tasksClient.deleteTask({ name: task.name });
    }
  }
  logger.info("Notification tasks deleted", { goalId });
};

const taskOptions = {
  region,
  serviceAccount: taskSchedulerServiceAccount,
};

export const createTasksOnGoalCreate = onDocumentCreated(
  { ...taskOptions, document: "goal/{goalId}" },
  async (event) => {
    if (process.env.FUNCTIONS_EMULATOR === "true" || !event.data) return;
    try {
      const deadline = new Date(
        event.data.data().deadline.toDate().getTime() - marginTime * 60 * 1000
      );
      await createTask(
        tasksClient.queuePath(projectId, region, queue),
        { goalId: event.params.goalId, marginTime },
        deadline
      );
    } catch (error) {
      logger.error("Error scheduling task", error);
    }
  }
);

export const updateTasksOnPostUpdate = onDocumentUpdated(
  { ...taskOptions, document: "goal/{goalId}" },
  async (event) => {
    if (process.env.FUNCTIONS_EMULATOR === "true" || !event.data) return;

    const before = event.data.before.data();
    const after = event.data.after.data();
    const goalId = event.params.goalId;
    const queuePath = tasksClient.queuePath(projectId, region, queue);

    try {
      if (before.post === null && after.post !== null) {
        await deleteTask(queuePath, goalId);
        return;
      }

      if (before.post !== null && after.post === null) {
        await createTask(
          queuePath,
          { goalId, marginTime },
          after.deadline.toDate()
        );
        return;
      }

      if (
        before.post === null &&
        after.post === null &&
        !before.deadline.isEqual(after.deadline)
      ) {
        await deleteTask(queuePath, goalId);
        await createTask(
          queuePath,
          { goalId, marginTime },
          new Date(after.deadline.toDate().getTime() - marginTime * 60 * 1000)
        );
      }
    } catch (error) {
      logger.error("Error updating notification task", error);
    }
  }
);

export const deleteTasksOnGoalDelete = onDocumentDeleted(
  { ...taskOptions, document: "goal/{goalId}" },
  async (event) => {
    if (process.env.FUNCTIONS_EMULATOR === "true" || !event.data) return;
    try {
      await deleteTask(
        tasksClient.queuePath(projectId, region, queue),
        event.params.goalId
      );
    } catch (error) {
      logger.error("Error deleting notification task", error);
    }
  }
);
