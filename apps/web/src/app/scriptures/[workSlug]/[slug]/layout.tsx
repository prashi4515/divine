import { readerFontVariableClass } from "@/lib/reading/reader-font-vars";

export default function ScriptureChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={readerFontVariableClass}>{children}</div>;
}
