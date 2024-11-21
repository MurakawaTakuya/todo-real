import { auth, googleProvider } from "@/app/firebase";
import { signInWithPopup } from "firebase/auth";
import { createUserAPI } from "./createUserAPI";

/**
 * Googleアカウントでログインする
 *
 */
export const signInWithGoogleAccount = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    await createUserAPI(
      result.user.displayName ?? "Anonymous",
      result.user.uid
    );

    console.log("Google login successful");
    // console.log("Google login successful:", result.user);
  } catch (error) {
    console.error("Google login error:", error);
  }
};
