import { createHash, randomBytes } from "node:crypto";
import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { Env } from "../../config/env";
import { AuditService } from "../audit/audit.service";
import { EmailService } from "../email/email.service";
import type {
  AuthUserDto,
  DeviceSessionDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "./auth.dto";

export type AccessPayload = {
  sub: string;
  email: string;
  roles: string[];
  typ: "access";
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshTokenId: string;
};

type RequestMeta = { userAgent?: string; ip?: string };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly email: EmailService,
    private readonly audit: AuditService,
  ) {}

  toUserDto(user: User): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      username: user.username,
      roles: user.roles,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      avatarUrl: user.avatarUrl,
      preferredLanguage: user.preferredLanguage,
      preferredTranslation: user.preferredTranslation,
      preferredCommentary: user.preferredCommentary,
      timeZone: user.timeZone,
      country: user.country,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async register(
    input: RegisterDto,
    meta: RequestMeta,
  ): Promise<{ user: AuthUserDto; tokens: AuthTokens }> {
    const email = input.email.trim().toLowerCase();
    const username = input.username?.trim() || null;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }
    if (username) {
      const taken = await this.prisma.user.findUnique({ where: { username } });
      if (taken) {
        throw new ConflictException("Username is already taken");
      }
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          displayName: input.displayName.trim(),
          username,
          roles: ["reader"],
          status: "active",
          preferredLanguage: "en",
        },
      });
      await tx.authIdentity.create({
        data: {
          userId: created.id,
          provider: "password",
          providerSubject: email,
          passwordHash,
        },
      });
      await tx.readingPreference.create({
        data: { userId: created.id, language: "en" },
      });
      return created;
    });

    await this.sendVerificationEmail(user);
    const tokens = await this.issueTokens(user, {
      rememberMe: input.rememberMe ?? false,
      userAgent: meta.userAgent,
      ip: meta.ip,
    });

    await this.audit.write({
      userId: user.id,
      action: "auth.register",
      entityType: "user",
      entityId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return { user: this.toUserDto(user), tokens };
  }

  async login(
    input: LoginDto,
    meta: RequestMeta,
  ): Promise<{ user: AuthUserDto; tokens: AuthTokens }> {
    const email = input.email.trim().toLowerCase();
    const identity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerSubject: {
          provider: "password",
          providerSubject: email,
        },
      },
      include: { user: true },
    });

    if (
      !identity?.passwordHash ||
      identity.user.status === "suspended" ||
      identity.user.status === "deactivated"
    ) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const ok = await bcrypt.compare(input.password, identity.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const user = await this.prisma.user.update({
      where: { id: identity.userId },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens(user, {
      rememberMe: input.rememberMe ?? false,
      userAgent: meta.userAgent,
      ip: meta.ip,
    });

    await this.audit.write({
      userId: user.id,
      action: "auth.login",
      entityType: "user",
      entityId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
      metadata: { rememberMe: input.rememberMe ?? false },
    });

    return { user: this.toUserDto(user), tokens };
  }

  async refresh(
    refreshToken: string,
    meta: RequestMeta,
  ): Promise<{ user: AuthUserDto; tokens: AuthTokens }> {
    const tokenHash = this.hashToken(refreshToken);
    let stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!stored) {
      const graceSince = new Date(Date.now() - 60_000);
      const recentlyRevoked = await this.prisma.refreshToken.findFirst({
        where: {
          tokenHash,
          revokedAt: { gte: graceSince },
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });
      if (
        recentlyRevoked?.user &&
        recentlyRevoked.user.status !== "suspended" &&
        recentlyRevoked.user.status !== "deactivated"
      ) {
        const tokens = await this.issueTokens(recentlyRevoked.user, {
          rememberMe: recentlyRevoked.rememberMe,
          userAgent: meta.userAgent,
          ip: meta.ip,
          deviceLabel: recentlyRevoked.deviceLabel ?? undefined,
        });
        return { user: this.toUserDto(recentlyRevoked.user), tokens };
      }
      throw new UnauthorizedException("Session expired");
    }

    if (
      stored.user.status === "suspended" ||
      stored.user.status === "deactivated"
    ) {
      throw new UnauthorizedException("Session expired");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(stored.user, {
      rememberMe: stored.rememberMe,
      userAgent: meta.userAgent,
      ip: meta.ip,
      deviceLabel: stored.deviceLabel ?? undefined,
    });

    return { user: this.toUserDto(stored.user), tokens };
  }

  async logout(refreshToken: string | undefined, meta: RequestMeta): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = this.hashToken(refreshToken);
    const row = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
    });
    if (!row) return;

    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });

    await this.audit.write({
      userId: row.userId,
      action: "auth.logout",
      entityType: "refresh_token",
      entityId: row.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  async logoutAll(
    userId: string,
    exceptRefreshToken: string | undefined,
    meta: RequestMeta,
  ): Promise<void> {
    const exceptHash = exceptRefreshToken
      ? this.hashToken(exceptRefreshToken)
      : null;

    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptHash ? { tokenHash: { not: exceptHash } } : {}),
      },
      data: { revokedAt: new Date() },
    });

    await this.audit.write({
      userId,
      action: "auth.logout_all",
      entityType: "user",
      entityId: userId,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  async listSessions(
    userId: string,
    currentRefreshToken: string | undefined,
  ): Promise<DeviceSessionDto[]> {
    const currentHash = currentRefreshToken
      ? this.hashToken(currentRefreshToken)
      : null;

    const rows = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: [{ lastUsedAt: "desc" }, { createdAt: "desc" }],
      take: 50,
    });

    return rows.map((row) => ({
      id: row.id,
      deviceLabel: row.deviceLabel,
      userAgent: row.userAgent,
      ip: row.ip,
      rememberMe: row.rememberMe,
      createdAt: row.createdAt.toISOString(),
      lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
      expiresAt: row.expiresAt.toISOString(),
      current: currentHash !== null && row.tokenHash === currentHash,
    }));
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    meta: RequestMeta,
  ): Promise<void> {
    const row = await this.prisma.refreshToken.findFirst({
      where: { id: sessionId, userId, revokedAt: null },
    });
    if (!row) {
      throw new UnauthorizedException("Session not found");
    }

    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });

    await this.audit.write({
      userId,
      action: "auth.revoke_session",
      entityType: "refresh_token",
      entityId: row.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  async me(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (
      !user ||
      user.status === "suspended" ||
      user.status === "deactivated"
    ) {
      throw new UnauthorizedException("Not authenticated");
    }
    return this.toUserDto(user);
  }

  async forgotPassword(emailRaw: string, meta: RequestMeta): Promise<void> {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const raw = randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(raw);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    try {
      await this.email.sendPasswordResetEmail(email, raw);
    } catch {
      if (this.config.get("NODE_ENV", { infer: true }) !== "production") {
        this.logger.warn(
          `Password reset email failed; dev token for ${email}: ${raw}`,
        );
      }
    }

    await this.audit.write({
      userId: user.id,
      action: "auth.forgot_password",
      entityType: "user",
      entityId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  async resetPassword(
    input: ResetPasswordDto,
    meta: RequestMeta,
  ): Promise<void> {
    const tokenHash = this.hashToken(input.token);
    const row = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!row) {
      throw new UnauthorizedException("Invalid or expired reset token");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.authIdentity.upsert({
        where: {
          provider_providerSubject: {
            provider: "password",
            providerSubject: row.user.email,
          },
        },
        create: {
          userId: row.userId,
          provider: "password",
          providerSubject: row.user.email,
          passwordHash,
        },
        update: { passwordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: row.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.audit.write({
      userId: row.userId,
      action: "auth.reset_password",
      entityType: "user",
      entityId: row.userId,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  async verifyEmail(token: string, meta: RequestMeta): Promise<AuthUserDto> {
    const tokenHash = this.hashToken(token);
    const row = await this.prisma.emailVerificationToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!row) {
      throw new UnauthorizedException("Invalid or expired verification token");
    }

    const [user] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: {
          emailVerifiedAt: new Date(),
          status: "active",
        },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.audit.write({
      userId: user.id,
      action: "auth.verify_email",
      entityType: "user",
      entityId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return this.toUserDto(user);
  }

  async resendVerification(userId: string, meta: RequestMeta): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("Not authenticated");
    }
    if (user.emailVerifiedAt) return;

    await this.sendVerificationEmail(user);
    await this.audit.write({
      userId: user.id,
      action: "auth.resend_verification",
      entityType: "user",
      entityId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const raw = randomBytes(32).toString("hex");
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(raw),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    try {
      await this.email.sendVerificationEmail(user.email, raw);
    } catch {
      if (this.config.get("NODE_ENV", { infer: true }) !== "production") {
        this.logger.warn(
          `Verification email failed; dev token for ${user.email}: ${raw}`,
        );
      }
    }
  }

  private async issueTokens(
    user: User,
    opts: {
      rememberMe: boolean;
      userAgent?: string;
      ip?: string;
      deviceLabel?: string;
    },
  ): Promise<AuthTokens> {
    const accessTtl = this.config.get("DIVINE_JWT_ACCESS_TTL", { infer: true });
    const refreshTtl = opts.rememberMe
      ? this.config.get("DIVINE_JWT_REFRESH_TTL_REMEMBER", { infer: true })
      : this.config.get("DIVINE_JWT_REFRESH_TTL", { infer: true });

    const accessSecret = this.config.get("DIVINE_JWT_ACCESS_SECRET", {
      infer: true,
    });

    const payload: AccessPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      typ: "access",
    };

    const accessToken = await this.jwt.signAsync(
      { ...payload },
      {
        secret: accessSecret,
        expiresIn: accessTtl as
          | `${number}m`
          | `${number}s`
          | `${number}h`
          | `${number}d`,
      },
    );

    const refreshRaw = randomBytes(48).toString("hex");
    const refreshExpiresAt = this.parseTtlToDate(refreshTtl);
    const deviceLabel =
      opts.deviceLabel ?? this.inferDeviceLabel(opts.userAgent);

    const created = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshRaw),
        expiresAt: refreshExpiresAt,
        rememberMe: opts.rememberMe,
        userAgent: opts.userAgent ?? null,
        ip: opts.ip ?? null,
        deviceLabel,
        lastUsedAt: new Date(),
      },
    });

    const decoded = this.jwt.decode(accessToken) as { exp?: number } | null;
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000).toISOString()
      : new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return {
      accessToken,
      refreshToken: refreshRaw,
      expiresAt,
      refreshTokenId: created.id,
    };
  }

  private inferDeviceLabel(userAgent?: string): string | null {
    if (!userAgent) return null;
    const ua = userAgent.toLowerCase();
    if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
    if (ua.includes("android")) return "Android";
    if (ua.includes("mac os")) return "macOS";
    if (ua.includes("windows")) return "Windows";
    if (ua.includes("linux")) return "Linux";
    return "Web";
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private parseTtlToDate(ttl: string): Date {
    const match = /^(\d+)([smhd])$/.exec(ttl.trim());
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const n = Number(match[1]);
    const unit = match[2];
    const ms =
      unit === "s"
        ? n * 1000
        : unit === "m"
          ? n * 60 * 1000
          : unit === "h"
            ? n * 60 * 60 * 1000
            : n * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + ms);
  }
}
