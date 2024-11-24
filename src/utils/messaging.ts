import { getMessaging, getToken } from "firebase/messaging";

if (typeof window !== "undefined") {
  const messaging = getMessaging();

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");

      navigator.serviceWorker
        .register("/custom-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);

          return getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
          });
        })
        .then((currentToken) => {
          if (currentToken) {
            // ここでサーバーにトークンを送信したり、UIを更新
            console.log("currentToken:", currentToken);
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
