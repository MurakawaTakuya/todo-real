import "@/styles/globals.scss";
import "@/utils/getNotification";
import "@/utils/notificationController";
import { UserProvider } from "@/utils/UserContext";
import type { Metadata } from "next";
import Header from "./Components/Header/Header";
import "./firebase";

export const metadata: Metadata = {
  title: "Todo Real(仮)",
  description: "BeRealとTodoアプリを組み合わせたアプリ",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head></head>
      <body>
        <UserProvider>
          <Header />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
