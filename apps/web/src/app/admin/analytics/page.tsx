import { BarChart3 } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Analytics" };

const PANELS = [
  { title: "Daily Readers", description: "Unique readers per day" },
  { title: "Most Read Scriptures", description: "Ranked by reads" },
  { title: "Languages", description: "Reads by language" },
  { title: "Countries", description: "Reads by country" },
  { title: "Top Chapters", description: "Most opened chapters" },
  { title: "Search Trends", description: "What readers search for" },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Readership and engagement across the platform. Charts activate once the analytics pipeline is connected."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {PANELS.map((panel) => (
          <Card key={panel.title}>
            <CardHeader>
              <CardTitle>{panel.title}</CardTitle>
              <CardDescription>{panel.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-border/60 text-muted-foreground flex h-40 items-center justify-center rounded-md border border-dashed">
                <span className="inline-flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4" aria-hidden />
                  No data yet
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
