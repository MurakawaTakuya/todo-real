import { auth, googleProvider } from "@/app/firebase";
import { createUserAPI } from "@/utils/API/createUserAPI";
import { updateUser } from "@/utils/UserContext";
import { getAdditionalUserInfo, signInWithPopup } from "firebase/auth";

/**
 * Googleアカウントでログインする
 *
 */
export const signInWithGoogleAccount = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    // 初めての時だけユーザー情報を登録する
    if (getAdditionalUserInfo(result)?.isNewUser) {
      // uidとdocument IDを一致させる
      await createUserAPI(
        result.user.displayName ?? "no name",
        result.user.uid
      );
      updateUser({
        uid: result.user.uid,
        name: result.user.displayName ?? "no name",
        streak: 0,
        loginType: "Google",
      });
    }

    console.log("Google login successful");
    // console.log("Google login successful:", result.user);
  } catch (error) {
    console.error("errorCode:", (error as Error)?.name);
    console.error("errorMessage:", (error as Error)?.message);
  }
};
