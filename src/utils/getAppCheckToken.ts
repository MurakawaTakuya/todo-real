"use client";
import { app } from "@/app/firebase";
import {
  getToken,
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "firebase/app-check";

/**
 * App Checkのトークンを生成する
 *
 * @export
 * @return {*}  {Promise<string>}
 */
export default async function getAppCheckToken(): Promise<string> {
  try {
    // 開発環境ならApp Checkを使用しない
    if (process.env.NODE_ENV === "development") {
      return "development";
    }

    // ステージング環境ならApp Checkのデバッグトークンを有効化
    if (process.env.NEXT_PUBLIC_IS_STAGING === "true") {
      (
        window as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean }
      ).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_SITEKEY as string
      ),
      isTokenAutoRefreshEnabled: true,
    });

    const token = await getToken(appCheck);
    return token.token;
  } catch {
    throw new Error(
      "App Checkの初期化に失敗しました。debug tokenがサーバーに登録されていることを確認してください。"
    );
  }
}
