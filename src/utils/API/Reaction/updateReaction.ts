import { functionsEndpoint } from "@/app/firebase";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { ReactionTypeMap } from "@/types/types";
import getAppCheckToken from "@/utils/getAppCheckToken";

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
  const appCheckToken = await getAppCheckToken().catch((error) => {
    showSnackBar({
      message: error.message,
      type: "warning",
    });
    return "";
  });

  if (!appCheckToken) {
    return;
  }

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
