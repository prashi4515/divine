import { ROLE_PERMISSIONS, ROLES, type Role } from "./roles";
import type { Permission } from "./permissions";

export { PERMISSIONS, PERMISSION_GROUPS, type Permission } from "./permissions";
export {
  ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_PERMISSIONS,
  type Role,
} from "./roles";

/** Narrow API role strings to known CMS roles (ignores public `reader`, etc.). */
export function asCmsRoles(roles: readonly string[]): Role[] {
  const known = new Set<string>(ROLES);
  return roles.filter((role): role is Role => known.has(role));
}

/** Does a single role grant the permission? */
export function roleCan(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Does ANY of the user's roles grant the permission? (roles are additive) */
export function can(roles: readonly Role[], permission: Permission): boolean {
  return roles.some((role) => roleCan(role, permission));
}

/** Does the user hold every one of the given permissions? */
export function canAll(
  roles: readonly Role[],
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => can(roles, permission));
}

/** Does the user hold at least one of the given permissions? */
export function canAny(
  roles: readonly Role[],
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => can(roles, permission));
}

/** Flatten a set of roles into the union of their permissions. */
export function permissionsForRoles(roles: readonly Role[]): Permission[] {
  const set = new Set<Permission>();
  for (const role of roles) {
    for (const permission of ROLE_PERMISSIONS[role]) set.add(permission);
  }
  return [...set];
}
