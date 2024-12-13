import { auth } from "@/app/firebase";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { signInAnonymously } from "firebase/auth";

/**
 * Firebase Authenticationを使ってゲストユーザーとしてログインする
 *
 */
export const signInAsGuest = async () => {
  try {
    await signInAnonymously(auth);

    showSnackBar({
      message: (
        <>
          ゲストユーザーとしてログインしました。
          <br />
          ゲストログインでは閲覧以外の機能は制限されます。
        </>
      ),
      type: "success",
      duration: 5000,
    });
  } catch (error) {
    console.error("errorCode:", (error as Error)?.name);
    console.error("errorMessage:", (error as Error)?.message);
    showSnackBar({
      message: "ゲストユーザーとしてのログインに失敗しました",
      type: "warning",
    });
  }
};
