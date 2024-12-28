import Header from "@/Components/Header/Header";
import { Loader } from "@/Components/Loader/Loader";
import NavigationMenu from "@/Components/NavigationMenu/NavigationMenu";
import SnackBar from "@/Components/SnackBar/SnackBar";
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
          <SnackBar />
        </UserProvider>
      </body>
    </html>
  );
}
