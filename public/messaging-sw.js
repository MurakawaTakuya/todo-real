/* eslint-disable no-undef */

importScripts(
  "https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js"
);

// Firebase アプリの設定(漏れても問題ない情報)
const firebaseConfig = {
  apiKey: "AIzaSyDiKclIxRlcZMBevj5ZlJ1tG5s9opNhQkE",
  projectId: "todo-real-c28fa",
  messagingSenderId: "525849418012",
  appId: "1:525849418012:web:9abf3c10d5553f39a902d9",
};

console.log(firebaseConfig);

// Firebase アプリを初期化
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// バックグラウンド時の通知を処理
messaging.onBackgroundMessage((payload) => {
  console.log("[messaging-sw.js] Received background message:", payload);
  const notification = payload.notification;
  const notificationTitle = notification?.title || "Default Title";
  const notificationOptions = {
    body: notification?.body || "Default Body",
    icon: notification?.icon || "",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 通知クリック時の処理
self.addEventListener("notificationclick", (event) => {
  console.log("[messaging-sw.js] Notification click received:", event);
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "http://127.0.0.1:8080/" && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("http://127.0.0.1:8080/");
        }
      })
  );
});
