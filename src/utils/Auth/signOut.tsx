import { auth } from "@/app/firebase";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { signOut } from "firebase/auth";

export const handleSignOut = async () => {
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
