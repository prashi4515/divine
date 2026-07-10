import Link from "next/link";
import {
  Activity,
  BookOpen,
  Languages,
  Library,
  Sparkles,
} from "lucide-react";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { StatCard } from "@/features/admin/stat-card";
import { StatSkeletonGrid } from "@/features/admin/skeletons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Catalog health for the Divine content CMS. Counts stay at zero until import — this is layout only."
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Catalog</h2>
          <Badge variant="muted">Live counts later</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Works"
            value="—"
            hint="Scripture corpora"
            icon={Library}
          />
          <StatCard
            label="Verses"
            value="—"
            hint="Stable public IDs"
            icon={BookOpen}
          />
          <StatCard
            label="Languages"
            value="—"
            hint="BCP-47 locales"
            icon={Languages}
          />
          <StatCard
            label="Topics"
            value="—"
            hint="Thematic tags"
            icon={Sparkles}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-muted-foreground text-xs uppercase tracking-wider">
          Loading state (design)
        </h2>
        <StatSkeletonGrid />
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Editorial events will stream here after APIs exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center px-2 py-12 text-center">
              <div className="border-border bg-muted/40 mb-3 flex h-9 w-9 items-center justify-center rounded-md border">
                <Activity className="text-muted-foreground h-4 w-4" aria-hidden />
              </div>
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                Publishes, imports, and translation updates will appear in this feed.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
            <CardDescription>Primary content surfaces.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {[
              { label: "Works", href: "/admin/works", hint: "Corpora" },
              { label: "Verses", href: "/admin/verses", hint: "Catalog" },
              { label: "Translations", href: "/admin/translations", hint: "Locales" },
              { label: "Settings", href: "/admin/settings", hint: "Prefs" },
            ].map((item, index) => (
              <div key={item.href}>
                {index > 0 && <Separator />}
                <Link
                  href={item.href}
                  className="hover:bg-muted/50 -mx-2 flex items-center justify-between rounded-md px-2 py-3 transition-colors"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-muted-foreground text-xs">{item.hint}</span>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
