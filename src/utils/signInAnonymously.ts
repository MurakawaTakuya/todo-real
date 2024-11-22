import { auth } from "@/app/firebase";
import { signInAnonymously } from "firebase/auth";

/**
 * ゲストユーザーとしてログインする
 *
 */
export const signInAsGuest = async () => {
  try {
    await signInAnonymously(auth);
    // const result = await signInAnonymously(auth);
    // console.log("Guest login successful:", result.user);
    console.log("Guest login successful");
  } catch (error) {
    console.error("errorCode:", (error as Error)?.name);
    console.error("errorMessage:", (error as Error)?.message);
  }
};
