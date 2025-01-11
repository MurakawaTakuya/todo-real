import { signInAsGuest } from "@/utils/Auth/signInAnonymously";
import { signInWithGoogleAccount } from "@/utils/Auth/signInWithGoogleAccount";
import { signInWithMail } from "@/utils/Auth/signInWithMail";
import { signUpWithMail } from "@/utils/Auth/signUpWithMail";
import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import { RoundedButton } from "./LoggedInView";

const CenteredToggleButtonGroup = styled(ToggleButtonGroup)({
  display: "flex",
  justifyContent: "center",
});

export default function AuthForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formMode, setFormMode] = useState<"register" | "login">("register");
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<
    "Mail" | "Google" | "Guest" | null
  >(null);

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setLoadingType("Mail");
    await signUpWithMail(email, password, name);
    setLoading(false);
    setLoadingType(null);
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setLoadingType("Mail");
    await signInWithMail(email, password);
    setLoading(false);
    setLoadingType(null);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLoadingType("Google");
    await signInWithGoogleAccount();
    setLoading(false);
    setLoadingType(null);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setLoadingType("Guest");
    await signInAsGuest();
    setLoading(false);
    setLoadingType(null);
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

      {typeof Notification === "undefined" && (
        <Typography color="danger" level="body-sm">
          この端末では通知等の機能が使用できません。
          {/iPad|iPhone|iPod/.test(navigator.userAgent) &&
            "使用するにはiOS 16.4以降に更新してください"}
        </Typography>
      )}

      {formMode === "register" ? (
        <>
          <form onSubmit={handleRegisterSubmit}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Typography>新規登録</Typography>
              <TextField
                label="ユーザー名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                autoComplete="username"
              />
              <TextField
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
              />
              <TextField
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="new-password"
              />
              <RoundedButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading && loadingType === "Mail" ? (
                  <>
                    <CircularProgress size={24} sx={{ marginRight: 1 }} />
                    アカウント作成
                  </>
                ) : (
                  "アカウント作成"
                )}
              </RoundedButton>
            </Box>
          </form>
        </>
      ) : (
        <>
          <form onSubmit={handleLoginSubmit}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Typography>ログイン</Typography>
              <TextField
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
              />
              <TextField
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="current-password"
              />
              <RoundedButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading && loadingType === "Mail" ? (
                  <>
                    <CircularProgress size={24} sx={{ marginRight: 1 }} />
                    ログイン
                  </>
                ) : (
                  "ログイン"
                )}
              </RoundedButton>
            </Box>
          </form>
        </>
      )}

      <Divider>または</Divider>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <RoundedButton
          fullWidth
          variant="outlined"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading && loadingType === "Google" ? (
            <>
              <CircularProgress size={24} sx={{ marginRight: 1 }} />
              Googleアカウントでログイン
            </>
          ) : (
            "Googleアカウントでログイン"
          )}
        </RoundedButton>
        <RoundedButton
          fullWidth
          variant="outlined"
          onClick={handleGuestLogin}
          disabled={loading}
        >
          {loading && loadingType === "Guest" ? (
            <>
              <CircularProgress size={24} sx={{ marginRight: 1 }} />
              ゲストログイン
            </>
          ) : (
            "ゲストログイン"
          )}
        </RoundedButton>

        <Typography level="body-xs">
          ゲストログインを使用するとアカウントを作成せずに閲覧できます。
          (投稿機能は使用できません。)
        </Typography>
      </div>
    </>
  );
}
