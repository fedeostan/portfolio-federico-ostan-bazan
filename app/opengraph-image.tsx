import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Federico Ostan-Bazán — Portfolio";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "96px",
          background: "#fafafa",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            color: "#0a0a0a",
            fontSize: 96,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          Federico Ostan-Bazán
        </div>
        <div
          style={{
            color: "#737373",
            fontSize: 32,
            fontWeight: 500,
            display: "flex",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          Product designer building AI-native interfaces — a conversational portfolio.
        </div>
      </div>
    ),
    { ...size },
  );
}
