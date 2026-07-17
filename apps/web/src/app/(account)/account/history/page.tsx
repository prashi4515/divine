import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Reading Progress" };

export default function AccountHistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading Progress</CardTitle>
        <CardDescription>Track all 18 chapters of the Gita.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Gita reading progress</span>
          <span className="font-medium">0 / 701 verses</span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div className="bg-foreground/80 h-full w-0 rounded-full" />
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Progress syncing unlocks with reading history in the next phase.
        </p>
      </CardContent>
    </Card>
  );
}
