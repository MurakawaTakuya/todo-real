import { getApps, initializeApp } from "firebase-admin/app";
import { getAppCheck } from "firebase-admin/app-check";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const app =
  getApps()[0] ||
  initializeApp({
    storageBucket: "todo-real-c28fa.firebasestorage.app",
  });

export const appCheck = getAppCheck(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { Timestamp };
