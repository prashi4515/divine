import { http } from "../http";
import { getRefreshToken } from "@/lib/auth/tokens";
import {
  authUserSchema,
  deviceSessionsResponseSchema,
  loginResponseSchema,
  meResponseSchema,
  readingPreferenceResponseSchema,
  type AuthUser,
  type DeviceSession,
  type ForgotPasswordInput,
  type LoginInput,
  type LoginResponse,
  type ReadingPreference,
  type RegisterInput,
  type ResetPasswordInput,
  type UpdateProfileInput,
  type UpdateReadingPreferenceInput,
} from "@/lib/auth/types";

export function login(input: LoginInput): Promise<LoginResponse> {
  return http("/v1/auth/login", (json) => loginResponseSchema.parse(json), {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function register(input: RegisterInput): Promise<LoginResponse> {
  return http("/v1/auth/register", (json) => loginResponseSchema.parse(json), {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function logout(): Promise<null> {
  return http("/v1/auth/logout", () => null, { method: "POST" });
}

export function logoutAll(): Promise<null> {
  return http("/v1/auth/logout-all", () => null, { method: "POST" });
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

export function verifyEmail(token: string): Promise<AuthUser> {
  return http(
    "/v1/auth/verify-email",
    (json) => meResponseSchema.parse(json).data,
    {
      method: "POST",
      body: { token },
      auth: false,
    },
  );
}

export function resendVerification(): Promise<null> {
  return http("/v1/auth/resend-verification", () => null, { method: "POST" });
}

export function listSessions(): Promise<DeviceSession[]> {
  return http(
    "/v1/auth/sessions",
    (json) => deviceSessionsResponseSchema.parse(json).data,
  );
}

export function revokeSession(id: string): Promise<null> {
  return http(`/v1/auth/sessions/${id}`, () => null, { method: "DELETE" });
}

export function updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
  return http(
    "/v1/me/profile",
    (json) => meResponseSchema.parse(json).data,
    { method: "PATCH", body: input },
  );
}

export function getPreferences(): Promise<ReadingPreference> {
  return http(
    "/v1/me/preferences",
    (json) => readingPreferenceResponseSchema.parse(json).data,
  );
}

export function updatePreferences(
  input: UpdateReadingPreferenceInput,
): Promise<ReadingPreference> {
  return http(
    "/v1/me/preferences",
    (json) => readingPreferenceResponseSchema.parse(json).data,
    { method: "PATCH", body: input },
  );
}

export { authUserSchema };
