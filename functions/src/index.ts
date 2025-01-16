import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import admin from "firebase-admin";
import { logger } from "firebase-functions";
import { HttpsError, onRequest } from "firebase-functions/v2/https";
import { beforeUserCreated } from "firebase-functions/v2/identity";
import helmet from "helmet";
import serviceAccount from "./serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: "todo-real-c28fa.firebasestorage.app",
});

import goalRouter from "./routers/goalRouter";
import notificationRouter from "./routers/notificationRouter";
import postRouter from "./routers/postRouter";
import reactionRouter from "./routers/reactionRouter";
import resultRouter from "./routers/resultRouter";
import userRouer from "./routers/userRouter";

const app = express();
app.set("trust proxy", true);
app.use(helmet());
app.use(cors());
app.use(express.json());

// App Checkのトークンを検証
const verifyAppCheckToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const appCheckToken = req.get("X-Firebase-AppCheck");

  if (!appCheckToken) {
    return res
      .status(400)
      .send({ message: "Authentication error: App Check token is missing." });
  }

  try {
    const decodedToken = await admin
      .appCheck()
      .verifyToken(appCheckToken as string);
    console.log("Verified App Check Token:", decodedToken);
    return next();
  } catch (error) {
    logger.error(`Invalid App Check token with ${appCheckToken}:`, error);
    return res.status(401).send("Invalid App Check token.");
  }
};

// Postmanを使うためにCloud FunctionsのApp Checkは開発環境では使用しない
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers.token === process.env.NOTIFICATION_KEY) {
      // tasksからの/notificationの場合はスキップ
      return next();
    } else {
      verifyAppCheckToken(req, res, next);
    }
  });
}

// 10分間で最大200回に制限
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 200,
    // keyGenerator: (req) => {
    //   const key = req.headers["x-forwarded-for"] || req.ip || "unknown";
    //   return Array.isArray(key) ? key[0] : key;
    // },
    handler: (req, res) => {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    },
  })
);
// 1時間で最大500回に制限
app.use(
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 500,
    // keyGenerator: (req) => {
    //   const key = req.headers["x-forwarded-for"] || req.ip || "unknown";
    //   return Array.isArray(key) ? key[0] : key;
    // },
    handler: (req, res) => {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    },
  })
);

app.use("/user", userRouer);
app.use("/goal", goalRouter);
app.use("/post", postRouter);
app.use("/result", resultRouter);
app.use("/notification", notificationRouter);
app.use("/reaction", reactionRouter);

const region = "asia-northeast1";

export const firestore = onRequest({ region: region }, async (req, res) => {
  app(req, res);
});

export {
  createTasksOnGoalCreate,
  deleteTasksOnGoalDelete,
  deleteTasksOnPostCreate,
} from "./tasks";

// テスト用API
app.use(
  "/helloWorld",
  rateLimit({
    // 10分に最大10回に制限
    windowMs: 10 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => {
      const key = req.headers["x-forwarded-for"] || req.ip || "unknown";
      return Array.isArray(key) ? key[0] : key;
    },
    handler: (req, res) => {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    },
  })
);

export const helloWorld = onRequest({ region: region }, (req, res) => {
  logger.info("Hello log!", { structuredData: true });
  res.send("Hello World!");
});

const db = admin.firestore();

// アカウント作成時に実行される処理
export const beforecreated = beforeUserCreated(
  { region: region },
  async (event) => {
    const user = event.data;

    if (!user) {
      throw new HttpsError("invalid-argument", "No user data provided.");
    }
    const userId = user?.uid;
    const name = user?.displayName || "No Name";

    try {
      await db.collection("user").doc(userId).set({
        name: name,
        streak: 0,
        fcmToken: "",
      });
      logger.info(`User data created for ${userId}`);
    } catch (error) {
      logger.error(error);
      throw new HttpsError("internal", "Error creating user data.");
    }

    return;
  }
);
