import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "テラスター薬局 LINEフォローアップ",
  description: "調剤薬局向けLINEフォローアップサービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
