import { ImageResponse } from "next/og";

import { getProjectBySlug } from "@/lib/db/queries";

export const runtime = "edge";
export const alt = "Federico Ostan-Bazán — case study";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

type OgProps = {
  params: Promise<{ slug: string }>;
};

export default async function OgImage({ params }: OgProps) {
  const { slug } = await params;
  const { data: project } = await getProjectBySlug(slug);
  const title = project?.title ?? "Federico Ostan-Bazán";

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
          {title}
        </div>
        <div
          style={{
            color: "#737373",
            fontSize: 32,
            fontWeight: 500,
            display: "flex",
          }}
        >
          Federico Ostan-Bazán
        </div>
      </div>
    ),
    { ...size },
  );
}
