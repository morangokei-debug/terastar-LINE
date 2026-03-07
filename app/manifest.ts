import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "テラスターファーマシー LINEフォローアップ",
    short_name: "テラスターファーマシー",
    description: "調剤薬局向けLINEフォローアップサービス",
    start_url: "/",
    display: "fullscreen",
    background_color: "#1a2035",
    theme_color: "#1a2035",
    orientation: "any",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
