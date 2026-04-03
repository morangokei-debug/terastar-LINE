import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

/** テラスター向けアプリアイコン（グラデ＋丸み十字＋ソフトシャドウ） */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(148deg, #7b86eb 0%, #5e6ad2 42%, #4349a8 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 85% 70% at 28% 22%, rgba(255,255,255,0.38) 0%, transparent 52%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 88% 92%, rgba(20,184,166,0.35) 0%, transparent 45%)",
          }}
        />
        {/* 十字の影 */}
        <div
          style={{
            position: "absolute",
            left: 230 + 7,
            top: 146 + 9,
            width: 52,
            height: 220,
            borderRadius: 26,
            background: "rgba(15, 23, 42, 0.28)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 146 + 7,
            top: 230 + 9,
            width: 220,
            height: 52,
            borderRadius: 26,
            background: "rgba(15, 23, 42, 0.22)",
          }}
        />
        {/* 十字本体 */}
        <div
          style={{
            position: "absolute",
            left: 230,
            top: 146,
            width: 52,
            height: 220,
            borderRadius: 26,
            background: "#ffffff",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 146,
            top: 230,
            width: 220,
            height: 52,
            borderRadius: 26,
            background: "#ffffff",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.35)",
          }}
        />
        {/* LINE/ケアを示す小アクセント */}
        <div
          style={{
            position: "absolute",
            right: 56,
            bottom: 56,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: "linear-gradient(145deg, #5eead4 0%, #14b8a6 100%)",
            border: "3px solid rgba(255,255,255,0.92)",
            boxShadow: "0 10px 28px rgba(15,23,42,0.25)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
