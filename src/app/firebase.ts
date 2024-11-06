/* eslint-disable @typescript-eslint/no-unused-vars */
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLxm_wzrLxPrSypwC9ph8ftGEwF99yVLM",
  authDomain: "todo-real-c28fa.firebaseapp.com",
  projectId: "todo-real-c28fa",
  storageBucket: "todo-real-c28fa.firebasestorage.app",
  messagingSenderId: "525849418012",
  appId: "1:525849418012:web:9abf3c10d5553f39a902d9",
  measurementId: "G-ZLSZV42KFZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
