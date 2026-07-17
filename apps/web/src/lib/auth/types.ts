/**
 * Auth contracts — re-exported from `@divine/types` so web and API share one schema.
 */
export {
  userStatusSchema,
  authUserSchema,
  loginResponseSchema,
  meResponseSchema,
  registerInputSchema,
  deviceSessionSchema,
  deviceSessionsResponseSchema,
  readingPreferenceSchema,
  readingPreferenceResponseSchema,
  updateReadingPreferenceSchema,
  updateProfileSchema,
  type UserStatus,
  type AuthUser,
  type LoginResponse,
  type RegisterInput,
  type DeviceSession,
  type ReadingPreference,
  type UpdateReadingPreferenceInput,
  type UpdateProfileInput,
} from "@divine/types";

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
