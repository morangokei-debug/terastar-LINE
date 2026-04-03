import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

/** Apple 用（512版と同デザインを縮小） */
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
        <div
          style={{
            position: "absolute",
            left: 81 + 2,
            top: 51 + 3,
            width: 18,
            height: 78,
            borderRadius: 9,
            background: "rgba(15, 23, 42, 0.28)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 51 + 2,
            top: 81 + 3,
            width: 78,
            height: 18,
            borderRadius: 9,
            background: "rgba(15, 23, 42, 0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 81,
            top: 51,
            width: 18,
            height: 78,
            borderRadius: 9,
            background: "#ffffff",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 51,
            top: 81,
            width: 78,
            height: 18,
            borderRadius: 9,
            background: "#ffffff",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: 18,
            width: 16,
            height: 16,
            borderRadius: 8,
            background: "linear-gradient(145deg, #5eead4 0%, #14b8a6 100%)",
            border: "2px solid rgba(255,255,255,0.92)",
            boxShadow: "0 4px 10px rgba(15,23,42,0.22)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
