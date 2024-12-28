import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { logger } from "firebase-functions";
import { Goal, GoalWithId } from "./types";

const router = express.Router();
const db = admin.firestore();

// GET: 全ての目標を取得
router.get("/", async (req: Request, res: Response) => {
  try {
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
      };
    });

    return res.json(goalData);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error fetching goals" });
  }
});

// GET: userIdから目標を取得
router.get("/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const goalSnapshot = await db
      .collection("goal")
      .where("userId", "==", userId)
      .get();

    if (goalSnapshot.empty) {
      return res.status(404).json({ message: "No goals found for this user" });
    }

    const goalData: GoalWithId[] = goalSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        goalId: doc.id,
        userId: data.userId,
        deadline: new Date(data.deadline._seconds * 1000),
        text: data.text,
        post: data.post,
      };
    });

    return res.json(goalData);
  } catch (error) {
    logger.error(error);
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
  } catch (error) {
    logger.error(error);
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

    return res
      .status(201)
      .json({ message: "Goal created successfully", goalId });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error creating goal" });
  }
});

// PUT: 目標を更新
router.put("/:goalId", async (req: Request, res: Response) => {
  const goalId = req.params.goalId;
  const { userId, deadline, text }: Partial<Goal> = req.body;

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
    return res.json({ message: "Goal updated successfully", goalId });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error updating goal" });
  }
});

// DELETE: 目標を削除
router.delete("/:goalId", async (req: Request, res: Response) => {
  const goalId = req.params.goalId;

  if (!goalId) {
    return res.status(400).json({ message: "Goal ID is required" });
  }

  try {
    await db.collection("goal").doc(goalId).delete();
    return res.json({ message: "Goal deleted successfully", goalId });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error deleting goal" });
  }
});

export default router;
