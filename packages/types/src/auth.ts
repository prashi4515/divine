import { z } from "zod";

export const userStatusSchema = z.enum([
  "active",
  "invited",
  "suspended",
  "deactivated",
  "pending_verification",
]);
export type UserStatus = z.infer<typeof userStatusSchema>;

export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1),
  username: z.string().nullable(),
  roles: z.array(z.string()),
  status: userStatusSchema,
  emailVerifiedAt: z.string().datetime().nullable(),
  avatarUrl: z.string().nullable(),
  preferredLanguage: z.string().nullable(),
  preferredTranslation: z.string().nullable(),
  preferredCommentary: z.string().nullable(),
  timeZone: z.string().nullable(),
  country: z.string().nullable(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const loginResponseSchema = z.object({
  data: z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    expiresAt: z.string().datetime(),
    user: authUserSchema,
  }),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const meResponseSchema = z.object({ data: authUserSchema });

export const registerInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(255),
  username: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  rememberMe: z.boolean().optional(),
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const deviceSessionSchema = z.object({
  id: z.string().uuid(),
  deviceLabel: z.string().nullable(),
  userAgent: z.string().nullable(),
  ip: z.string().nullable(),
  rememberMe: z.boolean(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime(),
  current: z.boolean(),
});
export type DeviceSession = z.infer<typeof deviceSessionSchema>;

export const deviceSessionsResponseSchema = z.object({
  data: z.array(deviceSessionSchema),
});

export const readingPreferenceSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  language: z.string().min(1).max(16),
  translationSourceKey: z.string().max(64).nullable(),
  commentarySourceKey: z.string().max(64).nullable(),
  fontSize: z.string().min(1).max(32),
  fontFamily: z.string().min(1).max(64),
  readerWidth: z.string().min(1).max(32),
  lineHeight: z.string().min(1).max(32),
  layout: z.string().min(1).max(32),
  updatedAt: z.string().datetime(),
});
export type ReadingPreference = z.infer<typeof readingPreferenceSchema>;

export const readingPreferenceResponseSchema = z.object({
  data: readingPreferenceSchema,
});

export const updateReadingPreferenceSchema = readingPreferenceSchema
  .omit({ updatedAt: true })
  .partial();
export type UpdateReadingPreferenceInput = z.infer<
  typeof updateReadingPreferenceSchema
>;

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  username: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-zA-Z0-9_]+$/)
    .nullable()
    .optional(),
  avatarUrl: z.string().url().nullable().optional(),
  preferredLanguage: z.string().max(16).nullable().optional(),
  preferredTranslation: z.string().max(64).nullable().optional(),
  preferredCommentary: z.string().max(64).nullable().optional(),
  timeZone: z.string().max(64).nullable().optional(),
  country: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/)
    .nullable()
    .optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
