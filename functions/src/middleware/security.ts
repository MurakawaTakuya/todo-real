import { RequestHandler, Response } from "express";
import { logger } from "firebase-functions";
import { DecodedIdToken } from "firebase-admin/auth";
import { appCheck, auth } from "../firebaseAdmin";
import { getHttpRequestData, getRequestData } from "../requestLog";

type AuthOptions = {
  allowAnonymous?: boolean;
  allowUnverifiedEmail?: boolean;
};

export type AuthenticatedLocals = {
  auth?: DecodedIdToken;
};

export const getAuthenticatedUser = (
  res: Response<unknown, AuthenticatedLocals>
): DecodedIdToken => {
  if (!res.locals.auth) {
    throw new Error("Authenticated user is missing from response locals");
  }
  return res.locals.auth;
};

export const verifyAppCheckToken: RequestHandler = async (req, res, next) => {
  if (process.env.FUNCTIONS_EMULATOR === "true") {
    return next();
  }

  const appCheckToken = req.get("X-Firebase-AppCheck");
  if (!appCheckToken) {
    return res.status(401).json({ message: "App Check token is required" });
  }

  try {
    await appCheck.verifyToken(appCheckToken);
    return next();
  } catch (error) {
    logger.warn({
      message: "Invalid App Check token",
      error,
      httpRequest: getHttpRequestData(req),
      requestLog: getRequestData(req),
    });
    return res.status(401).json({ message: "Invalid App Check token" });
  }
};

export const requireFirebaseAuth = (
  options: AuthOptions = {}
): RequestHandler => {
  return async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
    const authorization = req.get("Authorization");
    const match = authorization?.match(/^Bearer ([^\s]+)$/);
    if (!match) {
      return res.status(401).json({ message: "Firebase ID token is required" });
    }

    try {
      const decoded = await auth.verifyIdToken(match[1], true);
      const provider = decoded.firebase?.sign_in_provider;

      if (!options.allowAnonymous && provider === "anonymous") {
        return res.status(403).json({ message: "Anonymous users cannot write" });
      }

      if (
        !options.allowUnverifiedEmail &&
        provider === "password" &&
        decoded.email_verified !== true
      ) {
        return res.status(403).json({ message: "Email verification is required" });
      }

      res.locals.auth = decoded;
      return next();
    } catch (error) {
      logger.warn({
        message: "Invalid Firebase ID token",
        error,
        httpRequest: getHttpRequestData(req),
      });
      return res.status(401).json({ message: "Invalid Firebase ID token" });
    }
  };
};
