"use client";
import {
  requestPermission,
  revokePermission,
} from "@/utils/CloudMessaging/notificationController";
import { CssBaseline } from "@mui/material";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import { useEffect, useState } from "react";
import { RoundedButton } from "../Account/LoggedInView";

export default function NotificationButton() {
  const [notificationTokenGenerating, setNotificationTokenGenerating] =
    useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null
  );
  const [isNotificationActive, setIsNotificationActive] = useState(false);

  // メッセージを表示
  const handleShowNotification = (message: string) => {
    setNotificationMessage(message);
  };

  // Service Worker 状態を確認
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          setIsNotificationActive(!!registration.active);
        })
        .catch((error) => {
          console.error("Error checking ServiceWorker status:", error);
        });
    }
  }, []);

  // 通知を有効化
  const handleEnableNotification = () => {
    setNotificationTokenGenerating(true);
    requestPermission(() => {
      setNotificationTokenGenerating(false);
      handleShowNotification("通知を受信しました");
      setIsNotificationActive(true);
    });
  };

  // 通知を無効化
  const handleDisableNotification = () => {
    revokePermission();
    handleShowNotification("通知を解除しました");
    setIsNotificationActive(false);
  };

  return (
    <>
      {isNotificationActive ? (
        <RoundedButton
          variant="outlined"
          onClick={handleDisableNotification}
          disabled={!isNotificationActive}
        >
          通知を解除
        </RoundedButton>
      ) : (
        <RoundedButton
          variant="outlined"
          onClick={handleEnableNotification}
          disabled={notificationTokenGenerating || isNotificationActive}
          startIcon={
            notificationTokenGenerating ? <CircularProgress size={20} /> : null
          }
        >
          通知を受信
        </RoundedButton>
      )}

      <CssBaseline enableColorScheme />
      {/* TODO: 他のページでポップアップを実装したらそれに合わせる */}
      <Snackbar
        open={!!notificationMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
        onClose={() => setNotificationMessage(null)}
      >
        <Alert severity="info">{notificationMessage}</Alert>
      </Snackbar>
    </>
  );
}
