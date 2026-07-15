import { ScriptureSeoClient } from "@/features/library/scripture-seo-client";

export const metadata = { title: "SEO" };

type Props = { params: Promise<{ scriptureId: string }> };

export default async function ScriptureSeoPage({ params }: Props) {
  const { scriptureId } = await params;
  return <ScriptureSeoClient scriptureId={scriptureId} />;
}
