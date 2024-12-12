import { auth, googleProvider } from "@/app/firebase";
import { createUser } from "@/utils/API/createUser";
import { updateUser } from "@/utils/UserContext";
import { getAdditionalUserInfo, signInWithPopup } from "firebase/auth";

/**
 * Googleアカウントでログインする
 *
 */
export const signUpWithGoogleAccount = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    // 初めての時だけユーザー情報を登録する
    if (getAdditionalUserInfo(result)?.isNewUser) {
      // uidとdocument IDを一致させる
      await createUser(result.user.displayName ?? "no name", result.user.uid);
      updateUser({
        userId: result.user.uid,
        name: result.user.displayName ?? "no name",
        streak: 0,
        loginType: "Google",
        isMailVerified: result.user.emailVerified,
      });
    }

    console.log("Google login successful");
    // console.log("Google login successful:", result.user);
  } catch (error) {
    console.error("errorCode:", (error as Error)?.name);
    console.error("errorMessage:", (error as Error)?.message);
  }
};
