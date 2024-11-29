import { functionsEndpoint } from "@/app/firebase";
import { UserData } from "@/types/types";

/**
 * Cloud FunctionsのAPIを呼び出して、ユーザー情報をFirestoreから取得する
 *
 * @param {string} uid
 * @return {*}  {Promise<UserData>}
 */
export const fetchUserAPI = async (uid: string): Promise<UserData> => {
  const response = await fetch(`${functionsEndpoint}/user/id/${uid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};
