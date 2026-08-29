import express, { Request, Response } from "express";
import { logger } from "firebase-functions";
import { db, Timestamp } from "../firebaseAdmin";
import { countCompletedGoals, countFailedGoals, getStreak } from "../status";
import { GoalWithIdAndUserData, User } from "../types";
import { getHttpRequestData, getRequestData } from "../requestLog";
import {
  documentIdSchema,
  parseInput,
  resultQuerySchema,
} from "../validation";
import { getUserFromId } from "./userRouter";

const router = express.Router();

const getResults = async (
  limit: number,
  offset: number,
  userId?: string,
  onlyPending = false,
  onlyFinished = false
) => {
  let baseQuery = db.collection("goal").limit(limit).offset(offset);
  let failedBaseQuery = db.collection("goal").limit(100);

  if (userId) {
    if (!(await getUserFromId(userId)).exists) {
      throw new UserNotFoundError();
    }
    baseQuery = baseQuery.where("userId", "==", userId);
    failedBaseQuery = failedBaseQuery.where("userId", "==", userId);
  }

  const now = Timestamp.now();
  const pendingResults: GoalWithIdAndUserData[] = [];
  const successResults: GoalWithIdAndUserData[] = [];
  const failedResults: GoalWithIdAndUserData[] = [];
  const userList = new Map<string, User>();

  if (onlyPending || (!onlyPending && !onlyFinished)) {
    const pendingSnapshot = await baseQuery
      .where("post", "==", null)
      .where("deadline", ">", now)
      .orderBy("deadline", "asc")
      .get();
    pendingResults.push(...(await processGoals(pendingSnapshot.docs, userList)));
  }

  if (onlyFinished || (!onlyPending && !onlyFinished)) {
    const completedSnapshot = await baseQuery
      .where("post", "!=", null)
      .orderBy("post.submittedAt", "desc")
      .get();
    const earliestSubmittedAt = completedSnapshot.docs
      .map((doc) => doc.data().post.submittedAt)
      .sort((a, b) => a.toMillis() - b.toMillis())[0];

    if (earliestSubmittedAt) {
      const failedSnapshot = await failedBaseQuery
        .where("post", "==", null)
        .where("deadline", "<=", now)
        .where("deadline", ">", earliestSubmittedAt)
        .orderBy("deadline", "desc")
        .get();
      successResults.push(
        ...(await processGoals(completedSnapshot.docs, userList))
      );
      failedResults.push(...(await processGoals(failedSnapshot.docs, userList)));
    }
  }

  return { successResults, failedResults, pendingResults };
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
      userData = {
        name: userDoc.data()?.name || "Unknown user",
        completed: await countCompletedGoals(userId),
        failed: await countFailedGoals(userId),
        streak: await getStreak(userId),
      };
      userList.set(userId, userData);
    }
    const post = data.post;
    results.push({
      goalId: doc.id,
      userId,
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

router.get("/:userId?", async (req: Request, res: Response) => {
  const query = parseInput(resultQuerySchema, req.query, res);
  if (!query) return;
  let userId: string | undefined;
  if (req.params.userId) {
    const parsedUserId = parseInput(
      documentIdSchema,
      req.params.userId,
      res
    );
    if (!parsedUserId) return;
    userId = parsedUserId;
  }

  logger.info({
    httpRequest: getHttpRequestData(req),
    requestLog: getRequestData(req),
  });
  try {
    return res.json(
      await getResults(
        query.limit,
        query.offset,
        userId,
        query.onlyPending === "true",
        query.onlyFinished === "true"
      )
    );
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return res.status(404).json({ message: "User not found" });
    }
    logger.error({ error, httpRequest: getHttpRequestData(req) });
    return res.status(500).json({ message: "Error fetching results" });
  }
});

/** Signals that a requested user document does not exist. */
class UserNotFoundError extends Error {}

export default router;
