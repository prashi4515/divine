import { readerFontVariableClass } from "@/lib/reading/reader-font-vars";

/**
 * Chapter reading layout — loads Noto / Cormorant reader fonts.
 * Scoped here so the rest of the app stays on the lighter Inter stack.
 */
export default function ChapterReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={readerFontVariableClass}>{children}</div>;
}
