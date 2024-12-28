import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { logger } from "firebase-functions";
import { User } from "./types";

const router = express.Router();
const db = admin.firestore();

// GET: 全てのユーザーデータを取得
router.get("/", async (req: Request, res: Response) => {
  try {
    const userSnapshot = await db.collection("user").get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: "No users found" });
    }

    const userData: User[] = userSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userId: doc.id,
        name: data.name,
        streak: data.streak,
      };
    });

    return res.json(userData);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error fetching user data" });
  }
});

// GET: userIdからユーザー情報を取得
router.get("/id/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const userDoc = await getUserFromId(userId);

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = userDoc.data();

    const userData: User & { userId: string } = {
      userId: userDoc.id,
      name: data?.name || "",
      streak: data?.streak || 0,
    };

    return res.json(userData);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error fetching user data" });
  }
});

// GET: userNameからユーザー情報を取得
router.get("/name/:userName", async (req: Request, res: Response) => {
  const userName = req.params.userName;

  if (!userName) {
    return res.status(400).json({ message: "User name is required" });
  }

  try {
    const userSnapshot = await getUserFromName(userName);

    if (userSnapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData: User[] = userSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userId: doc.id,
        name: data.name,
        streak: data.streak,
      };
    });

    return res.json(userData);
  } catch (error) {
    logger.error(error);
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
  } catch (error) {
    logger.error(error);
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

    return res
      .status(201)
      .json({ message: "User created successfully", userId });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error creating user" });
  }
});

// PUT: ユーザー情報を更新
router.put("/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const { name, fcmToken }: Partial<User> = req.body;

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
    return res.json({ message: "User updated successfully", userId });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error updating user" });
  }
});

// DELETE: ユーザーを削除
router.delete("/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    await db.collection("user").doc(userId).delete();
    return res.json({ message: "User deleted successfully", userId });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error deleting user" });
  }
});

export default router;

// ユーザー名からユーザー情報を取得
const getUserFromName = async (userName: string) => {
  return await db.collection("user").where("name", "==", userName).get();
};

const getUserFromId = async (userId: string) => {
  return await db.collection("user").doc(userId).get();
};
