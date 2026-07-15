import { z } from "zod";
import { ROLES } from "@/lib/rbac";

/**
 * Web-local auth contracts. These intentionally live in the web app (not
 * `packages/types`) while the auth backend does not yet exist. When the NestJS
 * auth module is implemented, promote the shared shapes to `packages/types` and
 * import them here — the field names below are the proposed contract.
 */

export const roleSchema = z.enum(ROLES);

export const userStatusSchema = z.enum(["active", "invited", "suspended", "deactivated"]);
export type UserStatus = z.infer<typeof userStatusSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  roles: z.array(roleSchema).min(1),
  status: userStatusSchema,
  avatarUrl: z.string().url().nullable().optional(),
  preferredLanguage: z.string().nullable().optional(),
  timeZone: z.string().nullable().optional(),
  lastLoginAt: z.string().datetime().nullable().optional(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const authSessionSchema = z.object({
  user: authUserSchema,
  /** Access token expiry as an ISO timestamp. */
  expiresAt: z.string().datetime(),
});
export type AuthSession = z.infer<typeof authSessionSchema>;

export const loginResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresAt: z.string().datetime(),
    user: authUserSchema,
  }),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const meResponseSchema = z.object({ data: authUserSchema });

export type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type ForgotPasswordInput = { email: string };

export type ResetPasswordInput = {
  token: string;
  password: string;
};
