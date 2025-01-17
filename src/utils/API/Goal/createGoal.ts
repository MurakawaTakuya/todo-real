import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { Goal } from "@/types/types";

/**
 * Cloud FunctionsのAPIを呼び出して、目標をFirestoreに登録する
 *
 * @param {Goal} postData
 * @return {*}
 */
export const createGoal = async (postData: Goal) => {
  // 過去の時間が入力されている場合
  if (new Date(postData.deadline).getTime() < Date.now()) {
    throw new Error("past deadline can't be set");
  }

  // 文字数制限を100文字までにする
  if (postData.text.length > 100) {
    throw new Error("too long comment");
  }

  const response = await fetch(`${functionsEndpoint}/goal/`, {
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
 * 目標作成時のエラーハンドリング
 *
 * @param {unknown} error
 * @return {*}
 */
export const handleCreateGoalError = (error: unknown) => {
  let snackBarMessage = "目標の作成に失敗しました";

  if (error instanceof Error) {
    if (error.message.includes("past deadline can't be set")) {
      snackBarMessage = "過去の時間を設定することはできません";
    }
    if (error.message.includes("too long comment")) {
      snackBarMessage = "目標の文字数は100文字以下にしてください";
    }
    if (error.message.includes("400")) {
      snackBarMessage = "入力内容に問題があります";
    }
    if (error.message.includes("429")) {
      snackBarMessage = "リクエストが多すぎます。数分後に再度お試しください。";
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
