import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS, ROLE_PERMISSIONS } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Roles" };

export default function RolesSettingsPage() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Roles are additive — a user may hold several. Permissions are derived from
        roles and are never assigned directly. This matrix is the authorization
        contract shared with the API.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => (
          <Card key={role}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{ROLE_LABELS[role]}</CardTitle>
                <Badge variant="muted">{ROLE_PERMISSIONS[role].length}</Badge>
              </div>
              <CardDescription>{ROLE_DESCRIPTIONS[role]}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">
                {ROLE_PERMISSIONS[role].length} permissions granted
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
