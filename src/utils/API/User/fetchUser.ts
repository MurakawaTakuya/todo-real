import { functionsEndpoint } from "@/app/firebase";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { User } from "@/types/types";
import getAppCheckToken from "@/utils/getAppCheckToken";

/**
 * Cloud FunctionsのAPIを呼び出して、ユーザー情報をFirestoreから取得する
 *
 * @param {string} userId
 * @return {*}  {Promise<User>}
 */
export const fetchUserById = async (userId: string): Promise<User> => {
  const appCheckToken = await getAppCheckToken().catch((error) => {
    showSnackBar({
      message: error.message,
      type: "warning",
    });
    return "";
  });

  if (!appCheckToken) {
    throw new Error("Failed to get App Check token");
  }

  const response = await fetch(`${functionsEndpoint}/user/id/${userId}`, {
    method: "GET",
    headers: {
      "X-Firebase-AppCheck": appCheckToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const status = response.status;
    const data = await response.json();
    throw new Error(`Error ${status}: ${data.message}`);
  }

  const data = await response.json();
  return data;
};

/**
 * ユーザー情報取得時のエラーハンドリング
 *
 * @param {unknown} error
 * @return {*}
 */
export const handleFetchUserError = (error: unknown) => {
  let snackBarMessage = "ユーザーデータが見つかりません";

  if (error instanceof Error) {
    if (error.message.includes("404")) {
      snackBarMessage = "ユーザー情報が登録されていません";
    }
    if (error.message.includes("500")) {
      snackBarMessage = "サーバーエラーが発生しました";
    }
    if (error.message.includes("429")) {
      snackBarMessage = "リクエストが多すぎます。数分後に再度お試しください。";
    }
  } else {
    console.error("An unknown error occurred");
    snackBarMessage = "不明なエラーが発生しました";
  }

  return snackBarMessage;
};
