import { CloudTasksClient } from "@google-cloud/tasks";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {
  onDocumentCreated,
  onDocumentDeleted,
} from "firebase-functions/v2/firestore";
import { GoogleAuth } from "google-auth-library";

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

    const goalData = event.data.data();
    const marginTime = 2;
    // 期限のmarginTime分前にタスクを設定
    const deadline = new Date(
      goalData.deadline.toDate().getTime() - marginTime * 60 * 1000
    );

    const postData = {
      message: {
        token:
          "fd4ptLB2gtB723MpYwCn_l:APA91bGKC_dl7HI2bQm-6igwifY6SNd6K3OUUy1GAz2RFNyp8qVfx5Z9_P9k16UcswEiHDgA7Sh4IDHyN-TOYsktmqOidc247y4UFv42Bm2lJVQ0UUbX_js", // 通知を送信する端末のトークン
        notification: {
          title: `${marginTime}分以内に目標を完了し写真をアップロードしましょう!`,
          body: "ここにやることのテキストhogehogehogehogehogehogehogehogehogehogehogehogehogehogehogehoge",
        },
      },
    };

    try {
      const auth = new GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      });
      const accessToken = await auth.getAccessToken();

      await tasksClient.createTask({
        parent: queuePath,
        task: {
          name: `${queuePath}/tasks/${goalId}`, // タスクの名前をgoalIdに設定
          httpRequest: {
            httpMethod: "POST",
            url: `https://fcm.googleapis.com//v1/projects/${projectId}/messages:send`,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: Buffer.from(JSON.stringify(postData)).toString("base64"),
          },
          scheduleTime: { seconds: Math.floor(deadline.getTime() / 1000) },
        },
      });
      logger.info("Task created for goalId:", goalId);
    } catch (error) {
      logger.info("Error scheduling task:", error);
    }
  }
);

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

export const deleteTasksOnPostCreate = onDocumentCreated(
  {
    region: region,
    document: "post/{postId}",
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

    try {
      const postData = event.data.data();
      const goalId = postData.goalId;
      const queuePath = tasksClient.queuePath(projectId, region, queue);
      const taskName = `${queuePath}/tasks/${goalId}`; // goalIdが名前になっているタスクを削除
      await tasksClient.deleteTask({ name: taskName });
      logger.info("Task deleted for goalId:", goalId);
    } catch (error) {
      logger.info("Error deleting task:", error);
    }
  }
);
