/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import helmet from "helmet";
import serviceAccount from "./serviceAccountKey.json";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: "todo-real-c28fa.appspot.com",
});

const app = express();
app.use(cors({ origin: true }));
app.use(helmet());
app.use(cors());
app.use(express.json());

// 10分間で最大300回に制限
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 1000,
  })
);
// 1時間で最大1000回に制限
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
  })
);

import goalRouter from "./routers/goalRouter";
import postRouter from "./routers/postRouter";
import userRouer from "./routers/userRouter";
app.use("/user", userRouer);
app.use("/goal", goalRouter);
app.use("/post", postRouter);

// Cloud Functionsにデプロイする関数
const region = "asia-northeast1";

export const helloWorld = onRequest({ region: region }, (req, res) => {
  logger.info("Hello log!", { structuredData: true });
  res.send("Hello World!");
});

export const firestore = onRequest({ region: region }, async (req, res) => {
  app(req, res);
});
