import { NextResponse } from "next/server";
import { getStaticGitaCommentary } from "@/lib/reading/gita-static";

export const runtime = "nodejs";

const PUBLIC_ID = /^bg\.(\d+)\.(\d+)$/;

type RouteContext = {
  params: Promise<{ publicId: string }>;
};

/**
 * Instant commentary for Gita verses — reads on-disk commentary snapshots.
 * No Neon / Render round-trip.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { publicId: raw } = await context.params;
  const publicId = decodeURIComponent(raw);
  const match = PUBLIC_ID.exec(publicId);
  if (!match) {
    return NextResponse.json({ error: "Not a Gita verse id" }, { status: 404 });
  }

  const chapterNumber = Number.parseInt(match[1]!, 10);
  const verseNumber = Number.parseInt(match[2]!, 10);

  try {
    const file = await getStaticGitaCommentary(chapterNumber);
    const entry = file.byNumber[String(verseNumber)];
    if (!entry) {
      return NextResponse.json({ error: "Verse not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: {
          publicId: entry.publicId,
          commentary: entry.commentary,
          translations: entry.translations,
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Snapshot missing" }, { status: 404 });
  }
}
