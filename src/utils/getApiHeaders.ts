import { auth } from "@/app/firebase";
import getAppCheckToken from "@/utils/getAppCheckToken";

export const getApiHeaders = async ({
  requireAuth = false,
}: {
  requireAuth?: boolean;
} = {}): Promise<Record<string, string>> => {
  const appCheckToken = await getAppCheckToken();
  const headers: Record<string, string> = {
    "X-Firebase-AppCheck": appCheckToken,
    "Content-Type": "application/json",
  };

  const currentUser = auth.currentUser;
  if (requireAuth && !currentUser) {
    throw new Error("Authentication is required");
  }
  if (currentUser) {
    headers.Authorization = `Bearer ${await currentUser.getIdToken(
      requireAuth
    )}`;
  }
  return headers;
};
