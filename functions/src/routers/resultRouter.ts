import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { GoalWithIdAndUserData, User } from "./types";

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
    const post = data.post;
    return {
      goalId: doc.id,
      userId: data.userId,
      deadline: data.deadline.toDate(),
      text: data.text,
      post: post && {
        userId: post.userId,
        storedURL: post.storedURL,
        text: post.text,
        submittedAt: post.submittedAt.toDate(),
      },
    };
  }) as GoalWithIdAndUserData[];

  if (!goals || goals.length === 0) {
    return { successResults: [], failedResults: [], pendingResults: [] };
  }

  const successResults: GoalWithIdAndUserData[] = [];
  const failedResults: GoalWithIdAndUserData[] = [];
  const pendingResults: GoalWithIdAndUserData[] = [];

  // mapで<userId, userName>のリストを作成し、userNameをキャッシュする
  const userList = new Map<string, User>();

  for (const goal of goals) {
    // userListにあるならば、userNameを取得し、無いならばfirestoreから取得してキャッシュする
    let userData = userList.get(goal.userId);
    if (!userData) {
      const userDoc = await db.collection("user").doc(goal.userId).get();
      userData = userDoc.data() as User;
      userData = {
        name: userData?.name || "Unknown user",
        streak: userData?.streak || 0,
      };
      userList.set(goal.userId, userData);
    }

    const post = goal.post;
    if (post) {
      if (post.submittedAt > goal.deadline) {
        failedResults.push(goal, {
          ...goal,
          userData,
        });
      } else {
        successResults.push({
          ...goal,
          userData,
        });
      }
    } else if (goal.deadline < new Date()) {
      failedResults.push({
        ...goal,
        userData,
      });
    } else {
      pendingResults.push({
        ...goal,
        userData,
      });
    }
  }

  return { successResults, failedResults, pendingResults };
};

// GET: 全ての目標または特定のユーザーの目標に対する結果を取得
router.get("/:userId?", async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const limit = parseInt(req.query.limit as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const results = await getResults(limit, offset, userId);
    return res.json(results);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching results" });
  }
});

export default router;
