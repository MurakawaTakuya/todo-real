"use client";
import { messaging } from "@/app/firebase";
import { onMessage } from "firebase/messaging";

// フォアグラウンド時の通知を受信
if (typeof window !== "undefined" && messaging) {
  {
    try {
      onMessage(messaging, (payload) => {
        console.log("Received foreground message:", payload);
        if (payload.data) {
          const { title, body, icon } = payload.data;
          const notification = new Notification(title ?? "Default Title", {
            body,
            icon,
          });
          notification.onclick = () => {
            window.focus();
          };
        }
      });
    } catch (error) {
      console.error("Error while receiving foreground message:", error);
    }
  }
}

// バックグラウンド通知はService Worker(messaging-sw.js)で処理
