import express, { Request, Response } from "express";
import admin from "firebase-admin";

const router = express.Router();
const db = admin.firestore();

interface User {
  name: string;
  streak: number;
}

// GET: userIdに基づいてユーザー情報を取得するエンドポイント
router.route("/id/:userId").get(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const userDoc = await getUserFromId(userId);
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user data", error });
  }
});

// GET: userNameに基づいてユーザー情報を取得するエンドポイント
router.route("/name/:userName").get(async (req: Request, res: Response) => {
  const userName = req.params.userName;

  if (!userName) {
    return res.status(400).json({ message: "User name is required" });
  }

  try {
    const userSnapshot = await getUserFromName(userName);
    if (userSnapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(userData[0]);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user data", error });
  }
});

// GET: 全てのユーザーデータを取得するエンドポイント(アカウント機能を作成したら廃止)
router.route("/").get(async (req: Request, res: Response) => {
  try {
    const userSnapshot = await db.collection("user").get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: "No users found" });
    }

    const userData = userSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(userData);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user data", error });
  }
});

// POST: 新しいユーザーを登録するエンドポイント
router.route("/").post(async (req: Request, res: Response) => {
  const userId = db.collection("user").doc().id; // FirebaseのドキュメントIDを生成

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  let name: User["name"];
  let streak: User["streak"];

  try {
    ({ name, streak = 0 } = req.body as User);
  } catch (error) {
    return res.status(400).json({ message: "Invalid request body", error });
  }

  if (!name || streak === undefined) {
    return res.status(400).json({ message: "name and streak are required" });
  }

  // すでに同じ名前のuserが存在する場合はエラーを返す
  const userSnapshot = await getUserFromName(name);

  if (!userSnapshot.empty) {
    return res.status(409).json({
      message: `A user with the same user name '${name}' already exists`,
    });
  }

  try {
    // userIdをドキュメント名として使用してデータを保存
    await db.collection("user").doc(userId).set({
      name: name,
      streak: streak,
    });

    return res
      .status(201)
      .json({ message: "User created successfully", userId });
  } catch (error) {
    return res.status(500).json({ message: "Error creating user", error });
  }
});

export default router;

// ユーザー名からユーザー情報を取得
const getUserFromName = async (userName: string) => {
  return await db.collection("user").where("name", "==", userName).get();
};

const getUserFromId = async (userId: string) => {
  return await db.collection("user").doc(userId).get();
};
