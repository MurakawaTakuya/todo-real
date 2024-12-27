/* eslint-disable no-undef */

// 通知クリック時の処理
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event);
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      })
  );
});

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

// Firebase アプリを初期化
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// バックグラウンド時の通知を処理(通知自体は何もしなくても受信される)
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);
});
