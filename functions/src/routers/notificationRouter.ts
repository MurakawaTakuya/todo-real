import express, { Request, Response } from "express";
import { logger } from "firebase-functions";
import { GoogleAuth } from "google-auth-library";
import { db } from "../firebaseAdmin";
import { notificationSchema, parseInput } from "../validation";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const input = parseInput(notificationSchema, req.body, res);
  if (!input) return;

  try {
    const goalData = (
      await db.collection("goal").doc(input.goalId).get()
    ).data();
    if (!goalData) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const userData = (
      await db.collection("user").doc(goalData.userId).get()
    ).data();
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
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT_ID;
    if (!projectId) {
      throw new Error("Google Cloud project ID is not configured");
    }

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: userData.fcmToken,
            data: {
              title: `目標の期限まであと${input.marginTime}分です`,
              body: goalData.text,
              icon: "https://todo-real-c28fa.web.app/appIcon.svg",
            },
          },
        }),
      }
    );

    if (!response.ok) {
      logger.error("FCM request failed", await response.json());
      return res.status(502).json({ message: "Error sending notification" });
    }
    return res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    logger.error("Error sending notification", error);
    return res.status(500).json({ message: "Error sending notification" });
  }
});

export default router;
