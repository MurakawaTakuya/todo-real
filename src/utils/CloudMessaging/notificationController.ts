"use client";
import { functionsEndpoint, messaging } from "@/app/firebase";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { getToken } from "firebase/messaging";
import getAppCheckToken from "../getAppCheckToken";

// 通知を受信する
export async function requestPermission(userId: string): Promise<void> {
  if (typeof window === "undefined") {
    console.error("This function must be run in a browser environment.");
    return;
  }

  // 通知の許可を取得
  console.log("Requesting permission...");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permission denied");
  }
  console.log("Notification permission granted.");

  // Service Workerの登録
  const registration = await navigator.serviceWorker
    .register("/messaging-sw.js")
    .then(() => navigator.serviceWorker.ready);

  console.log("Service Worker registered:", registration);
  if (!messaging) {
    throw new Error("Firebase messaging is not initialized");
  }

  // トークンの取得
  const notificationToken = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!notificationToken) {
    throw new Error("No registration token available");
  }

  console.log("currentToken:", notificationToken);

  const appCheckToken = await getAppCheckToken().catch((error) => {
    showSnackBar({
      message: error.message,
      type: "warning",
    });
    return "";
  });

  if (!appCheckToken) {
    showSnackBar({
      message:
        "App Checkの初期化に失敗しました。debug tokenがサーバーに登録されていることを確認してください。",
      type: "warning",
    });
    return;
  }

  // トークンをFirestoreに登録
  const response = await fetch(`${functionsEndpoint}/user/${userId}`, {
    method: "PUT",
    headers: {
      "X-Firebase-AppCheck": appCheckToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fcmToken: notificationToken }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to register FCM token:", errorText);
    throw new Error("Failed to register FCM token");
  }

  console.log("FCM token registered successfully");
}

// 通知を解除する
export async function revokePermission(userId: string): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("This function must be run in a browser environment.");
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  // 通知を解除
  if (subscription) {
    await subscription.unsubscribe();
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.unregister();
    }
    console.log("Notification permission revoked.");
  } else {
    console.log("No subscription found");
  }

  const appCheckToken = await getAppCheckToken().catch((error) => {
    showSnackBar({
      message: error.message,
      type: "warning",
    });
    return "";
  });

  if (!appCheckToken) {
    showSnackBar({
      message:
        "App Checkの初期化に失敗しました。debug tokenがサーバーに登録されていることを確認してください。",
      type: "warning",
    });
    return;
  }

  // トークンをFirestoreから削除
  const response = await fetch(`${functionsEndpoint}/user/${userId}`, {
    method: "PUT",
    headers: {
      "X-Firebase-AppCheck": appCheckToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fcmToken: "" }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to clear FCM token:", errorText);
    throw new Error("Failed to clear FCM token");
  }

  console.log("FCM token cleared successfully");
}
