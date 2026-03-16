import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

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
          background: "#0d9488",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            background: "rgba(0, 0, 0, 0.18)",
            transform: "translate(150px, 150px) skewX(-35deg)",
            transformOrigin: "top left",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 170,
            height: 170,
            borderRadius: "50%",
            background: "#e8fffb",
            top: 115,
            left: 170,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 280,
            height: 72,
            borderRadius: 36,
            background: "#ffffff",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 72,
            height: 280,
            borderRadius: 36,
            background: "#ffffff",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 132,
            height: 58,
            borderRadius: 29,
            background: "#0ea5a0",
            transform: "rotate(-28deg) translate(90px, 66px)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
