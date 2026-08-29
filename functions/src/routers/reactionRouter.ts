import express, { Request, Response } from "express";
import { logger } from "firebase-functions";
import { db } from "../firebaseAdmin";
import { getHttpRequestData } from "../requestLog";
import {
  AuthenticatedLocals,
  getAuthenticatedUser,
  requireFirebaseAuth,
} from "../middleware/security";
import { authenticatedWriteRateLimit } from "../middleware/writeRateLimit";
import {
  documentIdSchema,
  parseInput,
  reactionUpdateSchema,
} from "../validation";

const router = express.Router();

router.put(
  "/:goalId",
  requireFirebaseAuth(),
  authenticatedWriteRateLimit,
  async (req: Request, res: Response<unknown, AuthenticatedLocals>) => {
    const goalId = parseInput(documentIdSchema, req.params.goalId, res);
    const input = parseInput(reactionUpdateSchema, req.body, res);
    if (!goalId || !input) return;
    const { uid } = getAuthenticatedUser(res);
    const goalRef = db.collection("goal").doc(goalId);

    try {
      await db.runTransaction(async (transaction) => {
        const goalDoc = await transaction.get(goalRef);
        if (!goalDoc.exists) {
          throw new GoalNotFoundError();
        }
        const reactions = {
          ...(goalDoc.data()?.reaction || {}),
        } as Record<string, string>;
        if (input.reactionType) {
          reactions[uid] = input.reactionType;
        } else {
          delete reactions[uid];
        }
        transaction.update(goalRef, {
          reaction: Object.keys(reactions).length > 0 ? reactions : null,
        });
      });
      return res.json({ message: "Reaction updated successfully", goalId });
    } catch (error) {
      if (error instanceof GoalNotFoundError) {
        return res.status(404).json({ message: "Goal not found" });
      }
      logger.error({ error, httpRequest: getHttpRequestData(req) });
      return res.status(500).json({ message: "Error updating reaction" });
    }
  }
);

/** Signals that a requested goal document does not exist. */
class GoalNotFoundError extends Error {}

export default router;
