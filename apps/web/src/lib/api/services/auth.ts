import { http } from "../http";
import { getRefreshToken } from "@/lib/auth/tokens";
import {
  authUserSchema,
  loginResponseSchema,
  meResponseSchema,
  type AuthUser,
  type ForgotPasswordInput,
  type LoginInput,
  type LoginResponse,
  type ResetPasswordInput,
} from "@/lib/auth/types";

export function login(input: LoginInput): Promise<LoginResponse> {
  return http("/v1/auth/login", (json) => loginResponseSchema.parse(json), {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function logout(): Promise<null> {
  return http("/v1/auth/logout", () => null, { method: "POST" });
}

export function fetchMe(): Promise<AuthUser> {
  return http("/v1/auth/me", (json) => meResponseSchema.parse(json).data);
}

export function refreshSession(refreshToken?: string): Promise<LoginResponse> {
  const token = refreshToken || getRefreshToken() || undefined;
  return http("/v1/auth/refresh", (json) => loginResponseSchema.parse(json), {
    method: "POST",
    body: token ? { refreshToken: token } : {},
    auth: false,
    skipRefresh: true,
  });
}

export function register(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<LoginResponse> {
  return http("/v1/auth/register", (json) => loginResponseSchema.parse(json), {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function forgotPassword(input: ForgotPasswordInput): Promise<null> {
  return http("/v1/auth/forgot-password", () => null, {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function resetPassword(input: ResetPasswordInput): Promise<null> {
  return http("/v1/auth/reset-password", () => null, {
    method: "POST",
    body: input,
    auth: false,
  });
}

export { authUserSchema };
