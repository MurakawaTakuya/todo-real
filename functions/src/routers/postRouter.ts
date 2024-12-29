import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { logger } from "firebase-functions";
import { updateStreak } from "../status";
import { PostWithGoalId } from "../types";

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
          userId: goalData.userId,
          text: goalData.post.text,
          storedURL: goalData.post.storedURL,
          submittedAt: goalData.post.submittedAt.toDate(),
        });
      }
    }

    if (postData.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }

    return res.json(postData);
  } catch (error) {
    logger.error(error);
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
          userId: goalData.userId,
          text: goalData.post.text,
          storedURL: goalData.post.storedURL,
          submittedAt: goalData.post.submittedAt.toDate(),
        });
      }
    }

    return res.json(postData);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error fetching user's posts" });
  }
});

// POST: 新しい投稿を作成
router.post("/", async (req: Request, res: Response) => {
  let goalId: PostWithGoalId["goalId"];
  let text: PostWithGoalId["text"];
  let storedURL: PostWithGoalId["storedURL"];
  let submittedAt: PostWithGoalId["submittedAt"];

  try {
    ({ goalId, text = "", storedURL, submittedAt } = req.body);
  } catch (error) {
    logger.error(error);
    return res.status(400).json({ message: "Invalid request body" });
  }

  if (!goalId || !storedURL || !submittedAt) {
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

    // streakを更新
    const goalData = goalDoc.data();
    if (goalData?.userId) {
      await updateStreak(goalData.userId);
    }

    await goalRef.update({
      post: {
        text,
        storedURL,
        submittedAt: new Date(submittedAt),
      },
    });

    return res
      .status(201)
      .json({ message: "Post created successfully", goalId });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error creating post" });
  }
});

// DELETE: 投稿を削除
router.delete("/:goalId", async (req: Request, res: Response) => {
  try {
    const goalId = req.params.goalId;

    if (!goalId) {
      return res.status(400).json({ message: "Goal ID is required" });
    }

    const goalRef = db.collection("goal").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Storageから画像を削除
    const storedURL = goalDoc.data()?.post?.storedURL;
    if (storedURL) {
      try {
        const bucket = admin.storage().bucket();
        const file = bucket.file(`post/${storedURL}`);
        await file.delete();
        logger.info("Image deleted successfully:", storedURL);
      } catch (error) {
        logger.error("Error deleting image:", error);
        return res.status(500).json({ message: "Error deleting image" });
      }
    }

    await goalRef.update({
      post: null,
    });

    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error deleting post" });
  }
});

export default router;
