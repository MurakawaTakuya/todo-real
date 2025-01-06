import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { User } from "@/types/types";

/**
 * Cloud FunctionsのAPIを呼び出して、ユーザー情報をFirestoreから取得する
 *
 * @param {string} userId
 * @return {*}  {Promise<User>}
 */
export const fetchUserById = async (userId: string): Promise<User> => {
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
  let snackBarMessage = "初回ログインかユーザーデータが見つかりません";

  if (error instanceof Error) {
    if (error.message.includes("404")) {
      snackBarMessage = "ユーザー情報が登録されていません";
    }
    if (error.message.includes("500")) {
      snackBarMessage = "サーバーエラーが発生しました";
    }
    if (error.message.includes("429")) {
      snackBarMessage = "リクエストが多すぎます。数分後に再度お試しください";
    }
  } else {
    console.error("An unknown error occurred");
    snackBarMessage = "不明なエラーが発生しました";
  }

  return snackBarMessage;
};
