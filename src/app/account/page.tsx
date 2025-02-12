"use client";
import AuthForm from "@/Components/Account/AuthForm";
import LoggedInView from "@/Components/Account/LoggedInView";
import NotificationButton from "@/Components/NotificationButton/NotificationButton";
import { PWAButton } from "@/Components/PWAButton/PWAButton";
import { useUser } from "@/utils/UserContext";
import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import MuiCard from "@mui/material/Card";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "0 auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  borderRadius: "20px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
}));

export default function Account() {
  const { user } = useUser();
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [PWAReady, setPWAReady] = useState(false);
  const [isNotificationUnavailable, setIsNotificationUnavailable] =
    useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsPWA(
      window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );
    setIsNotificationUnavailable(typeof Notification === "undefined");
  }, []);

  return (
    <>
      <CssBaseline enableColorScheme />
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{ padding: "20px", gap: "20px" }}
      >
        <Card variant="outlined" sx={{ padding: "20px 8% 30px" }}>
          <Typography
            level="h1"
            color="primary"
            textAlign="center"
            fontWeight={700}
          >
            TODO REAL
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {user ? <LoggedInView /> : <AuthForm />}
          </Box>
        </Card>

        {user && (
          <Card variant="outlined" sx={{ padding: "25px 20px 30px" }}>
            <Typography
              level="h3"
              color="primary"
              textAlign="center"
              fontWeight={600}
            >
              アプリに追加・通知を受信
            </Typography>

            <div className={styles.buttonContainer}>
              <div>
                <PWAButton
                  defaultDisabled={isIOS || isPWA}
                  PWAReady={PWAReady}
                  setPWAReady={setPWAReady}
                />
              </div>
              <div>
                <NotificationButton
                  defaultDisabled={
                    (isIOS && !isPWA) ||
                    user?.loginType === "Guest" ||
                    !user?.isMailVerified ||
                    isNotificationUnavailable
                  }
                />
              </div>
            </div>

            {isNotificationUnavailable ? (
              <>
                <Typography color="danger" level="body-sm">
                  この端末ではアプリ機能や通知機能が使用できません。
                  {isIOS && "iOS 16.4以降に更新してください"}
                </Typography>
              </>
            ) : (
              <>
                {!PWAReady && !isPWA && (
                  <Typography color="danger" textAlign="center">
                    PWAを準備中です。しばらくしてからページを更新してください。
                    <br />
                    ブラウザの「ホーム画面に追加」からすぐにインストールすることもできます。
                  </Typography>
                )}
                {user?.loginType === "Guest" && (
                  <Typography color="danger" textAlign="center">
                    ゲストユーザーは通知機能を使用できません。
                  </Typography>
                )}
                {!user?.isMailVerified && (
                  <Typography color="danger" textAlign="center">
                    通知機能を利用するには認証メールを確認してください。
                  </Typography>
                )}

                <Typography>
                  アプリに追加をすると、端末のホーム画面やアプリ一覧から起動できるようになります。
                </Typography>
                <Typography color="neutral" level="body-xs">
                  通知を複数端末で登録した場合は、最後に登録した端末に送信します。
                  <br />
                  通知が受信できない場合はブラウザやサイトの権限を確認してください。
                </Typography>

                {/* iOSのPWAの追加方法 */}
                {isIOS && (
                  <>
                    <Typography color="danger">
                      iOSでは通常ブラウザで通知機能と「アプリに追加」ボタンを使用できません。以下の画像のように「ホーム画面に追加」を押してから、ホーム画面から起動してください。
                    </Typography>
                    <img
                      src="/img/iOSPWA.webp"
                      alt="iOS PWA"
                      style={{ width: "80%", margin: "0 auto" }}
                    />
                  </>
                )}
              </>
            )}
          </Card>
        )}
      </Stack>
    </>
  );
}
