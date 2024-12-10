import { auth } from "@/app/firebase";
import { createUser } from "@/utils/API/createUser";
import { updateUser } from "@/utils/UserContext";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

/**
 * Firebase Authenticationでユーザーを作成し、生成されたuidをドキュメントIDとしてFirestoreにユーザー情報を登録する
 *
 * @param {string} email
 * @param {string} password
 * @param {string} name
 */
export const signUpWithMail = (
  email: string,
  password: string,
  name: string
) => {
  // メールは初回ログインの時のみ成功する、2回目以降はエラーになるので、ログインを使う
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed up
      const user = userCredential.user;

      // uidとdocument IDを一致させる
      await createUser(name, user.uid);
      updateUser({
        uid: user.uid,
        name: name,
        streak: 0,
        loginType: "Mail",
        isMailVerified: user.emailVerified,
      });

      // メール確認リンクを送信
      try {
        await sendEmailVerification(user);
        console.log("確認メールを送信しました。");
      } catch (verificationError) {
        console.error("確認メールの送信に失敗しました:", verificationError);
      }
      console.log(user);
    })
    .catch((error) => {
      console.error("errorCode:", (error as Error)?.name);
      console.error("errorMessage:", (error as Error)?.message);
    });
};
