"use client";
import {
  requestPermission,
  revokePermission,
} from "@/utils/CloudMessaging/notificationController";
import { useUser } from "@/utils/UserContext";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { RoundedButton } from "../Account/LoggedInView";
import { showSnackBar } from "../SnackBar/SnackBar";

export default function NotificationButton({
  defaultDisabled = true,
}: {
  defaultDisabled?: boolean;
}) {
  const { user } = useUser();
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
    if (!user?.userId) {
      showSnackBar({
        message: "ユーザー情報が見つかりません",
        type: "warning",
      });
      return;
    }
    showSnackBar({
      message: "通知を有効化中...",
      type: "normal",
    });
    setNotificationTokenGenerating(true);
    requestPermission()
      .then(() => {
        showSnackBar({
          message: "通知を受信します",
          type: "success",
        });
        setIsNotificationActive(true);
      })
      .catch((error) => {
        console.error("Failed to enable notifications:", error);
        let message =
          "通知の有効化に失敗しました。数秒経過してから再度ボタンを押してください。";
        if (error instanceof Error) {
          if (error.message == "Permission denied") {
            message = "ブラウザ設定からこのサイトの通知を許可してください";
          } else if (error.message == "Firebase messaging is not initialized") {
            message =
              "ページを更新して数秒経過してから再度ボタンを押してください";
          }
        } else {
          message = "不明なエラーが発生しました";
        }
        showSnackBar({
          message,
          type: "warning",
        });
      })
      .finally(() => setNotificationTokenGenerating(false));
  };

  // 通知を無効化
  const handleDisableNotification = () => {
    if (!user?.userId) {
      showSnackBar({
        message: "ユーザー情報が見つかりません",
        type: "warning",
      });
      return;
    }
    revokePermission()
      .then(() => {
        showSnackBar({
          message: "通知を解除しました",
          type: "success",
        });
        setIsNotificationActive(false);
      })
      .catch((error) => {
        console.error("Failed to disable notifications:", error);
        showSnackBar({
          message: "通知の解除に失敗しました",
          type: "warning",
        });
      });
  };

  return (
    <>
      {isNotificationActive ? (
        <RoundedButton
          variant="outlined"
          onClick={handleDisableNotification}
          disabled={!isNotificationActive || defaultDisabled}
        >
          通知を解除
        </RoundedButton>
      ) : (
        <RoundedButton
          variant="outlined"
          onClick={handleEnableNotification}
          disabled={
            notificationTokenGenerating ||
            isNotificationActive ||
            defaultDisabled
          }
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
