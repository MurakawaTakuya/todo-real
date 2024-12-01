import express, { Request, Response } from "express";
import admin from "firebase-admin";

const router = express.Router();
const db = admin.firestore();

interface Goal {
  userId: string;
  deadline: Date;
  text: string;
}

// GET: 全ての目標を取得
router.get("/", async (req: Request, res: Response) => {
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
router.post("/", async (req: Request, res: Response) => {
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
    await db
      .collection("goal")
      .doc(goalId)
      .set({
        userId: userId,
        deadline: admin.firestore.Timestamp.fromDate(new Date(deadline)),
        text: text,
      });

    return res
      .status(201)
      .json({ message: "Goal created successfully", goalId });
  } catch (error) {
    return res.status(500).json({ message: "Error creating goal", error });
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
  } = {}; // 型エラーが出たため書き方変更
  if (userId) updateData.userId = userId;
  if (deadline)
    updateData.deadline = admin.firestore.Timestamp.fromDate(
      new Date(deadline)
    );
  if (text) updateData.text = text;

  try {
    await db.collection("goal").doc(goalId).update(updateData);
    return res.json({ message: "Goal updated successfully", goalId });
  } catch (error) {
    return res.status(500).json({ message: "Error updating goal", error });
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
    return res.status(500).json({ message: "Error deleting goal", error });
  }
});

export default router;
