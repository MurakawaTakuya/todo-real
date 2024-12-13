"use client";
import {
  requestPermission,
  revokePermission,
} from "@/utils/CloudMessaging/notificationController";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { RoundedButton } from "../Account/LoggedInView";
import { showSnackBar } from "../SnackBar/SnackBar";

export default function NotificationButton() {
  const [notificationTokenGenerating, setNotificationTokenGenerating] =
    useState(false);
  const [isNotificationActive, setIsNotificationActive] = useState(false);

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
      showSnackBar({
        message: "通知を受信します",
        type: "success",
      });
      setIsNotificationActive(true);
    });
  };

  // 通知を無効化
  const handleDisableNotification = () => {
    revokePermission();
    showSnackBar({
      message: "通知を解除しました",
      type: "success",
    });
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
    </>
  );
}
