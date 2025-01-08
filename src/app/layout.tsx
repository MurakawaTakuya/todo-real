import { Loader } from "@/Components/Loader/Loader";
import NavigationMenu from "@/Components/NavigationMenu/NavigationMenu";
import SnackBar from "@/Components/SnackBar/SnackBar";
import "@/styles/globals.scss";
import "@/utils/CloudMessaging/getNotification";
import { UserProvider } from "@/utils/UserContext";
import type { Metadata } from "next";
import "./firebase";

const description = "TODO REALはTODOリストとBeRealを組み合わせたアプリです。";
export const rootURL = "https://todo-real-c28fa.web.app/";

export const metadata: Metadata = {
  title: "Todo Real",
  description,
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
      <head>
        <link rel="icon" type="image/svg+xml" href="/appIcon.svg" />
        {/* Open Graph */}
        <meta property="og:title" content="TODO REAL" />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${rootURL}/img/thumbnail.png`} />
        <meta property="og:url" content={`${rootURL}`} />
        <meta property="og:type" content="website" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TODO REAL" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${rootURL}/img/thumbnail.png`} />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body>
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
