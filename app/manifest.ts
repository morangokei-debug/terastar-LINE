import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "テラスターファーマシー LINEフォローアップ",
    short_name: "テラスターファーマシー",
    description: "調剤薬局向けLINEフォローアップサービス",
    start_url: "/",
    display: "fullscreen",
    background_color: "#5e6ad2",
    theme_color: "#5e6ad2",
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
