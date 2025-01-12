import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { ReactionTypeMap } from "@/types/types";

/**
 * Cloud FunctionsのAPIを呼び出して、リアクションを更新する
 * reactionTypeに`""`を入れるとリアクションを削除する
 *
 * @param {string} userId
 * @param {string} goalId
 * @param {string} reactionType
 * @return {*}
 */
export const updateReaction = async (
  userId: string,
  goalId: string,
  reactionType: ReactionTypeMap | ""
) => {
  const response = await fetch(`${functionsEndpoint}/reaction/${goalId}`, {
    method: "PUT",
    headers: {
      "X-Firebase-AppCheck": appCheckToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, reactionType }),
  });

  if (!response.ok) {
    const status = response.status;
    const data = await response.json();
    throw new Error(`Error ${status}: ${data.message}`);
  }

  const data = await response.json();
  return data;
};
