import {
  PERMISSION_GROUPS,
  ROLES,
  ROLE_LABELS,
  roleCan,
} from "@/lib/rbac";

export const metadata = { title: "Permissions" };

export default function PermissionsSettingsPage() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        The role × permission matrix. A check means the role grants the
        permission. This is derived from a single source of truth in{" "}
        <span className="font-mono">lib/rbac</span>.
      </p>

      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-border bg-muted/40 border-b">
              <th className="text-muted-foreground px-4 py-2.5 font-medium">Permission</th>
              {ROLES.map((role) => (
                <th
                  key={role}
                  className="text-muted-foreground px-2 py-2.5 text-center text-xs font-medium"
                >
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((group) => (
              <PermissionGroupRows key={group.label} group={group} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PermissionGroupRows({
  group,
}: {
  group: (typeof PERMISSION_GROUPS)[number];
}) {
  return (
    <>
      <tr className="border-border bg-muted/20 border-b">
        <td
          colSpan={ROLES.length + 1}
          className="text-muted-foreground px-4 py-1.5 text-xs font-medium uppercase tracking-wide"
        >
          {group.label}
        </td>
      </tr>
      {group.permissions.map((permission) => (
        <tr key={permission} className="border-border border-b last:border-0">
          <td className="px-4 py-2 font-mono text-xs">{permission}</td>
          {ROLES.map((role) => (
            <td key={role} className="px-2 py-2 text-center">
              {roleCan(role, permission) ? (
                <span className="text-foreground" aria-label="granted">
                  ✓
                </span>
              ) : (
                <span className="text-border" aria-label="not granted">
                  ·
                </span>
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
