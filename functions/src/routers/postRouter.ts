import express, { Request, Response } from "express";
import admin from "firebase-admin";

const router = express.Router();
const db = admin.firestore();

interface Post {
  userId: string;
  storeId: string;
  text: string;
  goalId: string;
}

// GET: 全ての投稿を取得
router.get("/", async (req: Request, res: Response) => {
  try {
    const postSnapshot = await db.collection("post").get();
    if (postSnapshot.empty) {
      return res.status(404).json({ message: "No posts found" });
    }

    const posts = postSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching posts", error });
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

    const posts = postSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(posts);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching user's posts", error });
  }
});

// POST: 新しい投稿を作成し、画像をStorageに保存
router.post("/", async (req: Request, res: Response) => {
  const postId = db.collection("post").doc().id; // FirebaseのドキュメントIDを生成

  let userId: Post["userId"];
  let storeId: Post["storeId"];
  let text: Post["text"];
  let goalId: Post["goalId"];

  try {
    ({ userId, storeId, text, goalId } = req.body);
  } catch (error) {
    return res.status(400).json({ message: "Invalid request body", error });
  }

  if (!userId || !storeId || !goalId) {
    return res
      .status(400)
      .json({ message: "userId, storeId, text, and goalId are required" });
  }
  if (!text) {
    text = "";
  }

  try {
    await db.collection("post").doc(postId).set({
      userId,
      storeId,
      text,
      goalId,
    });

    return res.json({ message: "Post created successfully", postId });
  } catch (error) {
    return res.status(500).json({ message: "Error creating post", error });
  }
});

// PUT: 投稿を更新
router.put("/:postId", async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const { userId, storeId, text, goalId }: Partial<Post> = req.body;

  if (!userId && !storeId && !text && !goalId) {
    return res
      .status(400)
      .json({ message: "At least one field is required to update" });
  }

  const updateData: Partial<Post> = {};
  if (userId) updateData.userId = userId;
  if (storeId) updateData.storeId = storeId;
  if (text) updateData.text = text;
  if (goalId) updateData.goalId = goalId;

  try {
    await db.collection("post").doc(postId).update(updateData);
    return res.json({ message: "Post updated successfully", postId });
  } catch (error) {
    return res.status(500).json({ message: "Error updating post", error });
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
    return res.status(500).json({ message: "Error deleting post", error });
  }
});

export default router;
