import express, { Request, Response } from "express";
import { logger } from "firebase-functions";
import { db, storage, Timestamp } from "../firebaseAdmin";
import { getHttpRequestData, getRequestData } from "../requestLog";
import {
  AuthenticatedLocals,
  getAuthenticatedUser,
  requireFirebaseAuth,
} from "../middleware/security";
import { authenticatedWriteRateLimit } from "../middleware/writeRateLimit";
import {
  documentIdSchema,
  goalCreateSchema,
  goalUpdateSchema,
  parseInput,
} from "../validation";

const router = express.Router();
const requireWriter = requireFirebaseAuth();

router.get("/", async (req: Request, res: Response) => {
  try {
    logger.info({
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    const snapshot = await db.collection("goal").get();
    if (snapshot.empty) {
      return res.status(404).json({ message: "No goals found" });
    }
    return res.json(snapshot.docs.map(serializeGoal));
  } catch (error) {
    logger.error({ error, httpRequest: getHttpRequestData(req) });
    return res.status(500).json({ message: "Error fetching goals" });
  }
});

router.get("/:userId", async (req: Request, res: Response) => {
  const userId = parseInput(documentIdSchema, req.params.userId, res);
  if (!userId) return;
  try {
    const snapshot = await db
      .collection("goal")
      .where("userId", "==", userId)
      .get();
    if (snapshot.empty) {
      return res
        .status(404)
        .json({ message: "No goals found for this user", userId });
    }
    return res.json(snapshot.docs.map(serializeGoal));
  } catch (error) {
    logger.error({ error, httpRequest: getHttpRequestData(req) });
    return res.status(500).json({ message: "Error fetching goals" });
  }
});

router.post(
  "/",
  requireWriter,
  authenticatedWriteRateLimit,
  async (req: Request, res: Response<unknown, AuthenticatedLocals>) => {
    const input = parseInput(goalCreateSchema, req.body, res);
    if (!input) return;
    const { uid } = getAuthenticatedUser(res);
    const goalRef = db.collection("goal").doc();

    try {
      await goalRef.set({
        userId: uid,
        deadline: Timestamp.fromDate(input.deadline),
        text: input.text,
        post: null,
        reaction: null,
      });
      return res
        .status(201)
        .json({ message: "Goal created successfully", goalId: goalRef.id });
    } catch (error) {
      logger.error({ error, httpRequest: getHttpRequestData(req) });
      return res.status(500).json({ message: "Error creating goal" });
    }
  }
);

router.put(
  "/:goalId",
  requireWriter,
  authenticatedWriteRateLimit,
  async (req: Request, res: Response<unknown, AuthenticatedLocals>) => {
    const goalId = parseInput(documentIdSchema, req.params.goalId, res);
    const input = parseInput(goalUpdateSchema, req.body, res);
    if (!goalId || !input) return;
    const { uid } = getAuthenticatedUser(res);
    const goalRef = db.collection("goal").doc(goalId);

    try {
      const goalDoc = await goalRef.get();
      if (!goalDoc.exists) {
        return res.status(404).json({ message: "Goal not found" });
      }
      if (goalDoc.data()?.userId !== uid) {
        return res
          .status(403)
          .json({ message: "Cannot update another user's goal" });
      }
      const updateData: Record<string, unknown> = {};
      if (input.text !== undefined) updateData.text = input.text;
      if (input.deadline) {
        updateData.deadline = Timestamp.fromDate(input.deadline);
      }
      await goalRef.update(updateData);
      return res.json({ message: "Goal updated successfully", goalId });
    } catch (error) {
      logger.error({ error, httpRequest: getHttpRequestData(req) });
      return res.status(500).json({ message: "Error updating goal" });
    }
  }
);

router.delete(
  "/:goalId",
  requireWriter,
  authenticatedWriteRateLimit,
  async (req: Request, res: Response<unknown, AuthenticatedLocals>) => {
    const goalId = parseInput(documentIdSchema, req.params.goalId, res);
    if (!goalId) return;
    const { uid } = getAuthenticatedUser(res);
    const goalRef = db.collection("goal").doc(goalId);

    try {
      const goalDoc = await goalRef.get();
      if (!goalDoc.exists) {
        return res.status(404).json({ message: "Goal not found" });
      }
      if (goalDoc.data()?.userId !== uid) {
        return res
          .status(403)
          .json({ message: "Cannot delete another user's goal" });
      }
      const storedId = goalDoc.data()?.post?.storedId;
      if (storedId) {
        await storage
          .bucket()
          .file(`post/${storedId}`)
          .delete({ ignoreNotFound: true });
      }
      await goalRef.delete();
      return res.json({ message: "Goal deleted successfully", goalId });
    } catch (error) {
      logger.error({ error, httpRequest: getHttpRequestData(req) });
      return res.status(500).json({ message: "Error deleting goal" });
    }
  }
);

const serializeGoal = (doc: FirebaseFirestore.QueryDocumentSnapshot) => {
  const data = doc.data();
  return {
    goalId: doc.id,
    deadline: data.deadline.toDate(),
    userId: data.userId,
    text: data.text,
    post: data.post,
    reaction: data.reaction ?? null,
  };
};

export default router;
