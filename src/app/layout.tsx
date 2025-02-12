import { Loader } from "@/Components/Loader/Loader";
import NavigationMenu from "@/Components/NavigationMenu/NavigationMenu";
import SnackBar from "@/Components/SnackBar/SnackBar";
import "@/styles/globals.scss";
import "@/utils/CloudMessaging/getNotification";
import { UserProvider } from "@/utils/UserContext";
import type { Metadata } from "next";
import "./firebase";

const description =
  "TODO REALは、TODOリストとBeRealを組み合わせたアプリです。友達とTODOリストを共有し、目標達成をサポートし合うことで、達成感や楽しさを共有できます。完了したTODOの写真投稿や競争機能で、目標達成がもっと楽しくなります!";
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TODO REAL",
    url: rootURL,
  };

  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/appIcon.svg" />
        <link rel="apple-touch-icon" href="/icon512_maskable.png"></link>
        <meta name="theme-color" content="#e8f7ff" />
        <meta name="description" content={description} />

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

        {/* Google Searcgh Console */}
        <meta
          name="google-site-verification"
          content="bXYLAh9xBwD_lAd7nd7CK4UoXgxmfBZFt3-Vcqjkk-4"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
