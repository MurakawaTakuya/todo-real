import { auth } from "@/app/firebase";
import { signInAnonymously } from "firebase/auth";

/**
 * ゲストユーザーとしてログインする
 *
 */
export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log("Guest login successful:", result.user);
    console.log("Guest login successful");
  } catch (error) {
    const errorCode = (error as any).code;
    const errorMessage = (error as any).message;
    throw new Error(`Error ${errorCode}: ${errorMessage}`);
  }
};
