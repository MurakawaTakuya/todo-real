import { auth } from "@/app/firebase";
import NameUpdate from "@/Components/NameUpdate/NameUpdate";
import NotificationButton from "@/Components/NotificationButton/NotificationButton";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { useUser } from "@/utils/UserContext";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { signOut } from "firebase/auth";

export const RoundedButton = styled(Button)(({ theme }) => ({
  borderRadius: "30px",
  padding: theme.spacing(1.5, 3),
}));

export default function LoggedInView() {
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      showSnackBar({
        message: "ログアウトしました",
        type: "success",
      });
    } catch (error) {
      console.error("errorCode:", (error as Error)?.name);
      console.error("errorMessage:", (error as Error)?.message);
      showSnackBar({
        message: "ログアウトに失敗しました",
        type: "warning",
      });
    }
  };

  if (!user) {
    return null;
  }

  const successRate =
    user && user.completed && user.failed
      ? Math.floor((user.completed / (user.completed + user.failed)) * 100)
      : "?";

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
            連続達成日数: {user.streak}日目
          </Typography>
          <Typography sx={{ textAlign: "center" }}>
            目標達成率: {successRate}%
          </Typography>
          <Typography sx={{ textAlign: "center" }}>
            達成回数: {user.completed}回
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

      <RoundedButton variant="contained" onClick={handleLogout}>
        ログアウト
      </RoundedButton>
    </>
  );
}
