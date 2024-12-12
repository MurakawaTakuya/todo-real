import { auth } from "@/app/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

/**
 * Firebase Authenticationでログインする
 *
 * @param {string} email
 * @param {string} password
 * @return {*}
 */
export const signInWithMail = (email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password)
    .then()
    .catch((error) => {
      console.error("errorCode:", (error as Error)?.name);
      console.error("errorMessage:", (error as Error)?.message);
    });
  return null;
};
