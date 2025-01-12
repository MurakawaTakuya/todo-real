import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { logger } from "firebase-functions";
import { countCompletedGoals, countFailedGoals, getStreak } from "../status";
import { GoalWithIdAndUserData, User } from "../types";
import { getUserFromId } from "./userRouter";

const router = express.Router();
const db = admin.firestore();

const getResults = async (
  res: Response,
  limit: number,
  offset: number,
  userId?: string,
  onlyPending = false,
  onlyFinished = false
) => {
  let baseQuery = db.collection("goal").limit(limit).offset(offset);

  if (userId) {
    const userDoc = await getUserFromId(userId);
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }
    baseQuery = baseQuery.where("userId", "==", userId);
  }

  if (onlyPending && onlyFinished) {
    return res.status(400).json({
      message:
        "Cannot set both 'onlyPending' and 'onlyFinished'. Please set only one of 'onlyPending' or 'onlyFinished', or leave both false.",
    });
  }

  const now = admin.firestore.Timestamp.now();

  const pendingResults: GoalWithIdAndUserData[] = [];
  const successResults: GoalWithIdAndUserData[] = [];
  const failedResults: GoalWithIdAndUserData[] = [];

  const userList = new Map<string, User>(); // ユーザー情報のキャッシュ

  if (onlyPending || (!onlyPending && !onlyFinished)) {
    const pendingSnapshot = await baseQuery
      .where("post", "==", null)
      .where("deadline", ">", now)
      .orderBy("deadline", "asc") // 古いものが先
      .get();

    const pendingGoals = await processGoals(pendingSnapshot.docs, userList);
    pendingResults.push(...pendingGoals);
  }

  if (onlyFinished || (!onlyPending && !onlyFinished)) {
    const completedSnapshot = await baseQuery
      .where("post", "!=", null)
      .orderBy("post.submittedAt", "desc") // 新しいものが先
      .get();

    const failedSnapshot = await baseQuery
      .where("post", "==", null)
      .where("deadline", "<=", now)
      .orderBy("deadline", "desc") // 新しいものが先
      .get();

    const completedResults = await processGoals(
      completedSnapshot.docs,
      userList
    );
    const failedResultsTemp = await processGoals(failedSnapshot.docs, userList);

    successResults.push(...completedResults);
    failedResults.push(...failedResultsTemp);
  }

  return {
    successResults,
    failedResults,
    pendingResults,
  };
};

const processGoals = async (
  docs: FirebaseFirestore.QueryDocumentSnapshot[],
  userList: Map<string, User>
) => {
  const results: GoalWithIdAndUserData[] = [];

  for (const doc of docs) {
    const data = doc.data();
    const userId = data.userId;

    let userData = userList.get(userId);
    if (!userData) {
      const userDoc = await db.collection("user").doc(userId).get();
      const totalCompletedGoals = await countCompletedGoals(userId);
      const totalFailedGoals = await countFailedGoals(userId);
      const streak = await getStreak(userId);

      userData = userDoc.data() as User;
      userData = {
        name: userData?.name || "Unknown user",
        completed: totalCompletedGoals,
        failed: totalFailedGoals,
        streak,
      };
      userList.set(userId, userData);
    }

    const post = data.post;
    results.push({
      goalId: doc.id,
      userId: data.userId,
      deadline: data.deadline.toDate(),
      text: data.text,
      post: post && {
        text: post.text,
        storedId: post.storedId,
        submittedAt: post.submittedAt.toDate(),
      },
      reaction: data.reaction || null,
      userData,
    });
  }

  return results;
};

// GET: 全ての目標または特定のユーザーの目標に対する結果を取得
router.get("/:userId?", async (req: Request, res: Response) => {
  const userId = req.params.userId;

  let limit = parseInt(req.query.limit as string) || 10;
  if (limit < 1 || limit > 100) {
    limit = 100;
  }
  const offset = parseInt(req.query.offset as string) || 0;
  const onlyPending = req.query.onlyPending === "true"; // デフォルト: false
  const onlyFinished = req.query.onlyFinished === "true"; // デフォルト: false

  try {
    const results = await getResults(
      res,
      limit,
      offset,
      userId,
      onlyPending,
      onlyFinished
    );
    return res.json(results);
  } catch (error) {
    logger.info(error);
    return res.status(500).json({ message: "Error fetching results" });
  }
});

export default router;
