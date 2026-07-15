"use client";

import * as React from "react";
import { useAuth } from "@/features/auth";
import { can, canAll, canAny, type Permission } from "@/lib/rbac";

/**
 * Permission checks bound to the current session's roles. Components ask for
 * capabilities (permissions), never for roles directly.
 */
export function usePermissions() {
  const { user } = useAuth();
  const userRoles = user?.roles;

  return React.useMemo(() => {
    const roles = userRoles ?? [];
    return {
      roles,
      can: (permission: Permission) => can(roles, permission),
      canAll: (permissions: Permission[]) => canAll(roles, permissions),
      canAny: (permissions: Permission[]) => canAny(roles, permissions),
    };
  }, [userRoles]);
}
