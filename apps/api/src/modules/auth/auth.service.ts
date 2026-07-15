import { createHash, randomBytes } from "node:crypto";
import {
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
import type { AuthUserDto, LoginDto, ResetPasswordDto } from "./auth.dto";

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
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  toUserDto(user: User): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      status: user.status,
      avatarUrl: user.avatarUrl,
      preferredLanguage: user.preferredLanguage,
      timeZone: user.timeZone,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    };
  }

  async login(
    input: LoginDto,
    meta: { userAgent?: string; ip?: string },
  ): Promise<{ user: AuthUserDto; tokens: AuthTokens }> {
    const email = input.email.trim().toLowerCase();
    const identity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerSubject: { provider: "password", providerSubject: email },
      },
      include: { user: true },
    });

    if (!identity?.passwordHash || identity.user.status !== "active") {
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

    return { user: this.toUserDto(user), tokens };
  }

  async refresh(
    refreshToken: string,
    meta: { userAgent?: string; ip?: string },
  ): Promise<{ user: AuthUserDto; tokens: AuthTokens }> {
    const tokenHash = this.hashToken(refreshToken);
    let stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    // Grace for concurrent refresh / aborted responses: the first caller may have
    // already rotated (revoked) this token before the client stored the replacement.
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
      if (recentlyRevoked?.user.status === "active") {
        const tokens = await this.issueTokens(recentlyRevoked.user, {
          rememberMe: recentlyRevoked.rememberMe,
          userAgent: meta.userAgent,
          ip: meta.ip,
        });
        return { user: this.toUserDto(recentlyRevoked.user), tokens };
      }
      throw new UnauthorizedException("Session expired");
    }

    if (stored.user.status !== "active") {
      throw new UnauthorizedException("Session expired");
    }

    // Rotate: revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(stored.user, {
      rememberMe: stored.rememberMe,
      userAgent: meta.userAgent,
      ip: meta.ip,
    });

    return { user: this.toUserDto(stored.user), tokens };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== "active") {
      throw new UnauthorizedException("Not authenticated");
    }
    return this.toUserDto(user);
  }

  async forgotPassword(emailRaw: string): Promise<void> {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always succeed to avoid account enumeration
    if (!user) return;

    const raw = randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(raw);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    // Email delivery is not wired yet — log a non-secret hint in development.
    this.logger.warn(
      `Password reset requested for ${email}. Dev reset token (do not log in production): ${raw}`,
    );
  }

  async resetPassword(input: ResetPasswordDto): Promise<void> {
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
  }

  private async issueTokens(
    user: User,
    opts: { rememberMe: boolean; userAgent?: string; ip?: string },
  ): Promise<AuthTokens> {
    const accessTtl = this.config.get("DIVINE_JWT_ACCESS_TTL", { infer: true });
    const refreshTtl = opts.rememberMe
      ? this.config.get("DIVINE_JWT_REFRESH_TTL_REMEMBER", { infer: true })
      : this.config.get("DIVINE_JWT_REFRESH_TTL", { infer: true });

    const accessSecret = this.config.get("DIVINE_JWT_ACCESS_SECRET", { infer: true });

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
        expiresIn: accessTtl as `${number}m` | `${number}s` | `${number}h` | `${number}d`,
      },
    );

    const refreshRaw = randomBytes(48).toString("hex");
    const refreshExpiresAt = this.parseTtlToDate(refreshTtl);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshRaw),
        expiresAt: refreshExpiresAt,
        rememberMe: opts.rememberMe,
        userAgent: opts.userAgent ?? null,
        ip: opts.ip ?? null,
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
    };
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
