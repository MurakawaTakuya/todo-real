"use client";
import {
  requestPermission,
  revokePermission,
} from "@/utils/CloudMessaging/notificationController";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import Snackbar from "@mui/material/Snackbar";
import { useEffect, useState } from "react";

export default function Notification() {
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
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        {isNotificationActive ? (
          <Button
            variant="contained"
            onClick={handleDisableNotification}
            disabled={!isNotificationActive}
          >
            通知を解除
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleEnableNotification}
            disabled={notificationTokenGenerating || isNotificationActive}
            startIcon={
              notificationTokenGenerating ? (
                <CircularProgress size={20} />
              ) : null
            }
          >
            通知を受信
          </Button>
        )}
      </Box>
      <CssBaseline enableColorScheme />
      <Snackbar
        open={!!notificationMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={3000}
        onClose={() => setNotificationMessage(null)}
      >
        <Alert severity="info">{notificationMessage}</Alert>
      </Snackbar>
    </>
  );
}
