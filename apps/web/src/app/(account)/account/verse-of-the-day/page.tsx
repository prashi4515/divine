import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Verse of the Day" };

export default function VerseOfTheDayPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verse of the Day</CardTitle>
        <CardDescription>
          A new shloka in your inbox daily — with timezone support.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm leading-relaxed">
        Email delivery for Verse of the Day will use Resend once this feature
        ships. You can already verify your email from Profile.
      </CardContent>
    </Card>
  );
}
