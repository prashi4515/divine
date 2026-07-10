import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="CMS preferences for editors. Values are placeholders — nothing is persisted yet."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>How the admin console presents itself.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Display name</span>
              <Input readOnly defaultValue="Divine Editorial" aria-label="Display name" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Default language</span>
              <Input readOnly defaultValue="en" aria-label="Default language" />
            </label>
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-sm font-medium">Publish warnings</p>
                <p className="text-muted-foreground text-xs">
                  Confirm before publishing unpublished verses.
                </p>
              </div>
              <Badge variant="secondary">On</Badge>
            </div>
            <Separator />
            <Button disabled size="sm">
              Save changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content defaults</CardTitle>
            <CardDescription>Defaults for new catalog rows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Default work code</span>
              <Input readOnly defaultValue="bg" aria-label="Default work code" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Default translation source</span>
              <Input readOnly defaultValue="default" aria-label="Default translation source" />
            </label>
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-sm font-medium">New rows start unpublished</p>
                <p className="text-muted-foreground text-xs">
                  Matches isPublished defaults in Prisma.
                </p>
              </div>
              <Badge variant="secondary">On</Badge>
            </div>
            <Separator />
            <Button disabled variant="outline" size="sm">
              Reset to defaults
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
