import { appCheckToken, functionsEndpoint } from "@/app/firebase";

/**
 * Cloud FunctionsのAPIを呼び出して、ユーザー情報をFirestoreに登録する
 * AuthenticationのuserIdと/userのdocument IDは同じにする
 *
 * @param {string} name
 * @param {string} userId
 */
export const createUser = async (name: string, userId: string) => {
  const response = await fetch(`${functionsEndpoint}/user/`, {
    method: "POST",
    headers: {
      "X-Firebase-AppCheck": appCheckToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, name }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  console.log("Success:", data);
};
