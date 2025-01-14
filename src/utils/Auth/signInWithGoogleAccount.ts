import { auth, googleProvider } from "@/app/firebase";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { signInWithPopup } from "firebase/auth";

/**
 * Firebase Authenticationを使ってGoogleアカウントでログインする
 *
 *
 */
export const signInWithGoogleAccount = async () => {
  try {
    await signInWithPopup(auth, googleProvider);

    showSnackBar({
      message: "Googleアカウントでログインしました",
      type: "success",
    });
  } catch (error) {
    console.error("errorCode:", (error as Error)?.name);
    console.error("errorMessage:", (error as Error)?.message);
    let message =
      "Googleアカウントでのログインに失敗しました。ページを更新して再度お試しください。";
    if ((error as Error)?.message.includes("auth/popup-closed-by-user")) {
      message = "ログインがキャンセルされました";
    }
    showSnackBar({
      message,
      type: "warning",
    });
  }
};
