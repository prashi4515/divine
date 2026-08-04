export { getSiteUrl, absoluteUrl, normalizePath, stripTrailingSlash } from "@/lib/seo/site";
export {
  SITE_NAME,
  SITE_SHORT_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  rootMetadata,
  rootViewport,
} from "@/lib/seo/config";
export {
  buildPageMetadata,
  clampTitle,
  clampDescription,
  ogImageFor,
  type PageMetadataInput,
} from "@/lib/seo/metadata";
export * from "@/lib/seo/titles";
export * from "@/lib/seo/json-ld";
