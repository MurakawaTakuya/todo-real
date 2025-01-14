import styles from "@/app/account/page.module.scss";
import NameUpdate from "@/Components/NameUpdate/NameUpdate";
import { handleSignOut } from "@/utils/Auth/signOut";
import { getSuccessRate } from "@/utils/successRate";
import { useUser } from "@/utils/UserContext";
import Typography from "@mui/joy/Typography";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";

export const RoundedButton = styled(Button)(({ theme }) => ({
  borderRadius: "30px",
  padding: theme.spacing(1.3, 2.5),
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
        <Typography level="body-lg" sx={{ textAlign: "center" }}>
          ゲストとしてログイン中
        </Typography>
      ) : (
        <>
          <Typography
            level="body-lg"
            sx={{
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            ようこそ、{user.name}さん!
          </Typography>
        </>
      )}

      {!user.isMailVerified && (
        <Typography color="danger">
          メールに届いた認証リンクを確認してください。
          認証が完了するまで閲覧以外の機能は使用できません。
        </Typography>
      )}

      {user.loginType === "Guest" && (
        <>
          <Typography color="danger">
            ゲストユーザーは閲覧以外の機能は使用できません。
            全ての機能を利用するにはログインが必要です。
          </Typography>
        </>
      )}

      <div className={styles.buttonContainer} style={{ margin: "10px 0" }}>
        <div>
          <NameUpdate />
        </div>
        <div>
          <RoundedButton variant="contained" onClick={handleSignOut}>
            ログアウト
          </RoundedButton>
        </div>
      </div>

      {user.loginType !== "Guest" && user.isMailVerified && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Typography level="title-md" sx={{ textAlign: "center" }}>
              連続達成日数: {userStats.streak}日目
            </Typography>
            <Typography level="title-md" sx={{ textAlign: "center" }}>
              目標達成率: {userStats.successRate}%
            </Typography>
            <Typography level="title-md" sx={{ textAlign: "center" }}>
              達成回数: {userStats.completed}回
            </Typography>
          </div>
        </>
      )}
    </>
  );
}
