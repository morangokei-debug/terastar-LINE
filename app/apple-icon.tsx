import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

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
          background: "#0d9488",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 150,
            height: 150,
            background: "rgba(0, 0, 0, 0.18)",
            transform: "translate(58px, 58px) skewX(-35deg)",
            transformOrigin: "top left",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "#e8fffb",
            top: 38,
            left: 61,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 100,
            height: 28,
            borderRadius: 14,
            background: "#ffffff",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 28,
            height: 100,
            borderRadius: 14,
            background: "#ffffff",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 46,
            height: 21,
            borderRadius: 11,
            background: "#0ea5a0",
            transform: "rotate(-28deg) translate(33px, 23px)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
