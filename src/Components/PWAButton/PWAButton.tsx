"use client";
import { useEffect, useRef, useState } from "react";
import { RoundedButton } from "../Account/LoggedInView";
import { showSnackBar } from "../SnackBar/SnackBar";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

export const PWAButton = ({
  defaultDisabled = true,
}: {
  defaultDisabled?: boolean;
}) => {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [ready, setReady] = useState(false);
  const [isAleadyInstalled, setIsAlreadyInstalled] = useState(false);

  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isIosStandalone =
        "standalone" in window.navigator &&
        (window.navigator as unknown as { standalone: boolean }).standalone;
      setIsAlreadyInstalled(isStandalone || Boolean(isIosStandalone));
    };

    checkIfInstalled();

    const beforeInstallPromptHandler = (event: BeforeInstallPromptEvent) => {
      setReady(true);
      deferredPromptRef.current = event;
    };

    const appInstalledHandler = () => {
      console.log("PWA was successfully installed!");
      showSnackBar({
        message:
          "アプリに追加しました。ホーム画面から起動してください。通知を受信している場合はPWAで再度登録を推奨します。",
        type: "success",
      });
    };

    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    window.addEventListener("appinstalled", appInstalledHandler); // appinstalledイベントをリッスン

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        beforeInstallPromptHandler
      );
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  const handleClickInstall = async () => {
    const deferredPrompt = deferredPromptRef.current;
    if (deferredPrompt) {
      deferredPrompt.prompt();
    }
  };

  return (
    <>
      {isAleadyInstalled ? (
        <RoundedButton variant="outlined" color="success" disabled>
          追加済み!
        </RoundedButton>
      ) : (
        <RoundedButton
          variant="outlined"
          disabled={!ready || defaultDisabled}
          onClick={handleClickInstall}
        >
          アプリに追加
        </RoundedButton>
      )}
    </>
  );
};
