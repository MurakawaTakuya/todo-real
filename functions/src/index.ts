import cors from "cors";
import express, { Request } from "express";
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
app.set("trust proxy", false);
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
    await admin.appCheck().verifyToken(appCheckToken as string);
    return next();
  } catch (error) {
    logger.error({
      message: `Invalid App Check token with ${appCheckToken}:`,
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
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
// 1時間で最大500回に制限
app.use(
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 500,
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
  updateTasksOnPostUpdate,
} from "./tasks";

// テスト用API
const helloWorldRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10分
  max: 10, // 最大10回
  keyGenerator: (req) => {
    const key = req.headers["x-forwarded-for"] || req.ip || "unknown";
    return Array.isArray(key) ? key[0] : key;
  },
  handler: (req, res) => {
    return res
      .status(429)
      .json({ message: "Too many requests, please try again later." });
  },
});

export const helloWorld = onRequest({ region: region }, async (req, res) => {
  helloWorldRateLimiter(req, res, async () => {
    logger.info({
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    res.send("Hello World!");
  });
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

// リクエストのheader, parameters, bodyを取得
export const getRequestData = (req: Request) => {
  // requestLog
  return {
    headers: req.headers,
    parameters: {
      query: req.query,
      params: req.params,
    },
    body: req.body,
  };
};

// リクエストのhttp情報を取得
export const getHttpRequestData = (req: Request) => {
  // httpRequest
  const statusCode = req.statusCode || "202";
  return {
    requestMethod: req.method,
    requestUrl: `${req.method} ${statusCode}: ${req.protocol}://${req.get(
      "host"
    )}${req.originalUrl}`,
    status: statusCode,
    userAgent: req.get("User-Agent"),
    remoteIp: req.ip,
    protocol: req.httpVersion ? `HTTP/${req.httpVersion}` : req.protocol,
  };
};
