import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

/** 指定SVGベースのAppleアイコン */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
          <rect width="200" height="200" rx="20" fill="#C4949A" />
          <path
            d="M62 74 Q62 58 78 58 L142 58 Q158 58 158 74 L158 118 Q158 134 142 134 L112 134 L100 151 L103 134 L78 134 Q62 134 62 118 Z"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line
            x1="83"
            y1="89"
            x2="137"
            y2="89"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          <line
            x1="83"
            y1="104"
            x2="122"
            y2="104"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            bottom: "11%",
            color: "white",
            fontFamily: "Georgia, serif",
            fontSize: 16,
            letterSpacing: 2,
            opacity: 0.9,
          }}
        >
          LINE
        </div>
      </div>
    ),
    { ...size }
  );
}
