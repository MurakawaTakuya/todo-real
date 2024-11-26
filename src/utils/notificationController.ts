"use client";
import { messaging } from "@/app/firebase";
import { getToken } from "firebase/messaging";

// 通知を受信する
export function requestPermission() {
  if (typeof window === "undefined") {
    return;
  }

  console.log("Requesting permission...");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");

      navigator.serviceWorker
        .register("/messaging-sw.js")
        .then(() => {
          return navigator.serviceWorker.ready;
        })
        .then((registration) => {
          console.log("Service Worker registered:", registration);
          if (!messaging) {
            return;
          }

          return getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
          });
        })
        .then((currentToken) => {
          if (currentToken) {
            // ここでサーバーにトークンを送信したり、UIを更新
            console.log("currentToken:", currentToken);
            // ここでクリップボードにコピー
            navigator.clipboard.writeText(currentToken);
          } else {
            // ここでパーミッションリクエストUIを表示
            console.log(
              "No registration token available. Request permission to generate one."
            );
          }
        })
        .catch((err) => {
          console.error("An error occurred while retrieving token. ", err);
        });
    } else {
      console.log("Unable to get permission to notify.");
    }
  });
}

// 通知を解除する
export function revokePermission() {
  if (typeof window === "undefined") {
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => {
      return registration.pushManager.getSubscription();
    })
    .then((subscription) => {
      if (subscription) {
        // サブスクリプションが存在する場合に解除
        return subscription.unsubscribe();
      } else {
        console.log("No subscription found.");
      }
    })
    .then(() => {
      console.log("Notification permission revoked.");
    })
    .catch((err) => {
      console.error("An error occurred while revoking permission. ", err);
    });
}
