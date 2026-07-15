import { PERMISSIONS, type Permission } from "./permissions";

/**
 * Role catalog. Order is significant for display (most → least privileged).
 * Roles are assigned to users; permissions are derived from roles — never
 * assigned directly to a user in this model.
 */
export const ROLES = [
  "super-admin",
  "admin",
  "content-manager",
  "translator",
  "reviewer",
  "publisher",
  "moderator",
  "support",
  "viewer",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  "content-manager": "Content Manager",
  translator: "Translator",
  reviewer: "Reviewer",
  publisher: "Publisher",
  moderator: "Moderator",
  support: "Support",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  "super-admin": "Unrestricted access to every capability, including roles and settings.",
  admin: "Manages content, users, and settings. No role administration.",
  "content-manager": "Creates and edits scriptures, structure, verses, and topics.",
  translator: "Authors and edits translations for assigned languages.",
  reviewer: "Reviews submitted content; approves, rejects, and comments.",
  publisher: "Publishes, schedules, and archives approved content.",
  moderator: "Moderates AI suggestions and community-reported content.",
  support: "Read access plus limited user assistance actions.",
  viewer: "Read-only access to the console.",
};

const READ_ONLY: Permission[] = [
  "dashboard:view",
  "library:read",
  "structure:read",
  "verse:read",
  "translation:read",
  "review:read",
  "publishing:read",
  "media:read",
  "topic:read",
  "language:read",
  "analytics:read",
];

/**
 * Role → permissions matrix. This is the authorization contract for the UI.
 * `super-admin` receives every permission by construction.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  "super-admin": [...PERMISSIONS],

  admin: [
    ...READ_ONLY,
    "library:create",
    "library:update",
    "library:delete",
    "structure:manage",
    "verse:create",
    "verse:update",
    "verse:delete",
    "translation:create",
    "translation:update",
    "translation:delete",
    "review:approve",
    "review:reject",
    "review:comment",
    "publishing:publish",
    "publishing:unpublish",
    "publishing:schedule",
    "publishing:archive",
    "media:upload",
    "media:update",
    "media:delete",
    "topic:create",
    "topic:update",
    "topic:delete",
    "language:manage",
    "user:read",
    "user:invite",
    "user:update",
    "user:deactivate",
    "user:delete",
    "user:assign-role",
    "user:reset-password",
    "audit:read",
    "settings:read",
    "settings:update",
  ],

  "content-manager": [
    ...READ_ONLY,
    "library:create",
    "library:update",
    "structure:manage",
    "verse:create",
    "verse:update",
    "verse:delete",
    "translation:create",
    "translation:update",
    "topic:create",
    "topic:update",
    "topic:delete",
    "media:upload",
    "media:update",
  ],

  translator: [
    ...READ_ONLY,
    "translation:create",
    "translation:update",
    "translation:submit",
  ],

  reviewer: [
    ...READ_ONLY,
    "review:approve",
    "review:reject",
    "review:comment",
  ],

  publisher: [
    ...READ_ONLY,
    "publishing:publish",
    "publishing:unpublish",
    "publishing:schedule",
    "publishing:archive",
  ],

  moderator: [
    ...READ_ONLY,
    "review:comment",
    "media:update",
  ],

  support: [...READ_ONLY, "user:read"],

  viewer: [...READ_ONLY],
};
