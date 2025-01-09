import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { logger } from "firebase-functions";
import { GoogleAuth } from "google-auth-library";

const router = express.Router();
const db = admin.firestore();

// POST: 通知を送信
router.post("/", async (req: Request, res: Response) => {
  let goalId: string;
  let marginTime: number;

  try {
    ({ goalId, marginTime } = req.body);
  } catch (error) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  if (!goalId || !marginTime) {
    return res
      .status(400)
      .json({ message: "goalId and marginTime are required" });
  }

  try {
    // goalIdからgoalを取得
    const goalDoc = await db.collection("goal").doc(goalId).get();
    const goalData = goalDoc.data();

    if (!goalData) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // goalのuserIdからfcmTokenを取得
    const userData = await db
      .collection("user")
      .doc(goalData.userId)
      .get()
      .then((doc) => doc.data());

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userData.fcmToken) {
      return res.status(404).json({ message: "FCM token not found" });
    }

    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const accessToken = await auth.getAccessToken();

    // 通知データを作成
    const projectId = process.env.GCP_PROJECT_ID;
    const postData = {
      message: {
        token: userData.fcmToken,
        data: {
          title: `${marginTime}分以内に目標を完了し写真をアップロードしましょう`,
          body: goalData.text,
          icon: "https://todo-real-c28fa.web.app/appIcon.svg",
        },
      },
    };
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
    logger.info("Sending notification:", goalData.text);

    // 通知を送信
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error("httpRequest error:", errorData);
      return res
        .status(500)
        .json({ message: "Error sending notification", error: errorData });
    }

    const responseData = await response.json();
    logger.info("Notification sent successfully:", responseData);
  } catch (error) {
    logger.error("Error sending notification:", error);
    return res
      .status(500)
      .json({ message: "Error sending notification", error });
  }

  return res.status(200).json({ message: "Notification sent successfully" });
});

export default router;

// logger
// auth
