/**
 * Permission catalog for the Divine CMS.
 *
 * Permissions are `resource:action` strings. They are the single source of
 * truth for authorization in the UI. Roles map to permissions in `roles.ts`;
 * code NEVER hardcodes role checks — it always asks for a permission.
 *
 * Mirror this list server-side when the auth/RBAC backend is implemented.
 */
export const PERMISSIONS = [
  // Dashboard
  "dashboard:view",

  // Library (scriptures / corpora)
  "library:read",
  "library:create",
  "library:update",
  "library:delete",

  // Structure (books / chapters / sections — arbitrary hierarchy)
  "structure:read",
  "structure:manage",

  // Verses
  "verse:read",
  "verse:create",
  "verse:update",
  "verse:delete",

  // Translations
  "translation:read",
  "translation:create",
  "translation:update",
  "translation:delete",
  "translation:submit",

  // Reviews
  "review:read",
  "review:approve",
  "review:reject",
  "review:comment",

  // Publishing
  "publishing:read",
  "publishing:publish",
  "publishing:unpublish",
  "publishing:schedule",
  "publishing:archive",

  // Media
  "media:read",
  "media:upload",
  "media:update",
  "media:delete",

  // Topics
  "topic:read",
  "topic:create",
  "topic:update",
  "topic:delete",

  // Languages
  "language:read",
  "language:manage",

  // Users
  "user:read",
  "user:invite",
  "user:update",
  "user:deactivate",
  "user:delete",
  "user:assign-role",
  "user:reset-password",

  // Analytics
  "analytics:read",

  // Audit
  "audit:read",

  // Settings
  "settings:read",
  "settings:update",

  // Roles & permissions administration
  "role:read",
  "role:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Human-readable groupings for the Roles/Permissions settings UI. */
export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  { label: "Dashboard", permissions: ["dashboard:view"] },
  {
    label: "Library",
    permissions: ["library:read", "library:create", "library:update", "library:delete"],
  },
  { label: "Structure", permissions: ["structure:read", "structure:manage"] },
  {
    label: "Verses",
    permissions: ["verse:read", "verse:create", "verse:update", "verse:delete"],
  },
  {
    label: "Translations",
    permissions: [
      "translation:read",
      "translation:create",
      "translation:update",
      "translation:delete",
      "translation:submit",
    ],
  },
  {
    label: "Reviews",
    permissions: ["review:read", "review:approve", "review:reject", "review:comment"],
  },
  {
    label: "Publishing",
    permissions: [
      "publishing:read",
      "publishing:publish",
      "publishing:unpublish",
      "publishing:schedule",
      "publishing:archive",
    ],
  },
  {
    label: "Media",
    permissions: ["media:read", "media:upload", "media:update", "media:delete"],
  },
  {
    label: "Topics",
    permissions: ["topic:read", "topic:create", "topic:update", "topic:delete"],
  },
  { label: "Languages", permissions: ["language:read", "language:manage"] },
  {
    label: "Users",
    permissions: [
      "user:read",
      "user:invite",
      "user:update",
      "user:deactivate",
      "user:delete",
      "user:assign-role",
      "user:reset-password",
    ],
  },
  { label: "Analytics", permissions: ["analytics:read"] },
  { label: "Audit", permissions: ["audit:read"] },
  { label: "Settings", permissions: ["settings:read", "settings:update"] },
  { label: "Roles", permissions: ["role:read", "role:manage"] },
];
