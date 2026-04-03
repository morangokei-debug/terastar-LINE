import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "テラスターファーマシー LINEフォローアップ",
    short_name: "テラスターファーマシー",
    description: "調剤薬局向けLINEフォローアップサービス",
    start_url: "/",
    display: "fullscreen",
    background_color: "#06b049",
    theme_color: "#06b049",
    orientation: "any",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
