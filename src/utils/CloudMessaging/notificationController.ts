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
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Unable to get permission to notify.");
      return;
    }

    console.log("Notification permission granted.");
    const registration = await navigator.serviceWorker
      .register("/messaging-sw.js")
      .then(() => navigator.serviceWorker.ready);

    console.log("Service Worker registered:", registration);
    if (!messaging) {
      console.error("Firebase messaging is not initialized.");
      return;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!currentToken) {
      console.log(
        "No registration token available. Request permission to generate one."
      );
      return;
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
      console.error("Failed to register FCM token");
    } else {
      console.log("FCM token registered successfully");
    }
  } catch (err) {
    console.error("An error occurred while requesting permission:", err);
  }
}

// 通知を解除する
export async function revokePermission(userId: string): Promise<void> {
  if (typeof window === "undefined") {
    console.error("This function must be run in a browser environment.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.unregister();
      }
    } else {
      console.log("No subscription found.");
    }

    console.log("Notification permission revoked.");

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
    } else {
      console.log("FCM token cleared successfully");
    }
  } catch (err) {
    console.error("An error occurred while revoking permission:", err);
  }
}
