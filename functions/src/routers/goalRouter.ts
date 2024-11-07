import express, { Request, Response } from "express";
import admin from "firebase-admin";

const router = express.Router();
const db = admin.firestore();

// Interface for Goal
interface Goal {
  userId: string;
  deadline: Date;
  text: string;
}

// GET: すべての目標を取得
router.route("/").get(async (req: Request, res: Response) => {
  try {
    const goalSnapshot = await db.collection("goal").get();
    if (goalSnapshot.empty) {
      return res.status(404).json({ message: "No goals found" });
    }

    const goals = goalSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(goals);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching goals", error });
  }
});

// GET: 目標を取得
router.route("/:userId").get(async (req: Request, res: Response) => {
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

    const goals = goalSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(goals);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching goals", error });
  }
});

// POST: 新しい目標を作成
router.route("/").post(async (req: Request, res: Response) => {
  const goalId = db.collection("goal").doc().id; // FirebaseのドキュメントIDを生成

  let userId: Goal["userId"];
  let deadline: Goal["deadline"];
  let text: Goal["text"];

  try {
    ({ userId, deadline, text } = req.body as Goal);
  } catch (error) {
    return res.status(400).json({ message: "Invalid request body", error });
  }

  if (!userId || !deadline || !text) {
    return res
      .status(400)
      .json({ message: "userId, deadline, and text are required" });
  }

  try {
    // goalId をドキュメント名として使用してデータを保存
    await db.collection("goal").doc(goalId).set({
      userId: userId,
      deadline: deadline,
      text: text,
    });

    return res
      .status(201)
      .json({ message: "Goal created successfully", goalId });
  } catch (error) {
    return res.status(500).json({ message: "Error creating goal", error });
  }
});

export default router;
