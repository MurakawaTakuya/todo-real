"use client";
import { auth } from "@/app/firebase";
import NameUpdate from "@/Components/NameUpdate/NameUpdate";
import Notification from "@/Components/Notification/Notification";
import { signInAsGuest } from "@/utils/Auth/signInAnonymously";
import { signInWithMail } from "@/utils/Auth/signInWithMail";
import { signUpWithGoogleAccount } from "@/utils/Auth/signUpWithGoogleAccount";
import { signUpWithMail } from "@/utils/Auth/signUpWithMail";
import { useUser } from "@/utils/UserContext";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { signOut } from "firebase/auth";
import React, { useState } from "react";

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

const CenteredToggleButtonGroup = styled(ToggleButtonGroup)({
  display: "flex",
  justifyContent: "center",
  marginBottom: "16px",
});

const RoundedButton = styled(Button)(({ theme }) => ({
  borderRadius: "50px",
  padding: theme.spacing(1.5, 4),
}));

export default function Account() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formMode, setFormMode] = useState<"register" | "login">("register");
  const [open, setOpen] = useState(false);

  const { user } = useUser();

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await signUpWithMail(email, password, name);
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await signInWithMail(email, password);
  };

  const handleGoogleLogin = async () => {
    await signUpWithGoogleAccount();
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

  return (
    <>
      <CssBaseline enableColorScheme />
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{ padding: 2 }}
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

                {/* ゲストの場合は通知機能を利用しない */}
                {user.loginType !== "Guest" && <Notification />}

                {/* メール認証が完了していない場合に表示 */}
                {!user.isMailVerified && (
                  <Typography color="error">
                    メールに届いた認証リンクを確認してください。
                    <br />
                    認証が完了するまで閲覧以外の機能は制限されます。
                  </Typography>
                )}

                <RoundedButton variant="contained" onClick={handleLogout}>
                  ログアウト
                </RoundedButton>

                {/* ゲストの場合は名前を変更しない */}
                {user.loginType !== "Guest" && (
                  <>
                    <RoundedButton
                      variant="contained"
                      onClick={() => setOpen(true)}
                    >
                      名前を変更
                    </RoundedButton>
                    <NameUpdate open={open} setOpen={setOpen} />
                  </>
                )}
              </>
            ) : (
              <>
                {formMode === "register" ? (
                  <>
                    <Typography>新規登録</Typography>
                    <form onSubmit={handleRegisterSubmit}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
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
                          type="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          fullWidth
                          required
                        />
                        <RoundedButton
                          type="submit"
                          variant="contained"
                          fullWidth
                        >
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
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
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
                          type="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          fullWidth
                          required
                        />
                        <RoundedButton
                          type="submit"
                          variant="contained"
                          fullWidth
                        >
                          ログイン
                        </RoundedButton>
                      </Box>
                    </form>
                  </>
                )}
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
              </>
            )}
          </Box>
        </Card>
      </Stack>
    </>
  );
}
