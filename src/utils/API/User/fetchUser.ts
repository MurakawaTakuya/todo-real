import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { UserData } from "@/types/types";

/**
 * Cloud FunctionsのAPIを呼び出して、ユーザー情報をFirestoreから取得する
 *
 * @param {string} userId
 * @return {*}  {Promise<UserData>}
 */
export const fetchUserById = async (userId: string): Promise<UserData> => {
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
  let snackBarMessage = "ユーザー情報の取得に失敗しました";

  if (error instanceof Error) {
    console.error("Fetch error:", error.message);
    if (error.message.includes("404")) {
      snackBarMessage = "ユーザーが見つかりませんでした";
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
