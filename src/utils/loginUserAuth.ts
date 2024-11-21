import { auth } from "@/app/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { fetchUserAPI } from "./fetchUserAPI";

/**
 * Firebase Authenticationでログインする
 *
 * @param {string} email
 * @param {string} password
 * @return {*}
 */
export const loginUser = (email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed in
      const user = userCredential.user;
      const userData = await fetchUserAPI(user.uid);
      // TODO: ここでUseContextを使って、ユーザー情報を保持する
      // TODO: ログイン状態の維持
      console.log(user.uid, userData);
    })
    .catch((error) => {
      console.error("errorCode:", (error as any)?.errorCode);
      console.error("errorMessage:", (error as any)?.errorMessage);
    });
  return null;
};
