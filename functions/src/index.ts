/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import serviceAccount from "./serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const region = "asia-northeast1";

export const helloWorld = onRequest({ region: region }, (req, res) => {
  logger.info("Hello log!", { structuredData: true });
  res.send("Hello World!");
});
