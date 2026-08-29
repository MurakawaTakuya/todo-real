import cors from "cors";
import express from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { HttpsError, onRequest } from "firebase-functions/v2/https";
import { beforeUserCreated } from "firebase-functions/v2/identity";
import { logger } from "firebase-functions";
import helmet from "helmet";
import { db } from "./firebaseAdmin";
import { verifyAppCheckToken } from "./middleware/security";
import goalRouter from "./routers/goalRouter";
import notificationRouter from "./routers/notificationRouter";
import postRouter from "./routers/postRouter";
import reactionRouter from "./routers/reactionRouter";
import resultRouter from "./routers/resultRouter";
import userRouter from "./routers/userRouter";

const region = "asia-northeast1";
const apiRuntimeServiceAccount =
  "todo-real-api-runtime@todo-real-c28fa.iam.gserviceaccount.com";
const notificationRuntimeServiceAccount =
  "todo-real-notification-runtime@todo-real-c28fa.iam.gserviceaccount.com";
const taskInvokerServiceAccount =
  "todo-real-task-invoker@todo-real-c28fa.iam.gserviceaccount.com";

const allowedOrigins = [
  /^https:\/\/todo-real-c28fa\.web\.app$/,
  /^https:\/\/todo-real-c28fa\.firebaseapp\.com$/,
  /^https:\/\/todo-real-c28fa--[a-z0-9-]+\.web\.app$/,
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,
];

export const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed =
        !origin || allowedOrigins.some((pattern) => pattern.test(origin));
      callback(null, allowed);
    },
  })
);
app.use(express.json({ limit: "32kb", strict: true }));
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip || "unknown"),
  })
);
app.use(verifyAppCheckToken);

app.use("/user", userRouter);
app.use("/goal", goalRouter);
app.use("/post", postRouter);
app.use("/result", resultRouter);
app.use("/reaction", reactionRouter);

app.use((_req, res) => res.status(404).json({ message: "Not found" }));
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error("Unhandled API error", { error, path: req.path });
    if (error instanceof SyntaxError) {
      return res.status(400).json({ message: "Invalid JSON" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
);

export const firestore = onRequest(
  {
    region,
    serviceAccount: apiRuntimeServiceAccount,
    maxInstances: 10,
    concurrency: 40,
  },
  app
);

export const deadlineNotification = onRequest(
  {
    region,
    serviceAccount: notificationRuntimeServiceAccount,
    invoker: [taskInvokerServiceAccount],
    maxInstances: 3,
    concurrency: 10,
  },
  (() => {
    const notificationApp = express();
    notificationApp.use(notificationRouter);
    return notificationApp;
  })()
);

export {
  createTasksOnGoalCreate,
  deleteTasksOnGoalDelete,
  updateTasksOnPostUpdate,
} from "./tasks";

export const beforecreated = beforeUserCreated(
  { region, serviceAccount: apiRuntimeServiceAccount },
  async (event) => {
    const user = event.data;
    if (!user) {
      throw new HttpsError("invalid-argument", "No user data provided");
    }

    try {
      await db.collection("user").doc(user.uid).set(
        {
          name: user.displayName || "No Name",
          streak: 0,
          fcmToken: "",
        },
        { merge: true }
      );
    } catch (error) {
      logger.error("Error creating user profile", error);
      throw new HttpsError("internal", "Error creating user data");
    }
  }
);

export { getHttpRequestData, getRequestData } from "./requestLog";
