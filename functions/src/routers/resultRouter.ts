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
  if (userId) {
    if (!(await getUserFromId(userId)).exists) {
      throw new UserNotFoundError();
    }
  }

  const snapshot = userId
    ? await db.collection("goal").where("userId", "==", userId).get()
    : await db.collection("goal").get();
  const docs = snapshot.docs;
  const now = Timestamp.now().toMillis();
  const pendingResults: GoalWithIdAndUserData[] = [];
  const successResults: GoalWithIdAndUserData[] = [];
  const failedResults: GoalWithIdAndUserData[] = [];
  const userList = new Map<string, User>();

  if (onlyPending || (!onlyPending && !onlyFinished)) {
    const pendingDocs = docs
      .filter(
        (doc) =>
          doc.data().post === null && doc.data().deadline.toMillis() > now
      )
      .sort(
        (left, right) =>
          left.data().deadline.toMillis() - right.data().deadline.toMillis()
      )
      .slice(offset, offset + limit);
    pendingResults.push(...(await processGoals(pendingDocs, userList)));
  }

  if (onlyFinished || (!onlyPending && !onlyFinished)) {
    const completedDocs = docs
      .filter((doc) => doc.data().post !== null)
      .sort(
        (left, right) =>
          right.data().post.submittedAt.toMillis() -
          left.data().post.submittedAt.toMillis()
      )
      .slice(offset, offset + limit);
    const earliestSubmittedAt = completedDocs
      .map((doc) => doc.data().post.submittedAt.toMillis())
      .sort((left, right) => left - right)[0];

    if (earliestSubmittedAt) {
      const failedDocs = docs
        .filter((doc) => {
          const data = doc.data();
          const deadline = data.deadline.toMillis();
          return (
            data.post === null &&
            deadline <= now &&
            deadline > earliestSubmittedAt
          );
        })
        .sort(
          (left, right) =>
            right.data().deadline.toMillis() -
            left.data().deadline.toMillis()
        )
        .slice(0, 100);
      successResults.push(...(await processGoals(completedDocs, userList)));
      failedResults.push(...(await processGoals(failedDocs, userList)));
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
