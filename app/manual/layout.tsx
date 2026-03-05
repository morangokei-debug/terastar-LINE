import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "操作マニュアル | テラスターファーマシー LINEフォローアップ",
  description:
    "テラスターファーマシー LINEフォローアップの詳細な操作マニュアル。ログイン、患者管理、フォローアップ、処方箋受信、チャット、一斉送信、設定まで。",
};

export default function ManualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
