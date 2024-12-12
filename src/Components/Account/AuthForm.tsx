import { signInAsGuest } from "@/utils/Auth/signInAnonymously";
import { signInWithMail } from "@/utils/Auth/signInWithMail";
import { signUpWithGoogleAccount } from "@/utils/Auth/signUpWithGoogleAccount";
import { signUpWithMail } from "@/utils/Auth/signUpWithMail";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";

const CenteredToggleButtonGroup = styled(ToggleButtonGroup)({
  display: "flex",
  justifyContent: "center",
  marginBottom: "16px",
});

const RoundedButton = styled(Button)(({ theme }) => ({
  borderRadius: "50px",
  padding: theme.spacing(1.5, 4),
}));

export default function AuthForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formMode, setFormMode] = useState<"register" | "login">("register");

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

  return (
    <>
      <CenteredToggleButtonGroup
        value={formMode}
        exclusive
        onChange={(event, newValue) => {
          if (newValue) {
            setFormMode(newValue);
          }
        }}
        aria-label="form mode"
      >
        <ToggleButton value="register" aria-label="register">
          新規登録
        </ToggleButton>
        <ToggleButton value="login" aria-label="login">
          ログイン
        </ToggleButton>
      </CenteredToggleButtonGroup>
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
                label="ユーザー名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="パスワード"
                type="new-password"
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
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TextField
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="パスワード"
                type="current-password"
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
      <Divider>または</Divider>
      <RoundedButton fullWidth variant="outlined" onClick={handleGoogleLogin}>
        Googleでログイン
      </RoundedButton>
      <RoundedButton fullWidth variant="outlined" onClick={handleGuestLogin}>
        ゲストログイン
      </RoundedButton>
    </>
  );
}
