import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "My Notes" };

export default function AccountNotesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Notes</CardTitle>
        <CardDescription>Write your own reflections on verses.</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm leading-relaxed">
        Private verse notes are coming in the next engagement phase.
      </CardContent>
    </Card>
  );
}
