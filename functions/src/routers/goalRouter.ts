import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { logger } from "firebase-functions";
import { getHttpRequestData, getRequestData } from "..";
import { Goal, GoalWithId } from "../types";

const router = express.Router();
const db = admin.firestore();

// GET: 全ての目標を取得
router.get("/", async (req: Request, res: Response) => {
  try {
    logger.info({
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    const goalSnapshot = await db.collection("goal").get();

    if (goalSnapshot.empty) {
      return res.status(404).json({ message: "No goals found" });
    }

    const goalData: GoalWithId[] = goalSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        goalId: doc.id,
        deadline: new Date(data.deadline._seconds * 1000),
        userId: data.userId,
        text: data.text,
        post: data.post,
        reaction: data.reaction ?? null,
      };
    });

    return res.json(goalData);
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(500).json({ message: "Error fetching goals" });
  }
});

// GET: userIdから目標を取得
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    logger.info({
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });

    const goalSnapshot = await db
      .collection("goal")
      .where("userId", "==", userId)
      .get();

    if (goalSnapshot.empty) {
      return res
        .status(404)
        .json({ message: "No goals found for this user", userId });
    }

    const goalData: GoalWithId[] = goalSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        goalId: doc.id,
        userId: data.userId,
        deadline: new Date(data.deadline._seconds * 1000),
        text: data.text,
        post: data.post,
        reaction: data.reaction ?? null,
      };
    });

    return res.json(goalData);
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(500).json({ message: "Error fetching goals" });
  }
});

// POST: 新しい目標を作成
router.post("/", async (req: Request, res: Response) => {
  let userId: Goal["userId"];
  let deadline: Goal["deadline"];
  let text: Goal["text"];

  try {
    ({ userId, deadline, text } = req.body as Goal);
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

  if (!userId || !deadline || !text) {
    return res
      .status(400)
      .json({ message: "userId, deadline, and text are required" });
  }

  const goalId = db.collection("goal").doc().id;

  try {
    await db
      .collection("goal")
      .doc(goalId)
      .set({
        userId: userId,
        deadline: admin.firestore.Timestamp.fromDate(new Date(deadline)),
        text: text,
        post: null,
      });

    logger.info({
      message: "Goal created successfully",
      goalId,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res
      .status(201)
      .json({ message: "Goal created successfully", goalId });
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(500).json({ message: "Error creating goal" });
  }
});

// PUT: 目標を更新
router.put("/:goalId", async (req: Request, res: Response) => {
  const goalId = req.params.goalId;
  logger.info({
    httpRequest: getHttpRequestData(req),
    requestLog: getRequestData(req),
  });
  const { userId, deadline, text }: Partial<Goal> = req.body;

  if (!goalId) {
    return res.status(400).json({ message: "goalId is required" });
  }

  if (!userId && !deadline && !text) {
    return res.status(400).json({
      message: "At least one of userId, deadline, or text is required",
    });
  }

  const updateData: Partial<Omit<Goal, "deadline">> & {
    deadline?: admin.firestore.Timestamp;
  } = {};
  if (userId) {
    updateData.userId = userId;
  }
  if (deadline) {
    updateData.deadline = admin.firestore.Timestamp.fromDate(
      new Date(deadline)
    );
  }
  if (text) {
    updateData.text = text;
  }

  try {
    await db.collection("goal").doc(goalId).update(updateData);
    logger.info({
      message: "Goal updated successfully",
      goalId,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.json({ message: "Goal updated successfully", goalId });
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(500).json({ message: "Error updating goal" });
  }
});

// DELETE: 目標を削除
router.delete("/:goalId", async (req: Request, res: Response) => {
  try {
    const goalId = req.params.goalId;
    logger.info({
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });

    if (!goalId) {
      return res.status(400).json({ message: "goalId is required" });
    }

    const goalRef = db.collection("goal").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // storageから画像を削除
    const storedId = goalDoc.data()?.post?.storedId;
    if (storedId) {
      try {
        const bucket = admin.storage().bucket();
        const file = bucket.file(`post/${storedId}`);
        await file.delete();
        logger.info("Image deleted successfully:", storedId);
      } catch (error) {
        logger.error({
          error: `Error deleting image: ${error}`,
          httpRequest: getHttpRequestData(req),
          requestLog: getRequestData(req),
        });
        return res.status(500).json({ message: "Error deleting image" });
      }
    }

    await goalRef.delete();
    logger.info({
      message: "Goal deleted successfully",
      goalId,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.json({ message: "Goal deleted successfully", goalId });
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(500).json({ message: "Error deleting goal" });
  }
});

export default router;
