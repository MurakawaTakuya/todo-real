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
    throw new Error("Network response was not ok");
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
    console.error("Fetch error:", error.message);
    if (error.message.includes("404")) {
      snackBarMessage = "ユーザー情報が登録されていません";
    }
    if (error.message.includes("500")) {
      snackBarMessage = "サーバーエラーが発生しました";
    }
  } else {
    console.error("An unknown error occurred");
    snackBarMessage = "不明なエラーが発生しました";
  }

  return snackBarMessage;
};
