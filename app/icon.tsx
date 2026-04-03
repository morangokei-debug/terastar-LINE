import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

/** テラスター公式LINE アイコン（LINEグリーン＋吹き出し＋T） */
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
            left: 76,
            top: 90,
            width: 360,
            height: 280,
            borderRadius: 56,
            background: "rgba(255,255,255,0.18)",
            border: "4px solid rgba(255,255,255,0.55)",
          }}
        />
        {/* 吹き出しの尻尾 */}
        <div
          style={{
            position: "absolute",
            left: 130,
            top: 352,
            width: 52,
            height: 52,
            background: "rgba(255,255,255,0.18)",
            borderRight: "4px solid rgba(255,255,255,0.55)",
            borderBottom: "4px solid rgba(255,255,255,0.55)",
            transform: "rotate(15deg)",
            borderRadius: "0 0 16px 0",
          }}
        />

        {/* T の文字 */}
        <div
          style={{
            position: "absolute",
            left: 156,
            top: 130,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* 横棒 */}
          <div
            style={{
              width: 200,
              height: 46,
              borderRadius: 23,
              background: "#ffffff",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            }}
          />
          {/* 縦棒 */}
          <div
            style={{
              width: 46,
              height: 160,
              borderRadius: 23,
              background: "#ffffff",
              marginTop: -4,
              boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
