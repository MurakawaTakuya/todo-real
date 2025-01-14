import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { Analytics, getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  getToken,
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "firebase/app-check";
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
let appCheckToken = "";

// クライアントサイドでのみ実行する初期化
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
  analytics = getAnalytics(app);

  // 開発環境ならApp Checkを使用しない
  // ステージング環境でApp Checkのデバッグトークンを有効にする
  if (process.env.NODE_ENV !== "development") {
    if (process.env.NEXT_PUBLIC_IS_STAGING === "true") {
      (
        window as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean }
      ).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      console.log("App Check Debug Token Enabled");
    }
    // App Checkの設定
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_SITEKEY as string
      ),
      isTokenAutoRefreshEnabled: true,
    });

    await getToken(appCheck)
      .then((token) => {
        console.log("App Check: Success");
        appCheckToken = token.token;
      })
      .catch((error) => {
        console.log(error.message);
        showSnackBar({
          message:
            "App Checkの初期化に失敗しました。debug tokenがサーバーに登録されていることを確認してください。",
          type: "warning",
        });
      });
  }
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

export { analytics, appCheckToken, functionsEndpoint, messaging };
console.log("firebaseConfig initialized");
