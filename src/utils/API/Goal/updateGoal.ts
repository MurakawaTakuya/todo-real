import { functionsEndpoint } from "@/app/firebase";
import getAppCheckToken from "@/utils/getAppCheckToken";

/**
 * Cloud FunctionsのAPIを呼び出して、目標を編集する
 *
 * @param {string} goalId
 * @param {{
 *     text?: string;
 *     deadline?: Date;
 *   }} putData
 * @return {*}
 */
export const updateGoal = async (
  goalId: string,
  putData: {
    text?: string;
    deadline?: Date;
  }
) => {
  // 過去の時間が入力されている場合
  if (putData.deadline && new Date(putData.deadline).getTime() < Date.now()) {
    throw new Error("past deadline can't be set");
  }

  // 文字数制限を100文字までにする
  if (putData.text && putData.text.length > 100) {
    throw new Error("too long comment");
  }

  const appCheckToken = await getAppCheckToken();

  const response = await fetch(`${functionsEndpoint}/goal/${goalId}`, {
    method: "PUT",
    headers: {
      "X-Firebase-AppCheck": appCheckToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(putData),
  });

  if (!response.ok) {
    const status = response.status;
    const data = await response.json();
    throw new Error(`Error ${status}: ${data.message}`);
  }

  return await response.json();
};

/**
 * 目標編集時のエラーハンドリング
 *
 * @param {unknown} error
 * @return {*}
 */
export const handleUpdateGoalError = (error: unknown) => {
  let snackBarMessage = "目標の編集に失敗しました";

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
    if (error.message.includes("App Checkの初期化に失敗しました。")) {
      snackBarMessage =
        "App Checkの初期化に失敗しました。debug tokenがサーバーに登録されていることを確認してください。";
    }
  } else {
    console.error("An unknown error occurred");
    snackBarMessage = "不明なエラーが発生しました";
  }

  return snackBarMessage;
};
