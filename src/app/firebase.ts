import { Analytics, getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from "firebase/auth";
import { getMessaging, Messaging } from "firebase/messaging";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
let messaging: Messaging | null = null;
let analytics: Analytics | null = null;

// クライアントサイドでのみ実行する初期化
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
  analytics = getAnalytics(app);
}

export const googleProvider = new GoogleAuthProvider();

// ブラウザを閉じてもログイン状態を維持
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to local.");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// エミュレータの設定
let functionsEndpoint = "";
if (process.env.NODE_ENV === "production") {
  console.log("Storage: Production");
  console.log("Authentication: Production");
  functionsEndpoint = "https://firestore-okdtj725ta-an.a.run.app";
  console.log("Functions: Production");
} else {
  connectStorageEmulator(storage, "localhost", 9199);
  console.log("Storage: Emulator");
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  console.log("Authentication: Emulator");
  functionsEndpoint =
    "http://127.0.0.1:5001/todo-real-c28fa/asia-northeast1/firestore";
  console.log("Functions: Emulator");
}

export { analytics, functionsEndpoint, messaging };
console.log("firebaseConfig initialized");
