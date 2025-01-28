import { auth } from "@/app/firebase";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { signInWithEmailAndPassword } from "firebase/auth";

/**
 * Firebase Authenticationを使ってメールでログインする
 *
 * @param {string} email
 * @param {string} password
 * @return {*}
 */
export const signInWithMail = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      showSnackBar({
        message:
          "メールアドレスでログインしました。ユーザーデータを取得しています。",
        type: "success",
      });
    })
    .catch((error) => {
      console.error("errorCode:", (error as Error)?.name);
      console.error("errorMessage:", (error as Error)?.message);

      const errorMessage = (error as Error)?.message;
      let snackBarMessage = "メールアドレスでのログインに失敗しました";

      if (errorMessage.includes("auth/wrong-password")) {
        snackBarMessage = "パスワードが間違っています";
      } else if (errorMessage.includes("auth/user-not-found")) {
        snackBarMessage =
          "このメールアドレスで登録されているユーザーが見つかりませんでした";
      } else if (errorMessage.includes("auth/too-many-requests")) {
        snackBarMessage =
          "リクエストが多すぎます。しばらくしてからもう一度お試しください。";
      } else if (errorMessage.includes("appCheck/fetch-status-error")) {
        snackBarMessage =
          "App Checkの初期化に失敗しました。debug tokenがサーバーに登録されていることを確認してください";
      }

      showSnackBar({
        message: snackBarMessage,
        type: "warning",
      });
    });
};
