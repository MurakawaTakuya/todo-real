import { auth, googleProvider } from "@/app/firebase";
import { getAdditionalUserInfo, signInWithPopup } from "firebase/auth";
import { createUserAPI } from "./createUserAPI";

/**
 * Googleアカウントでログインする
 *
 */
export const signInWithGoogleAccount = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    // 初めての時だけユーザー情報を登録する
    if (getAdditionalUserInfo(result)?.isNewUser) {
      await createUserAPI(
        result.user.displayName ?? "no name",
        result.user.uid
      );
    }

    console.log("Google login successful");
    // console.log("Google login successful:", result.user);
  } catch (error) {
    console.error("errorCode:", (error as any)?.errorCode);
    console.error("errorMessage:", (error as any)?.errorMessage);
  }
};
