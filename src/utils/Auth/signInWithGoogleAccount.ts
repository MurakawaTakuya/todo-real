import { auth, googleProvider } from "@/app/firebase";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { createUser } from "@/utils/API/User/createUser";
import { updateUser } from "@/utils/UserContext";
import { getAdditionalUserInfo, signInWithPopup } from "firebase/auth";

/**
 * Firebase Authenticationを使ってGoogleアカウントでログインする
 * 初回ログインの時のみデータベースにユーザー情報を登録する
 *
 */
export const signInWithGoogleAccount = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    // 初めての時だけユーザー情報を登録する
    if (getAdditionalUserInfo(result)?.isNewUser) {
      // uidとdocument IDを一致させる
      await createUser(result.user.displayName ?? "no name", result.user.uid);
      updateUser({
        userId: result.user.uid,
        name: result.user.displayName ?? "no name",
        streak: 0,
        loginType: "Google",
        isMailVerified: result.user.emailVerified,
      });
    }

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
