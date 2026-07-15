"use client";

import * as React from "react";
import { usePermissions } from "./use-permissions";
import type { Permission } from "@/lib/rbac";

type CanProps = {
  /** Require a single permission. */
  permission?: Permission;
  /** Require ANY of these permissions. */
  anyOf?: Permission[];
  /** Require ALL of these permissions. */
  allOf?: Permission[];
  /** Rendered when the check fails. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Declarative permission gate. UX only — the server remains the source of
 * truth for authorization. Use to hide/disable actions the user cannot perform.
 */
export function Can({ permission, anyOf, allOf, fallback = null, children }: CanProps) {
  const perms = usePermissions();

  let allowed = true;
  if (permission) allowed = allowed && perms.can(permission);
  if (anyOf && anyOf.length > 0) allowed = allowed && perms.canAny(anyOf);
  if (allOf && allOf.length > 0) allowed = allowed && perms.canAll(allOf);

  return <>{allowed ? children : fallback}</>;
}
