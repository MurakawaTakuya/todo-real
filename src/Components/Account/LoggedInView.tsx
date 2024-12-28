import NameUpdate from "@/Components/NameUpdate/NameUpdate";
import NotificationButton from "@/Components/NotificationButton/NotificationButton";
import { handleSignOut } from "@/utils/Auth/signOut";
import { getSuccessRate } from "@/utils/successRate";
import { useUser } from "@/utils/UserContext";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

export const RoundedButton = styled(Button)(({ theme }) => ({
  borderRadius: "30px",
  padding: theme.spacing(1.5, 3),
}));

export default function LoggedInView() {
  const [userStats, setUserStats] = useState<{
    streak: number;
    successRate: number;
    completed: number;
  }>({
    streak: 0,
    successRate: 0,
    completed: 0,
  });
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const successRate = getSuccessRate(user.completed, user.failed);
      setUserStats({
        streak: user.streak ?? 0,
        successRate: successRate ?? 0,
        completed: user.completed ?? 0,
      });
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <>
      {user.loginType === "Guest" ? (
        <>ゲストとしてログイン中</>
      ) : (
        <>
          <Typography sx={{ textAlign: "center" }}>
            ようこそ、{user.name}さん!
          </Typography>
          <Typography sx={{ textAlign: "center" }}>
            連続達成日数: {userStats.streak}日目
          </Typography>
          <Typography sx={{ textAlign: "center" }}>
            目標達成率: {userStats.successRate}%
          </Typography>
          <Typography sx={{ textAlign: "center" }}>
            達成回数: {userStats.completed}回
          </Typography>
        </>
      )}

      {!user.isMailVerified && (
        <Typography color="error">
          メールに届いた認証リンクを確認してください。
          <br />
          認証が完了するまで閲覧以外の機能は制限されます。
        </Typography>
      )}

      {user.loginType === "Guest" && (
        <Typography color="error">
          ゲストユーザーは閲覧以外の機能は制限されます。
          全ての機能を利用するにはログインが必要です。
        </Typography>
      )}

      {/* ゲストかメール未認証の場合は名前を変更できないようにする */}
      {user.loginType !== "Guest" && user.isMailVerified && (
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <NameUpdate />
          <NotificationButton />
        </div>
      )}

      <RoundedButton variant="contained" onClick={handleSignOut}>
        ログアウト
      </RoundedButton>
    </>
  );
}
