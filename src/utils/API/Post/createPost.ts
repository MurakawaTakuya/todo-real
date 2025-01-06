import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { PostWithGoalId } from "@/types/types";

/**
 * Cloud FunctionsのAPIを呼び出して、投稿をFirestoreに登録する
 *
 * @param {PostWithGoalId} postData
 * @return {*}
 */
export const createPost = async (postData: PostWithGoalId) => {
  // 文字は100文字まで
  if (postData.text.length > 100) {
    throw new Error("too long comment");
  }

  const response = await fetch(`${functionsEndpoint}/post/`, {
    method: "POST",
    headers: {
      "X-Firebase-AppCheck": appCheckToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const status = response.status;
    const data = await response.json();
    throw new Error(`Error ${status}: ${data.message}`);
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
    if (error.message.includes("too long comment")) {
      snackBarMessage = "投稿コメントは100文字以下にしてください";
    }
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
