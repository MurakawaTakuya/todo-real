"use client";
import { appCheckToken, functionsEndpoint, messaging } from "@/app/firebase";
import { getToken } from "firebase/messaging";

// 通知を受信する
export async function requestPermission(userId: string): Promise<void> {
  if (typeof window === "undefined") {
    console.error("This function must be run in a browser environment.");
    return;
  }

  console.log("Requesting permission...");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permission denied");
  }
  console.log("Notification permission granted.");

  const registration = await navigator.serviceWorker
    .register("/messaging-sw.js")
    .then(() => navigator.serviceWorker.ready);

  console.log("Service Worker registered:", registration);
  if (!messaging) {
    throw new Error("Firebase messaging is not initialized");
  }

  const currentToken = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!currentToken) {
    throw new Error("No registration token available");
  }

  console.log("currentToken:", currentToken);

  const response = await fetch(`${functionsEndpoint}/user/${userId}`, {
    method: "PUT",
    headers: {
      "X-Firebase-AppCheck": appCheckToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fcmToken: currentToken }),
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
