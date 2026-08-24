import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_SHORT_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo/config";
import { absoluteUrl } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#faf6eb",
    theme_color: "#8a5a2b",
    lang: "en",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["education", "books", "lifestyle"],
    id: absoluteUrl("/"),
  };
}
