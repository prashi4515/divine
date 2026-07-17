import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import type { Env } from "../../config/env";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Transactional email via Resend. When DIVINE_RESEND_API_KEY is unset (local
 * without mail), logs a non-secret summary and returns successfully so auth
 * flows remain usable in development.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: Resend | null;
  private readonly from: string;
  private readonly webOrigin: string;

  constructor(private readonly config: ConfigService<Env, true>) {
    const key = this.config.get("DIVINE_RESEND_API_KEY", { infer: true });
    this.client = key ? new Resend(key) : null;
    this.from =
      this.config.get("DIVINE_EMAIL_FROM", { infer: true }) ??
      "Divine <onboarding@resend.dev>";
    this.webOrigin = this.config.get("DIVINE_WEB_ORIGIN", { infer: true });
  }

  verificationUrl(token: string): string {
    return `${this.webOrigin}/verify-email?token=${encodeURIComponent(token)}`;
  }

  resetPasswordUrl(token: string): string {
    return `${this.webOrigin}/reset-password?token=${encodeURIComponent(token)}`;
  }

  async send(input: SendEmailInput): Promise<void> {
    if (!this.client) {
      this.logger.warn(
        `Email skipped (no DIVINE_RESEND_API_KEY): to=${input.to} subject=${input.subject}`,
      );
      return;
    }

    try {
      const result = await this.client.emails.send({
        from: this.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      if (result.error) {
        this.logger.error(
          `Resend error for ${input.to}: ${result.error.message}`,
        );
        throw new Error(result.error.message);
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send email to ${input.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const url = this.verificationUrl(token);
    await this.send({
      to,
      subject: "Verify your Divine account",
      text: `Verify your email: ${url}`,
      html: `<p>Welcome to Divine.</p><p><a href="${url}">Verify your email</a></p><p>This link expires in 24 hours.</p>`,
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const url = this.resetPasswordUrl(token);
    await this.send({
      to,
      subject: "Reset your Divine password",
      text: `Reset your password: ${url}`,
      html: `<p>Reset your password:</p><p><a href="${url}">Choose a new password</a></p><p>This link expires in 1 hour. If you did not request this, ignore this email.</p>`,
    });
  }
}
