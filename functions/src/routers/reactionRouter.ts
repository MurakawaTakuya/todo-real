import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { logger } from "firebase-functions";
import { getHttpRequestData, getRequestData } from "..";
import { Reaction, ReactionTypeMap } from "../types";

const router = express.Router();
const db = admin.firestore();

// PUT: リアクションを更新
router.put("/:goalId", async (req: Request, res: Response) => {
  const goalId = req.params.goalId;
  logger.info({
    httpRequest: getHttpRequestData(req),
    requestLog: getRequestData(req),
  });
  const { userId, reactionType }: Partial<Reaction> = req.body;

  if (!userId || !goalId) {
    return res.status(400).json({
      message: "userID and goalId are required",
    });
  }

  try {
    const goalRef = db.collection("goal").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const goalData = goalDoc.data();

    const currentReactions = goalData?.reaction || {}; // 元のリアクションデータ
    if (!reactionType) {
      // リアクション削除
      delete currentReactions[userId];
    } else {
      // リアクション追加
      // リアクションタイプが正しいか確認
      const validReactionTypes = [
        ...ReactionTypeMap.success,
        ...ReactionTypeMap.failed,
      ];
      if (!validReactionTypes.includes(reactionType)) {
        return res.status(400).json({ message: "Invalid reactionType" });
      }

      currentReactions[userId] = reactionType;
    }

    await goalRef.update({
      ...goalData,
      reaction: currentReactions,
    });

    logger.info({
      message: "Reaction updated successfully",
      goalId,
      userId,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.json({ message: "Reaction updated successfully", goalId });
  } catch (error) {
    logger.error({
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(500).json({ message: "Error updating Reaction" });
  }
});

export default router;
