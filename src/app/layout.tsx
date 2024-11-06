import "@/styles/globals.scss";
import type { Metadata } from "next";
import Header from "./Components/Header/Header";

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
        <main>{children}</main>
      </body>
    </html>
  );
}
