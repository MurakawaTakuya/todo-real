import { appCheckToken, auth, functionsEndpoint } from "@/app/firebase";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { updateUser } from "../UserContext";

/**
 * Firebase Authenticationを使ってメールでユーザーを作成し、生成されたuserIdをドキュメントIDとしてFirestoreにユーザー情報を登録する
 *
 * @param {string} email
 * @param {string} password
 * @param {string} name
 */
export const signUpWithMail = async (
  email: string,
  password: string,
  name: string
) => {
  // メールは初回ログインの時のみ成功する、2回目以降はエラーになるので、ログインを使う
  await createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      // Firebase AuthのdisplayNameを設定
      try {
        await updateProfile(user, { displayName: name });
        console.log("ユーザー名を設定しました:", name);
      } catch (profileUpdateError) {
        console.error("プロファイル更新に失敗しました:", profileUpdateError);
      }

      // displayNameをFirestoreに登録
      const response = await fetch(`${functionsEndpoint}/user/${user.uid}`, {
        method: "PUT",
        headers: {
          "X-Firebase-AppCheck": appCheckToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const status = response.status;
        const data = await response.json();
        throw new Error(`Error ${status}: ${data.message}`);
      }

      updateUser({
        userId: user.uid,
        name: name,
        loginType: "Mail",
        isMailVerified: user.emailVerified,
      });

      // メール確認リンクを送信
      try {
        await sendEmailVerification(user);
      } catch (verificationError) {
        console.error("Failed to send email verification:", verificationError);
      }

      showSnackBar({
        message: (
          <>
            メールでユーザー登録しました。
            <br />
            認証メールを送信しました。認証されるまでは一部の機能が制限されます。
          </>
        ),
        type: "success",
        duration: 5000,
      });
    })
    .catch((error) => {
      console.error("errorCode:", (error as Error)?.name);
      console.error("errorMessage:", (error as Error)?.message);

      const errorMessage = (error as Error)?.message;
      let snackBarMessage = "メールでのユーザー登録に失敗しました";

      if (errorMessage.includes("auth/invalid-email")) {
        snackBarMessage = "メールアドレスが無効です";
      } else if (errorMessage.includes("auth/email-already-in-use")) {
        snackBarMessage = "このメールアドレスは既に使用されています";
      } else if (errorMessage.includes("auth/weak-password")) {
        snackBarMessage = "パスワードは8文字以上である必要があります";
      } else if (errorMessage.includes("auth/too-many-requests")) {
        snackBarMessage =
          "リクエストが多すぎます。しばらくしてからもう一度お試しください。";
      }

      showSnackBar({
        message: snackBarMessage,
        type: "warning",
      });
    });
};
