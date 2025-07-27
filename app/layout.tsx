import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./(components)/Header/Header";
import { Providers } from "./(providers)/Providers";
import ContentContainer from "./(components)/ContentContainer/ContentContainer";
import Toast from "./(components)/Toast/Toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DoctiAI",
  description: "Code documenatation helper with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon_ico/favicon.ico" />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon_ico/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon_ico/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon_ico/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon_ico/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
          <ContentContainer>
            <main>{children}</main>
            <SpeedInsights />
            <Toast />
          </ContentContainer>
        </Providers>
      </body>
    </html>
  );
}
