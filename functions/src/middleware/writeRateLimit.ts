import { RequestHandler, Response } from "express";
import { logger } from "firebase-functions";
import { db, Timestamp } from "../firebaseAdmin";
import { AuthenticatedLocals } from "./security";

const WINDOWS = [
  { name: "10m", durationMs: 10 * 60 * 1000, max: 60 },
  { name: "1h", durationMs: 60 * 60 * 1000, max: 200 },
] as const;

export const authenticatedWriteRateLimit: RequestHandler = async (
  _req,
  res: Response<unknown, AuthenticatedLocals>,
  next
) => {
  const uid = res.locals.auth?.uid;
  if (!uid) {
    return res.status(401).json({ message: "Authentication is required" });
  }

  const now = Date.now();
  const counters = WINDOWS.map((window) => {
    const bucketStart = Math.floor(now / window.durationMs) * window.durationMs;
    return {
      ...window,
      bucketStart,
      ref: db
        .collection("_securityRateLimits")
        .doc(`${uid}_${window.name}_${bucketStart}`),
    };
  });

  try {
    const retryAfterSeconds = await db.runTransaction(async (transaction) => {
      const snapshots = await Promise.all(
        counters.map((counter) => transaction.get(counter.ref))
      );

      for (let index = 0; index < counters.length; index += 1) {
        const count = Number(snapshots[index].data()?.count || 0);
        if (count >= counters[index].max) {
          const resetAt = counters[index].bucketStart + counters[index].durationMs;
          return Math.max(1, Math.ceil((resetAt - now) / 1000));
        }
      }

      counters.forEach((counter, index) => {
        const count = Number(snapshots[index].data()?.count || 0);
        transaction.set(
          counter.ref,
          {
            uid,
            count: count + 1,
            expiresAt: Timestamp.fromMillis(
              counter.bucketStart + counter.durationMs * 2
            ),
          },
          { merge: true }
        );
      });
      return 0;
    });

    if (retryAfterSeconds > 0) {
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        message: "Too many write requests, please try again later",
      });
    }

    return next();
  } catch (error) {
    logger.error("Failed to apply distributed write rate limit", error);
    return res.status(503).json({ message: "Rate limiter unavailable" });
  }
};
