import Header from "@/Components/Header/Header";
import NavigationMenu from "@/Components/NavigationMenu/NavigationMenu";
import { Loader } from "@/Components/TopPage/TopPage";
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
          <Loader>
            {children}
            <NavigationMenu />
          </Loader>
        </UserProvider>
      </body>
    </html>
  );
}
