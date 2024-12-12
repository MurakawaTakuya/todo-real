import { auth } from "@/app/firebase";
import NameUpdate from "@/Components/NameUpdate/NameUpdate";
import Notification from "@/Components/Notification/Notification";
import { useUser } from "@/utils/UserContext";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { signOut } from "firebase/auth";

const RoundedButton = styled(Button)(({ theme }) => ({
  borderRadius: "50px",
  padding: theme.spacing(1.5, 4),
}));

export default function LoggedInView() {
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Signed out");
    } catch (error) {
      console.error("errorCode:", (error as Error)?.name);
      console.error("errorMessage:", (error as Error)?.message);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {user.loginType === "Guest" ? (
        <>ゲストとしてログイン中</>
      ) : (
        <Typography>ログイン中: {user.name}</Typography>
      )}

      {/* ゲストかメール未認証の場合は通知機能を利用しない */}
      {user.loginType !== "Guest" && user.isMailVerified && <Notification />}

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
      {user.loginType !== "Guest" && user.isMailVerified && <NameUpdate />}

      <RoundedButton variant="contained" onClick={handleLogout}>
        ログアウト
      </RoundedButton>
    </>
  );
}
