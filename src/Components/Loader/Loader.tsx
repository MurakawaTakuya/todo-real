"use client";
import { handleSignOut } from "@/utils/Auth/signOut";
import { useUser } from "@/utils/UserContext";
import CircularProgress from "@mui/joy/CircularProgress";
import { Button, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface LoaderProps {
  children: ReactNode;
}

export const Loader = ({ children }: LoaderProps) => {
  const [showErrorButton, setShowErrorButton] = useState(false);

  const { user } = useUser();

  // ログインしていない場合はログインページにリダイレクト
  useEffect(() => {
    const pathname = window.location.pathname;
    if (user === null && pathname !== "/account/" && pathname !== "/") {
      redirect("/account");
    }
  }, [user]);

  setTimeout(() => {
    setShowErrorButton(true);
  }, 15000);

  return (
    <>
      {user === undefined ? (
        <>
          <CircularProgress
            color="primary"
            variant="soft"
            size="lg"
            value={30}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          {showErrorButton && (
            <div
              style={{
                position: "absolute",
                top: "70%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Typography
                color="warning"
                sx={{ textAlign: "center", width: "90vw", maxWidth: "500px" }}
              >
                認証エラーが発生した可能性があります。
                <br />
                ページを更新しても解消しない場合や通信の問題でない場合は再度ログインしてください。
              </Typography>
              <Button variant="contained" color="error" onClick={handleSignOut}>
                ログアウト
              </Button>
            </div>
          )}
        </>
      ) : (
        <main>{children}</main>
      )}
    </>
  );
};
