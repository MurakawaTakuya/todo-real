import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { PostWithGoalId } from "./types";

const router = express.Router();
const db = admin.firestore();

// GET: 全ての投稿を取得
router.get("/", async (req: Request, res: Response) => {
  try {
    const goalSnapshot = await db.collection("goal").get();

    if (goalSnapshot.empty) {
      return res.status(404).json({ message: "No goals found" });
    }

    const postData: PostWithGoalId[] = [];

    for (const goalDoc of goalSnapshot.docs) {
      const goalData = goalDoc.data();
      if (goalData.post) {
        postData.push({
          goalId: goalDoc.id,
          userId: goalData.post.userId,
          storedURL: goalData.post.storedURL,
          text: goalData.post.text,
          submittedAt: goalData.post.submittedAt.toDate(),
        });
      }
    }

    if (postData.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }

    return res.json(postData);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching posts" });
  }
});

// GET: userIdから投稿を取得
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

    const postData: PostWithGoalId[] = [];

    for (const goalDoc of goalSnapshot.docs) {
      const goalData = goalDoc.data();
      if (goalData.post) {
        postData.push({
          goalId: goalDoc.id,
          userId: goalData.post.userId,
          storedURL: goalData.post.storedURL,
          text: goalData.post.text,
          submittedAt: goalData.post.submittedAt.toDate(),
        });
      }
    }

    return res.json(postData);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching posts" });
  }
});

// POST: 新しい投稿を作成
router.post("/", async (req: Request, res: Response) => {
  let userId: string;
  let storedURL: PostWithGoalId["storedURL"];
  let text: PostWithGoalId["text"];
  let goalId: PostWithGoalId["goalId"];
  let submittedAt: PostWithGoalId["submittedAt"];

  try {
    ({ userId, storedURL, text = "", goalId, submittedAt } = req.body);
  } catch (error) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  if (!userId || !storedURL || !goalId || !submittedAt) {
    return res.status(400).json({
      message: "userId, storedURL, goalId, and submittedAt are required",
    });
  }

  try {
    const goalRef = db.collection("goal").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ message: "Goal not found" });
    }

    await goalRef.update({
      post: {
        userId,
        storedURL,
        text,
        submittedAt: new Date(submittedAt),
      },
    });

    return res
      .status(201)
      .json({ message: "Post created successfully", goalId });
  } catch (error) {
    return res.status(500).json({ message: "Error creating post" });
  }
});

// DELETE: 投稿を削除
router.delete("/:goalId", async (req: Request, res: Response) => {
  const goalId = req.params.goalId;

  try {
    const goalRef = db.collection("goal").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ message: "Goal not found" });
    }

    await goalRef.update({
      post: admin.firestore.FieldValue.delete(),
    });

    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting post" });
  }
});

export default router;
