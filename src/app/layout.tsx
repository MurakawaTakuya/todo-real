import Header from "@/Components/Header/Header";
import { TopPage } from "@/Components/TopPage/TopPage";
import "@/styles/globals.scss";
import "@/utils/CloudMessaging/getNotification";
import { UserProvider } from "@/utils/UserContext";
import type { Metadata } from "next";
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
        <Header />
        <UserProvider>
          <TopPage>{children}</TopPage>
        </UserProvider>
      </body>
    </html>
  );
}
