import express, { Request, Response } from "express";
import { logger } from "firebase-functions";
import { countCompletedGoals, countFailedGoals, getStreak } from "../status";
import { db } from "../firebaseAdmin";
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
  userCreateSchema,
  userUpdateSchema,
} from "../validation";

const router = express.Router();
const allowInitialProfileSetup = requireFirebaseAuth({
  allowUnverifiedEmail: true,
});

router.get("/", async (req: Request, res: Response) => {
  try {
    logger.info({
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    const userSnapshot = await db.collection("user").get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: "No users found" });
    }

    const userData = await Promise.all(
      userSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userId = doc.id;
        return {
          userId,
          name: data.name,
          completed: await countCompletedGoals(userId),
          failed: await countFailedGoals(userId),
          streak: await getStreak(userId),
        };
      })
    );
    return res.json(userData);
  } catch (error) {
    logger.error({ error, httpRequest: getHttpRequestData(req) });
    return res.status(500).json({ message: "Error fetching user data" });
  }
});

router.get("/id/:userId", async (req: Request, res: Response) => {
  const userId = parseInput(documentIdSchema, req.params.userId, res);
  if (!userId) return;

  try {
    const userDoc = await getUserFromId(userId);
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }
    const data = userDoc.data();
    return res.json({
      userId,
      name: data?.name || "Unknown user",
      completed: await countCompletedGoals(userId),
      failed: await countFailedGoals(userId),
      streak: await getStreak(userId),
    });
  } catch (error) {
    logger.error({ error, httpRequest: getHttpRequestData(req) });
    return res.status(500).json({ message: "Error fetching user data" });
  }
});

router.post(
  "/",
  allowInitialProfileSetup,
  authenticatedWriteRateLimit,
  async (req: Request, res: Response<unknown, AuthenticatedLocals>) => {
    const input = parseInput(userCreateSchema, req.body, res);
    if (!input) return;
    const { uid } = getAuthenticatedUser(res);

    try {
      await db.collection("user").doc(uid).set(
        { name: input.name, fcmToken: input.fcmToken, streak: 0 },
        { merge: true }
      );
      return res
        .status(201)
        .json({ message: "User created successfully", userId: uid });
    } catch (error) {
      logger.error({ error, httpRequest: getHttpRequestData(req) });
      return res.status(500).json({ message: "Error creating user" });
    }
  }
);

router.put(
  "/:userId",
  allowInitialProfileSetup,
  authenticatedWriteRateLimit,
  async (req: Request, res: Response<unknown, AuthenticatedLocals>) => {
    const userId = parseInput(documentIdSchema, req.params.userId, res);
    const input = parseInput(userUpdateSchema, req.body, res);
    if (!userId || !input) return;

    const { uid } = getAuthenticatedUser(res);
    if (userId !== uid) {
      return res.status(403).json({ message: "Cannot update another user" });
    }

    try {
      await db.collection("user").doc(uid).set(input, { merge: true });
      return res.json({ message: "User updated successfully", userId: uid });
    } catch (error) {
      logger.error({ error, httpRequest: getHttpRequestData(req) });
      return res.status(500).json({ message: "Error updating user" });
    }
  }
);

router.delete(
  "/:userId",
  allowInitialProfileSetup,
  authenticatedWriteRateLimit,
  async (req: Request, res: Response<unknown, AuthenticatedLocals>) => {
    const userId = parseInput(documentIdSchema, req.params.userId, res);
    if (!userId) return;
    const { uid } = getAuthenticatedUser(res);
    if (userId !== uid) {
      return res.status(403).json({ message: "Cannot delete another user" });
    }

    try {
      const userRef = db.collection("user").doc(uid);
      if (!(await userRef.get()).exists) {
        return res.status(404).json({ message: "User not found" });
      }
      await userRef.delete();
      return res.json({ message: "User deleted successfully", userId: uid });
    } catch (error) {
      logger.error({ error, httpRequest: getHttpRequestData(req) });
      return res.status(500).json({ message: "Error deleting user" });
    }
  }
);

export default router;

export const getUserFromName = async (userName: string) =>
  db.collection("user").where("name", "==", userName).get();

export const getUserFromId = async (userId: string) =>
  db.collection("user").doc(userId).get();
