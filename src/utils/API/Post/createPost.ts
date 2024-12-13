import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { Post } from "@/types/types";

/**
 * Cloud FunctionsのAPIを呼び出して、投稿をFirestoreに登録する
 *
 * @param {Post} postData
 * @return {*}
 */
export const createPost = async (postData: Post) => {
  const response = await fetch(`${functionsEndpoint}/post/`, {
    method: "POST",
    headers: {
      "X-Firebase-AppCheck": appCheckToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * 投稿作成時のエラーハンドリング
 *
 * @param {unknown} error
 * @return {*}
 */
export const handleCreatePostError = (error: unknown) => {
  let snackBarMessage = "投稿の作成に失敗しました";

  if (error instanceof Error) {
    console.error("Fetch error:", error.message);
    if (error.message.includes("400")) {
      snackBarMessage = "入力内容に問題があります";
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
