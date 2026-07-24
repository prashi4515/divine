import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "General settings" };

export default function GeneralSettingsPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>How the console presents itself.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              readOnly
              defaultValue="Bhagavad Gita Editorial"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-language">Default language</Label>
            <Input id="default-language" readOnly defaultValue="en" />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="default-source">Default translation source</Label>
            <Input id="default-source" readOnly defaultValue="default" />
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-sm font-medium">New rows start unpublished</p>
              <p className="text-muted-foreground text-xs">
                Matches isPublished defaults in the schema.
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
  );
}
