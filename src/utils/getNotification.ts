"use client";
// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.onBackgroundMessage` handler.
import { getMessaging, onMessage } from "firebase/messaging";

if (typeof window !== "undefined") {
  const messaging = getMessaging();
  {
    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      // ...
    });
  }
}
