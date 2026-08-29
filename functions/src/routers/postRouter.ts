import express, { Request, Response } from "express";
import { logger } from "firebase-functions";
import { db, storage, Timestamp } from "../firebaseAdmin";
import { updateStreak } from "../status";
import { getHttpRequestData, getRequestData } from "../requestLog";
import {
  AuthenticatedLocals,
  getAuthenticatedUser,
  requireFirebaseAuth,
} from "../middleware/security";
import { authenticatedWriteRateLimit } from "../middleware/writeRateLimit";
import {
  documentIdSchema,
  parseInput,
  postUpdateSchema,
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
    const posts = snapshot.docs.flatMap((doc) => {
      const data = doc.data();
      if (!data.post) return [];
      return [
        {
          goalId: doc.id,
          userId: data.userId,
          text: data.post.text,
          storedId: data.post.storedId,
          submittedAt: data.post.submittedAt.toDate(),
        },
      ];
    });
    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }
    return res.json(posts);
  } catch (error) {
    logger.error({ error, httpRequest: getHttpRequestData(req) });
    return res.status(500).json({ message: "Error fetching posts" });
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
    const posts = snapshot.docs.flatMap((doc) => {
      const data = doc.data();
      if (!data.post) return [];
      return [
        {
          goalId: doc.id,
          userId: data.userId,
          text: data.post.text,
          storedId: data.post.storedId,
          submittedAt: data.post.submittedAt.toDate(),
        },
      ];
    });
    return res.json(posts);
  } catch (error) {
    logger.error({ error, httpRequest: getHttpRequestData(req) });
    return res.status(500).json({ message: "Error fetching user's posts" });
  }
});

router.post(
  "/",
  requireWriter,
  authenticatedWriteRateLimit,
  async (req: Request, res: Response<unknown, AuthenticatedLocals>) => {
    const input = parseInput(postUpdateSchema, req.body, res);
    if (!input) return;
    const { uid } = getAuthenticatedUser(res);
    const goalRef = db.collection("goal").doc(input.goalId);

    try {
      const goalDoc = await goalRef.get();
      if (!goalDoc.exists) {
        return res.status(404).json({ message: "Goal not found" });
      }
      const goalData = goalDoc.data();
      if (goalData?.userId !== uid) {
        return res
          .status(403)
          .json({ message: "Cannot update another user's post" });
      }

      const existingStoredId = goalData?.post?.storedId as string | undefined;
      if (
        input.storedId !== existingStoredId &&
        !input.storedId.startsWith(`${uid}/`)
      ) {
        return res.status(400).json({ message: "Invalid storage object owner" });
      }

      const isFirstPost = !goalData?.post;
      await goalRef.update({
        post: {
          text: input.text,
          storedId: input.storedId,
          submittedAt:
            goalData?.post?.submittedAt || Timestamp.now(),
        },
      });
      if (isFirstPost) {
        await updateStreak(uid);
      }
      return res
        .status(201)
        .json({ message: "Post updated successfully", goalId: input.goalId });
    } catch (error) {
      logger.error({ error, httpRequest: getHttpRequestData(req) });
      return res.status(500).json({ message: "Error creating post" });
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
      const goalData = goalDoc.data();
      if (goalData?.userId !== uid) {
        return res
          .status(403)
          .json({ message: "Cannot delete another user's post" });
      }
      const storedId = goalData?.post?.storedId;
      if (storedId) {
        await storage
          .bucket()
          .file(`post/${storedId}`)
          .delete({ ignoreNotFound: true });
      }
      await goalRef.update({ post: null });
      return res.json({ message: "Post deleted successfully", goalId });
    } catch (error) {
      logger.error({ error, httpRequest: getHttpRequestData(req) });
      return res.status(500).json({ message: "Error deleting post" });
    }
  }
);

export default router;
