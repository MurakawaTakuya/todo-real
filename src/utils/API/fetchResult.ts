import { appCheckToken, functionsEndpoint } from "@/app/firebase";

// TODO: limitとoffsetを追加する
/**
 * Cloud FunctionsのAPIを呼び出して、結果の一覧を取得する
 *
 * @para
 * @return {*}
 */
export const fetchResult = async () => {
  const response = await fetch(`${functionsEndpoint}/result/`, {
    method: "GET",
    headers: {
      "X-Firebase-AppCheck": appCheckToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};
