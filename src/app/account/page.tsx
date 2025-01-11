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

  // iOSか判定
  useEffect(() => {
    const checkIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      return /iPad|iPhone|iPod/.test(userAgent);
    };
    setIsIOS(checkIOS());
  }, []);

  // PWAか判定
  useEffect(() => {
    const checkPWA = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      );
    };
    setIsPWA(checkPWA());
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
          <Box sx={{ display: "flex", flexDirection: "column" }}>
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
              通知を受信・アプリに追加
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
                    !user?.isMailVerified
                  }
                />
              </div>
            </div>
            {!PWAReady && (
              <Typography color="danger" textAlign="center">
                PWAを準備中です。しばらくしてからページを更新してください。
              </Typography>
            )}
            {(user?.loginType === "Guest" || !user?.isMailVerified) && (
              <Typography color="danger" textAlign="center">
                通知を利用するには認証が必要です。
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
          </Card>
        )}
      </Stack>
    </>
  );
}
