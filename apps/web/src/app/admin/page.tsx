import {
  Activity,
  BookMarked,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderTree,
  HardDrive,
  Languages,
  Library,
  PenLine,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { StatCard } from "@/features/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Dashboard" };

const STATS = [
  { label: "Scriptures", value: "—", hint: "Corpora in the library", icon: Library },
  { label: "Books", value: "—", hint: "Structural top level", icon: BookMarked },
  { label: "Chapters", value: "—", hint: "Structural units", icon: FolderTree },
  { label: "Verses", value: "—", hint: "Atomic units", icon: BookOpen },
  { label: "Translations", value: "—", hint: "Across languages", icon: FileText },
  { label: "Languages", value: "—", hint: "BCP-47 locales", icon: Languages },
  { label: "Users", value: "—", hint: "Team members", icon: Users },
  { label: "Pending Reviews", value: "—", hint: "Awaiting reviewers", icon: ClipboardList },
  { label: "Published", value: "—", hint: "Live content", icon: CheckCircle2 },
  { label: "Drafts", value: "—", hint: "Unpublished", icon: PenLine },
  { label: "Storage Used", value: "—", hint: "Media assets", icon: HardDrive },
] as const;

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Platform overview across every scripture. Counts activate as content and APIs land — the layout is production-ready today."
      />

      <section className="space-y-3" aria-labelledby="catalog-heading">
        <div className="flex items-center justify-between">
          <h2 id="catalog-heading" className="text-sm font-medium">
            Catalog health
          </h2>
          <Badge variant="muted">Live counts later</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
              icon={stat.icon}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Publishes, imports, reviews, and translation updates stream here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center px-2 py-12 text-center">
              <div className="border-border bg-muted/40 mb-3 flex h-9 w-9 items-center justify-center rounded-md border">
                <Activity className="text-muted-foreground h-4 w-4" aria-hidden />
              </div>
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                Editorial events will appear once the audit log is connected.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System health</CardTitle>
            <CardDescription>Live service status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "API", note: "Connect status probe" },
              { label: "Database", note: "Connect status probe" },
              { label: "Search index", note: "Not configured" },
              { label: "Media storage", note: "Not configured" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="font-medium">{row.label}</span>
                <span className="text-muted-foreground inline-flex items-center gap-2 text-xs">
                  <span
                    className="bg-muted-foreground/40 inline-block h-2 w-2 rounded-full"
                    aria-hidden
                  />
                  {row.note}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
