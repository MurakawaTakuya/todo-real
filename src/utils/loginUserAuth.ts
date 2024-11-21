import { auth } from "@/app/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

/**
 *
 *
 * @param {string} email
 * @param {string} password
 * @return {*}
 */
export const loginUser = (email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      return user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      throw new Error(`Error ${errorCode}: ${errorMessage}`);
    });
  return null;
};
