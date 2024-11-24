importScripts(
  "https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js"
);

// Firebase アプリの設定
const firebaseConfig = {
  apiKey: "AIzaSyDiKclIxRlcZMBevj5ZlJ1tG5s9opNhQkE",
  authDomain: "todo-real-c28fa.firebaseapp.com",
  projectId: "todo-real-c28fa",
  storageBucket: "todo-real-c28fa.firebasestorage.app",
  messagingSenderId: "525849418012",
  appId: "1:525849418012:web:9abf3c10d5553f39a902d9",
  measurementId: "G-ZLSZV42KFZ",
};

// Firebase アプリを初期化
firebase.initializeApp(firebaseConfig);

// Firebase Messaging のインスタンスを取得
const messaging = firebase.messaging();
messaging.onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  // ...
});

// バックグラウンドメッセージを処理
messaging.onBackgroundMessage((payload) => {
  console.log("[custom-sw.js] Received background message:", payload);

  // 通知の内容を設定
  const notificationTitle = payload.notification?.title || "Default Title";
  const notificationOptions = {
    body: payload.notification?.body || "Default Body",
    icon: payload.notification?.icon || "/firebase-logo.png", // カスタムアイコンのパス
  };

  // 通知を表示
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// // 通知クリック時のカスタム処理
// self.addEventListener("notificationclick", (event) => {
//   console.log("[custom-sw.js] Notification click received:", event);
//   event.notification.close(); // 通知を閉じる

//   // ユーザーを指定したページに遷移させる
//   event.waitUntil(
//     clients.openWindow("https://your-app-url.com") // リダイレクト先の URL を指定
//   );
// });
