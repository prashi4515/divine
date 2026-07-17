import { z } from "zod";

/**
 * Single source of truth for environment variables. Parsed once at boot by
 * ConfigModule (see app.module.ts). If anything is missing or malformed the
 * process fails fast with a clear message instead of crashing later at runtime.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DIVINE_API_PORT: z.coerce.number().int().positive().default(8080),
  DIVINE_DATABASE_URL: z.string().min(1, "DIVINE_DATABASE_URL is required"),
  // Only used by the Prisma CLI at migration time (via directUrl). Optional at
  // runtime so the API can boot with just the pooled URL.
  DIVINE_DIRECT_URL: z.string().optional(),
  DIVINE_WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  DIVINE_LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  DIVINE_JWT_ACCESS_SECRET: z
    .string()
    .min(32, "DIVINE_JWT_ACCESS_SECRET must be at least 32 characters"),
  DIVINE_JWT_REFRESH_SECRET: z
    .string()
    .min(32, "DIVINE_JWT_REFRESH_SECRET must be at least 32 characters"),
  DIVINE_JWT_ACCESS_TTL: z.string().default("15m"),
  DIVINE_JWT_REFRESH_TTL: z.string().default("7d"),
  DIVINE_JWT_REFRESH_TTL_REMEMBER: z.string().default("30d"),
  DIVINE_COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  /** Resend API key. Optional in development (emails are logged instead). */
  DIVINE_RESEND_API_KEY: z.string().optional(),
  /** From address, e.g. "Divine <noreply@yourdomain.com>" */
  DIVINE_EMAIL_FROM: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validator handed to `ConfigModule.forRoot({ validate })`.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const issues = JSON.stringify(parsed.error.flatten().fieldErrors, null, 2);
    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  return parsed.data;
}
