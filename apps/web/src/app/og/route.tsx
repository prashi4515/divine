import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Dynamic Open Graph image — `/og?title=&subtitle=&eyebrow=`
 * Never hardcodes a domain; used via relative paths in metadata.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = (searchParams.get("title") ?? "Bhagavad Gita Online").slice(
    0,
    80,
  );
  const subtitle = (searchParams.get("subtitle") ?? "").slice(0, 100);
  const eyebrow = (searchParams.get("eyebrow") ?? "Divine").slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(145deg, #1a1208 0%, #3d2a14 45%, #8a5a2b 100%)",
          color: "#fff8f0",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.75,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 40 ? 48 : 60,
              lineHeight: 1.15,
              fontWeight: 600,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                opacity: 0.85,
                maxWidth: 900,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            opacity: 0.7,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Bhagavad Gita Online
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
