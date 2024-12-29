import { appCheckToken, functionsEndpoint } from "@/app/firebase";

// TODO: limitとoffsetを追加する
/**
 * Cloud FunctionsのAPIを呼び出して、結果の一覧を取得する
 *
 * @param {string} uid
 * @return {*}
 */
export const fetchResult = async ({
  userId = "",
  success = true,
  failed = true,
  pending = true,
}: {
  userId?: string;
  success?: boolean;
  failed?: boolean;
  pending?: boolean;
} = {}) => {
  const queryParams = new URLSearchParams();
  if (!success && !failed && pending) {
    queryParams.append("onlyPending", "true");
  } else if (success && failed && !pending) {
    queryParams.append("onlyFinished", "true");
  }

  const response = await fetch(
    `${functionsEndpoint}/result/${userId}?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "X-Firebase-AppCheck": appCheckToken,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const status = response.status;
    const data = await response.json();
    throw new Error(`Error ${status}: ${data.message}`);
  }

  const data = await response.json();
  return data;
};

/**
 * 結果取得時のエラーハンドリング
 *
 * @param {unknown} error
 * @return {*}
 */
export const handleFetchResultError = (error: unknown) => {
  let snackBarMessage = "データの取得に失敗しました";

  if (error instanceof Error) {
    console.error("Fetch error:", error.message);
    if (error.message.includes("404")) {
      snackBarMessage = "データが見つかりませんでした";
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
