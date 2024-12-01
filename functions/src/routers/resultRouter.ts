import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { GoalWithId, SuccessResult } from "./types";

const router = express.Router();
const db = admin.firestore();

const getResults = async (limit: number, offset: number, userId?: string) => {
  let goalQuery = db.collection("goal").limit(limit).offset(offset);
  if (userId) {
    goalQuery = goalQuery.where("userId", "==", userId);
  }
  const goalSnapshot = await goalQuery.get();

  const goals = goalSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      goalId: doc.id,
      userId: data.userId,
      deadline: new Date(data.deadline._seconds * 1000),
      text: data.text,
    };
  }) as GoalWithId[];

  if (!goals || goals.length === 0) {
    return { successResults: [], failedOrPendingResults: [] };
  }

  const postSnapshot = await db
    .collection("post")
    .where(
      "goalId",
      "in",
      goals.map((goal) => goal.goalId)
    )
    .get();

  const successResults: SuccessResult[] = [];
  const failedOrPendingResults: GoalWithId[] = [];
  goals.forEach((goal) => {
    const post = postSnapshot.docs.find(
      (doc) => doc.data().goalId === goal.goalId
    );
    if (post) {
      const postData = post.data();
      const submittedAt = postData.submittedAt.toDate();
      if (submittedAt > goal.deadline) {
        failedOrPendingResults.push(goal);
      } else {
        successResults.push({
          userId: goal.userId,
          goalId: goal.goalId,
          postId: post.id,
          goalText: goal.text,
          postText: postData.text,
          storedId: postData.storedId,
          deadline: goal.deadline,
          submittedAt: submittedAt,
        });
      }
    } else {
      failedOrPendingResults.push(goal);
    }
  });

  return { successResults, failedOrPendingResults };
};

// GET: 全ての目標に対する結果を取得
router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10; // 取得数
    const offset = req.query.offset ? Number(req.query.offset) : 0; // 開始位置
    if (offset < 0) {
      res.status(400).json({ message: "Offset must be a positive number" });
    }
    if (limit < 1) {
      res.status(400).json({ message: "Limit must be more than zero" });
    }

    const results = await getResults(limit, offset);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET: userIdから結果を取得
router.get("/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
  }

  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10; // 取得数
    const offset = req.query.offset ? Number(req.query.offset) : 0; // 開始位置
    if (offset < 0) {
      res.status(400).json({ message: "Offset must be a positive number" });
    }
    if (limit < 1) {
      res.status(400).json({ message: "Limit must be more than zero" });
    }

    const results = await getResults(limit, offset, userId);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
