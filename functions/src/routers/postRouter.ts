import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { Post } from "./types";

const router = express.Router();
const db = admin.firestore();

// GET: 全ての投稿を取得
router.get("/", async (req: Request, res: Response) => {
  try {
    const postSnapshot = await db.collection("post").get();

    if (postSnapshot.empty) {
      return res.status(404).json({ message: "No posts found" });
    }

    const postData: Post[] = postSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        postId: doc.id,
        userId: data.userId,
        storedId: data.storedId,
        text: data.text,
        goalId: data.goalId,
        submittedAt: new Date(data.submittedAt._seconds * 1000),
      };
    });

    return res.json(postData);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching posts" });
  }
});

// GET: userIdから投稿を取得
router.get("/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const postSnapshot = await db
      .collection("post")
      .where("userId", "==", userId)
      .get();
    if (postSnapshot.empty) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    const posts = postSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        postId: doc.id,
        userId: data.userId,
        storedId: data.storedId,
        text: data.text,
        goalId: data.goalId,
        submittedAt: new Date(data.submittedAt._seconds * 1000),
      };
    });

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user's posts" });
  }
});

// POST: 新しい投稿を作成し、画像をStorageに保存
router.post("/", async (req: Request, res: Response) => {
  const postId = db.collection("post").doc().id;

  let userId: Post["userId"];
  let storedId: Post["storedId"];
  let text: Post["text"];
  let goalId: Post["goalId"];
  let submittedAt: Post["submittedAt"];

  try {
    ({ userId, storedId, text, goalId, submittedAt } = req.body);
  } catch (error) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  if (!userId || !storedId || !goalId || !submittedAt) {
    return res.status(400).json({
      message: "userId, storedId, text, goalId, and submittedAt are required",
    });
  }

  if (!text) {
    text = "";
  }

  try {
    await db
      .collection("post")
      .doc(postId)
      .set({
        userId,
        storedId,
        text,
        goalId,
        submittedAt: admin.firestore.Timestamp.fromDate(new Date(submittedAt)),
      });

    return res.json({ message: "Post created successfully", postId });
  } catch (error) {
    return res.status(500).json({ message: "Error creating post" });
  }
});

// PUT: 投稿を更新
router.put("/:postId", async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const { userId, storedId, text, goalId }: Partial<Post> = req.body;

  if (!userId && !storedId && !text && !goalId) {
    return res.status(400).json({
      message: "At least one of userId, storedId, text, or goalId is required",
    });
  }

  const updateData: Partial<Post> = {};
  if (userId) {
    updateData.userId = userId;
  }
  if (storedId) {
    updateData.storedId = storedId;
  }
  if (text) {
    updateData.text = text;
  }
  if (goalId) {
    updateData.goalId = goalId;
  }

  try {
    await db.collection("post").doc(postId).update(updateData);
    return res.json({ message: "Post updated successfully", postId });
  } catch (error) {
    return res.status(500).json({ message: "Error updating post" });
  }
});

// DELETE: 投稿を削除
router.delete("/:postId", async (req: Request, res: Response) => {
  const postId = req.params.postId;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    await db.collection("post").doc(postId).delete();
    return res.json({ message: "Post deleted successfully", postId });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting post" });
  }
});

export default router;
