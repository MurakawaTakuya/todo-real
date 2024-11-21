/* eslint-disable @typescript-eslint/no-unused-vars */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
} from "firebase/auth";
import { connectStorageEmulator, getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
console.log("firebaseConfig initialized");
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ブラウザを閉じてもログイン状態を維持
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to local.");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// ログイン状態を監視
onAuthStateChanged(auth, (user) => {
  if (user) {
    const isGoogle = user.providerData.some(
      (profile) => profile.providerId === "google.com"
    );
    const isEmail = user.providerData.some(
      (profile) => profile.providerId === "password"
    );
    const isGuest = user.isAnonymous;

    if (isGoogle) {
      console.log("Googleアカウントでログインしています");
    } else if (isEmail) {
      console.log("メールとパスワードでログインしています");
    } else if (isGuest) {
      console.log("匿名（ゲスト）でログインしています");
    } else {
      console.log("その他の方法でログインしています");
    }
  } else {
    console.log("No user is logged in.", user);
  }
});

// エミュレータの設定
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  connectStorageEmulator(storage, "localhost", 9199);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}
