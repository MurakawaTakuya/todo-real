import express, { Request, Response } from "express";
import admin from "firebase-admin";
import multer from "multer";

const router = express.Router();
const db = admin.firestore();
const bucket = admin.storage().bucket();
const upload = multer({ storage: multer.memoryStorage() }); // メモリ内に一時保存

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
router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  const postId = db.collection("post").doc().id; // 新しいpostIdを生成
  const storeId = postId; // storeIdはpostIdと同じに設定

  let userId: Post["userId"];
  let text: Post["text"];
  let goalId: Post["goalId"];

  try {
    ({ userId, text, goalId } = req.body as Post);

    // ファイルがアップロードされていない場合はエラーを返す
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Invalid request body", error });
  }

  if (!userId || !text || !goalId) {
    return res
      .status(400)
      .json({ message: "userId, text, and goalId are required" });
  }

  // Firebase Storage にファイルを保存
  const fileName = `post/${storeId}`;
  const file = bucket.file(fileName);
  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  stream.on("error", (error) => {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file", error });
  });

  stream.on("finish", async () => {
    try {
      await file.makePublic(); // ファイルをパブリックにして URL を取得
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Firestore に post ドキュメントを作成
      await db.collection("post").doc(postId).set({
        userId: userId,
        storeId: storeId,
        text: text,
        goalId: goalId,
      });

      return res.status(201).json({
        message: "Post created successfully",
        postId,
        imageUrl: publicUrl,
      });
    } catch (error) {
      return res.status(500).json({ message: "Error creating post", error });
    }
  });

  stream.end(req.file.buffer);

  return res.status(200).json({ message: "File upload initiated" });
});

export default router;
