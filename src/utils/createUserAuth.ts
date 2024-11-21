import { auth } from "@/app/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createUserAPI } from "./createUserAPI";

/**
 * Firebase Authenticationでユーザーを作成し、生成されたuidをドキュメントIDとしてFirestoreにユーザー情報を登録する
 *
 * @param {string} email
 * @param {string} password
 * @param {string} name
 */
export const createUser = (email: string, password: string, name: string) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed up
      const user = userCredential.user;

      // uidとdocument IDを一致させる
      await createUserAPI(name, user.uid);
      // console.log("user:", user);
    })
    .catch((error) => {
      const errorCode = error.code ? error.code : "unknown";
      const errorMessage = error.message;
      // ..
      throw { errorCode, errorMessage };
    });
};