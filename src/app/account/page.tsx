"use client";
import { auth } from "@/app/firebase";
import {
  requestPermission,
  revokePermission,
} from "@/utils/CloudMessaging/notificationController";
import { createUser } from "@/utils/createUserAuth";
import { loginUser } from "@/utils/loginUserAuth";
import { signInAsGuest } from "@/utils/signInAnonymously";
import { signInWithGoogleAccount } from "@/utils/signInWithGoogleAccount";
import { useUser } from "@/utils/UserContext";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress"; // ローディング用のインジケーターをインポート
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  borderRadius: "20px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
}));

const CenteredToggleButtonGroup = styled(ToggleButtonGroup)({
  display: "flex",
  justifyContent: "center",
  marginBottom: "16px",
});

const RoundedButton = styled(Button)(({ theme }) => ({
  borderRadius: "50px",
  padding: theme.spacing(1.5, 4),
}));

export default function UserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formMode, setFormMode] = useState<"register" | "login">("register");
  const [notificationTokenGenerating, setNotificationTokenGenerating] =
    useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null
  );
  const [isNotificationActive, setIsNotificationActive] = useState(false);

  const { user } = useUser();

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createUser(email, password, name);
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await loginUser(email, password);
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogleAccount();
  };

  const handleGuestLogin = async () => {
    await signInAsGuest();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Signed out");
    } catch (error) {
      console.error("errorCode:", (error as Error)?.name);
      console.error("errorMessage:", (error as Error)?.message);
    }
  };

  const handleFormModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: "register" | "login"
  ) => {
    if (newMode) setFormMode(newMode);
  };

  // メッセージを表示する関数
  const handleShowNotification = (message: string) => {
    setNotificationMessage(message); // メッセージを設定
  };

  // ページ読み込み時に Service Worker 状態を確認
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          setIsNotificationActive(!!registration.active); // active が存在するかで判定
        })
        .catch((error) => {
          console.error("Error checking ServiceWorker status:", error);
        });
    }
  }, []);

  return (
    <>
      <CssBaseline enableColorScheme />
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100vh", padding: 2 }}
      >
        <Card variant="outlined">
          <Typography variant="h4" textAlign="center">
            TODO-REAL
          </Typography>
          {!user && (
            <CenteredToggleButtonGroup
              value={formMode}
              exclusive
              onChange={handleFormModeChange}
              aria-label="form mode"
            >
              <ToggleButton value="register" aria-label="register">
                新規登録
              </ToggleButton>
              <ToggleButton value="login" aria-label="login">
                ログイン
              </ToggleButton>
            </CenteredToggleButtonGroup>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {user ? (
              <>
                <Typography>ログイン中: {user.name}</Typography>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setNotificationTokenGenerating(true);
                      requestPermission(() => {
                        setNotificationTokenGenerating(false);
                        handleShowNotification("通知を受信しました");
                        setIsNotificationActive(true); // 通知状態を有効化
                      });
                    }}
                    disabled={
                      notificationTokenGenerating || isNotificationActive
                    } // 通知状態に基づく
                    startIcon={
                      notificationTokenGenerating ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                  >
                    通知を受信
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => {
                      revokePermission();
                      handleShowNotification("通知を解除しました");
                      setIsNotificationActive(false); // 通知状態を無効化
                    }}
                    disabled={!isNotificationActive} // 通知状態に基づく
                  >
                    通知を解除
                  </Button>
                  <Snackbar
                    open={!!notificationMessage}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    autoHideDuration={3000} // 3秒で自動的に非表示
                    onClose={() => setNotificationMessage(null)} // 非表示時にメッセージをリセット
                  >
                    <Alert severity="info">{notificationMessage}</Alert>
                  </Snackbar>
                </Box>
                <RoundedButton variant="contained" onClick={handleLogout}>
                  ログアウト
                </RoundedButton>
              </>
            ) : formMode === "register" ? (
              <>
                <Typography>新規登録</Typography>
                <form onSubmit={handleRegisterSubmit}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      label="Username"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
                    />
                    <RoundedButton type="submit" variant="contained" fullWidth>
                      アカウント作成
                    </RoundedButton>
                  </Box>
                </form>
              </>
            ) : (
              <>
                <Typography>ログイン</Typography>
                <form onSubmit={handleLoginSubmit}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
                    />
                    <RoundedButton type="submit" variant="contained" fullWidth>
                      ログイン
                    </RoundedButton>
                  </Box>
                </form>
              </>
            )}
            {!user && (
              <>
                <Divider>または</Divider>
                <RoundedButton
                  fullWidth
                  variant="outlined"
                  onClick={handleGoogleLogin}
                >
                  Googleでログイン
                </RoundedButton>
                <RoundedButton
                  fullWidth
                  variant="outlined"
                  onClick={handleGuestLogin}
                >
                  ゲストログイン
                </RoundedButton>
              </>
            )}
          </Box>
        </Card>
      </Stack>
    </>
  );
}
