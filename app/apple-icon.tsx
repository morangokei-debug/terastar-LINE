import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

/** テラスター公式LINE Apple アイコン（icon.tsxと同デザイン縮小版） */
export default function AppleIcon() {
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
          background: "linear-gradient(160deg, #12c75a 0%, #06b049 55%, #059040 100%)",
        }}
      >
        {/* 光沢ハイライト */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(255,255,255,0.30) 0%, transparent 55%)",
          }}
        />

        {/* LINE風吹き出し */}
        <div
          style={{
            position: "absolute",
            left: 27,
            top: 32,
            width: 126,
            height: 98,
            borderRadius: 20,
            background: "rgba(255,255,255,0.18)",
            border: "2px solid rgba(255,255,255,0.55)",
          }}
        />
        {/* 吹き出しの尻尾 */}
        <div
          style={{
            position: "absolute",
            left: 46,
            top: 123,
            width: 18,
            height: 18,
            background: "rgba(255,255,255,0.18)",
            borderRight: "2px solid rgba(255,255,255,0.55)",
            borderBottom: "2px solid rgba(255,255,255,0.55)",
            transform: "rotate(15deg)",
            borderRadius: "0 0 6px 0",
          }}
        />

        {/* T の文字 */}
        <div
          style={{
            position: "absolute",
            left: 55,
            top: 46,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* 横棒 */}
          <div
            style={{
              width: 70,
              height: 16,
              borderRadius: 8,
              background: "#ffffff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
            }}
          />
          {/* 縦棒 */}
          <div
            style={{
              width: 16,
              height: 56,
              borderRadius: 8,
              background: "#ffffff",
              marginTop: -2,
              boxShadow: "0 2px 6px rgba(0,0,0,0.14)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
