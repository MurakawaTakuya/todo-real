import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { GoalWithId, SuccessResult } from "./types";

const router = express.Router();
const db = admin.firestore();

const getResults = async (
  limit: number,
  offset: number,
  userId?: string,
  onlyPast?: boolean, // 過去の結果のみ取得
  onlyFuture?: boolean // 未来の結果のみ取得
) => {
  let goalQuery = db.collection("goal").limit(limit).offset(offset);
  if (userId) {
    goalQuery = goalQuery.where("userId", "==", userId);
  }
  // TODO: 日本時間に合っているか確認
  if (onlyPast) {
    console.log("onlyPast");
    goalQuery = goalQuery.where("deadline", "<", new Date());
  }
  if (onlyFuture) {
    console.log("onlyFuture");
    goalQuery = goalQuery.where("deadline", ">", new Date());
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

// GET: 全ての目標または特定のユーザーの目標に対する結果を取得
router.get("/:userId?", async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const limit = req.query.limit ? Number(req.query.limit) : 10; // 取得数
  const offset = req.query.offset ? Number(req.query.offset) : 0; // 開始位置
  const onlyPast = req.query.onlyPast !== undefined; // 過去の結果のみ取得
  const onlyFuture = req.query.onlyFuture !== undefined; // 未来の結果のみ取得
  console.log(onlyPast, onlyFuture);
  if (offset < 0) {
    res.status(400).json({ message: "Offset must be a positive number" });
  }
  if (limit < 1) {
    res.status(400).json({ message: "Limit must be more than zero" });
  }

  try {
    const results = await getResults(
      limit,
      offset,
      userId,
      onlyPast,
      onlyFuture
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
