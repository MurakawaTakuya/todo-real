import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { logger } from "firebase-functions";
import { getHttpRequestData, getRequestData } from "..";
import { countCompletedGoals, countFailedGoals, getStreak } from "../status";
import { User } from "../types";

const router = express.Router();
const db = admin.firestore();

// GET: 全てのユーザーデータを取得
router.get("/", async (req: Request, res: Response) => {
  try {
    logger.info({
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    const userSnapshot = await db.collection("user").get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: "No users found" });
    }

    const userData: User[] = await Promise.all(
      userSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userId = doc.id;
        const totalCompletedGoals = await countCompletedGoals(userId);
        const totalFailedGoals = await countFailedGoals(userId);
        const streak = await getStreak(userId);

        return {
          userId,
          name: data.name,
          completed: totalCompletedGoals,
          failed: totalFailedGoals,
          streak,
        };
      })
    );

    return res.json(userData);
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(500).json({ message: "Error fetching user data" });
  }
});

// GET: userIdからユーザー情報を取得
router.get("/id/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    logger.info({
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });

    const userDoc = await getUserFromId(userId);

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = userDoc.data();
    const totalCompletedGoals = await countCompletedGoals(userId);
    const totalFailedGoals = await countFailedGoals(userId);
    const streak = await getStreak(userId);

    const userData: User & { userId: string } = {
      userId: userId,
      name: data?.name || "Unknown user",
      completed: totalCompletedGoals,
      failed: totalFailedGoals,
      streak,
    };

    return res.json(userData);
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(500).json({ message: "Error fetching user data" });
  }
});

// POST: 新しいユーザーを登録
router.post("/", async (req: Request, res: Response) => {
  let userId: string;
  let name: User["name"];
  let fcmToken: User["fcmToken"];

  try {
    ({ name, userId, fcmToken = "" } = req.body);
    logger.info({
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(400).json({ message: "Invalid request body" });
  }

  if (!name || !userId) {
    return res.status(400).json({ message: "name and userId are required" });
  }

  try {
    await db.collection("user").doc(userId).set({
      name: name,
      streak: 0,
      fcmToken: fcmToken,
    });

    logger.info({
      message: "User created successfully",
      userId,
      name,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res
      .status(201)
      .json({ message: "User created successfully", userId });
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(500).json({ message: "Error creating user" });
  }
});

// PUT: ユーザー情報を更新
router.put("/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;
  logger.info({
    httpRequest: getHttpRequestData(req),
    requestLog: getRequestData(req),
  });
  const { name, fcmToken }: Partial<User> = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  if (!name && fcmToken === undefined) {
    return res.status(400).json({
      message: "At least one of name, streak, or fcmToken is required",
    });
  }

  const updateData: Partial<User> = {};
  if (name) {
    updateData.name = name;
  }
  if (fcmToken !== undefined) {
    updateData.fcmToken = fcmToken;
  }

  try {
    await db.collection("user").doc(userId).update(updateData);
    logger.info({
      message: "User updated successfully",
      userId,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.json({ message: "User updated successfully", userId });
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(500).json({ message: "Error updating user" });
  }
});

// DELETE: ユーザーを削除
router.delete("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    logger.info({
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const userRef = db.collection("user").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRef.delete();
    logger.info({
      message: "User deleted successfully",
      userId,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.json({ message: "User deleted successfully", userId });
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(500).json({ message: "Error deleting user" });
  }
});

export default router;

// ユーザー名からユーザー情報を取得
export const getUserFromName = async (userName: string) => {
  return await db.collection("user").where("name", "==", userName).get();
};

export const getUserFromId = async (userId: string) => {
  return await db.collection("user").doc(userId).get();
};
