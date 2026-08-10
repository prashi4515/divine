import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const host = getSiteUrl().replace(/^https?:\/\//, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/search",
          "/search/",
          "/account",
          "/account/",
          "/login",
          "/signup",
          "/logout",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/bookmarks",
          "/history",
          "/profile",
          "/settings",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host,
  };
}
