import { auth } from "@/app/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createUserAPI } from "./createUserAPI";
import { updateUser } from "./UserContext";

/**
 * Firebase Authenticationでユーザーを作成し、生成されたuidをドキュメントIDとしてFirestoreにユーザー情報を登録する
 *
 * @param {string} email
 * @param {string} password
 * @param {string} name
 */
export const createUser = (email: string, password: string, name: string) => {
  // メールは初回ログインの時のみ成功する、2回目以降はエラーになるので、ログインを使う
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed up
      const user = userCredential.user;

      // uidとdocument IDを一致させる
      await createUserAPI(name, user.uid);
      updateUser({
        uid: user.uid,
        name: name,
        streak: 0,
        loginType: "Mail",
      });
      console.log(user);
    })
    .catch((error) => {
      console.error("errorCode:", (error as Error)?.name);
      console.error("errorMessage:", (error as Error)?.message);
    });
};
