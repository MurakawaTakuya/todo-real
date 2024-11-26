"use client";
import { messaging } from "@/app/firebase";
import { onMessage } from "firebase/messaging";

// フォアグラウンド時の通知を受信
if (typeof window !== "undefined" && messaging) {
  {
    onMessage(messaging, (payload) => {
      console.log("Received foreground message:", payload);
      if (payload.notification) {
        const { title, body } = payload.notification;
        const notification = new Notification(title ?? "Default Title", {
          body,
        });
        notification.onclick = () => {
          window.focus();
        };
      }
    });
  }
}

// バックグラウンド通知はService Worker(messaging-sw.js)で処理
