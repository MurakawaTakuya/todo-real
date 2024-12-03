import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import helmet from "helmet";
import serviceAccount from "./serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: "todo-real-c28fa.appspot.com",
});

import goalRouter from "./routers/goalRouter";
import postRouter from "./routers/postRouter";
import resultRouter from "./routers/resultRouter";
import userRouer from "./routers/userRouter";

const app = express();
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
    res
      .status(400)
      .send({ message: "Authentication error: App Check token is missing." });
  }

  try {
    const decodedToken = await admin
      .appCheck()
      .verifyToken(appCheckToken as string);
    console.log("Verified App Check Token:", decodedToken);
    next();
  } catch (error) {
    console.error("Invalid App Check token:", error);
    res.status(401).send("Invalid App Check token.");
  }
};

// Postmanを使うためにCloud FunctionsのApp Checkは開発環境では使用しない
if (process.env.NODE_ENV === "production") {
  app.use(verifyAppCheckToken);
}

// 10分間で最大300回に制限
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1000,
  })
);
// 1時間で最大1000回に制限
app.use(
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
  })
);

app.use("/user", userRouer);
app.use("/goal", goalRouter);
app.use("/post", postRouter);
app.use("/result", resultRouter);

const region = "asia-northeast1";

export const helloWorld = onRequest({ region: region }, (req, res) => {
  logger.info("Hello log!", { structuredData: true });
  res.send("Hello World!");
});

export const firestore = onRequest({ region: region }, async (req, res) => {
  app(req, res);
});
