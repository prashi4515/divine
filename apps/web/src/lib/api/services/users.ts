import { http } from "../http";
import { createResourceClient } from "./resource";
import { adminUserSchema } from "../schemas";
import type { Role } from "@/lib/rbac";

/**
 * User management service. Backed by the future `/v1/admin/users` endpoints.
 */
const base = createResourceClient("/v1/admin/users", adminUserSchema);

export const usersService = {
  ...base,

  invite(input: { email: string; roles: Role[]; displayName?: string }): Promise<null> {
    return http("/v1/admin/users/invite", () => null, { method: "POST", body: input });
  },

  assignRole(id: string, roles: Role[]): Promise<null> {
    return http(`/v1/admin/users/${encodeURIComponent(id)}/roles`, () => null, {
      method: "PUT",
      body: { roles },
    });
  },

  deactivate(id: string): Promise<null> {
    return http(`/v1/admin/users/${encodeURIComponent(id)}/deactivate`, () => null, {
      method: "POST",
    });
  },

  resetPassword(id: string): Promise<null> {
    return http(`/v1/admin/users/${encodeURIComponent(id)}/reset-password`, () => null, {
      method: "POST",
    });
  },
};
