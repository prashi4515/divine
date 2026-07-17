import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Bookmarks" };

export default function AccountBookmarksPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookmarks</CardTitle>
        <CardDescription>Save verses for quick return.</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm leading-relaxed">
        Your bookmarks will appear here. Sync across devices is next in the
        engagement phase.
      </CardContent>
    </Card>
  );
}
