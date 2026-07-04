import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "나만의 교육용 웹앱 만들기 ✨ EduApp",
  description: "선생님과 코딩 초보자들을 위한 가장 쉽고 세련된 교육용 웹앱 템플릿 Boilerplate입니다. 나만의 학습 도구를 직접 구현해 보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50/30 dark:bg-slate-950/30">
        <Header />
        <main className="flex-1 flex flex-col justify-start">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
