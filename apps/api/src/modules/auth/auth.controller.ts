import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import type { Env } from "../../config/env";
import {
  AuthSessionResponseDto,
  DeviceSessionDto,
  ForgotPasswordDto,
  LoginDto,
  MeResponseDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "./auth.dto";
import { AuthService } from "./auth.service";
import {
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
} from "./auth.cookies";
import { CurrentUser } from "./current-user.decorator";
import type { AccessPayload } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private cookieSecure(): boolean {
    return this.config.get("DIVINE_COOKIE_SECURE", { infer: true });
  }

  private meta(req: Request) {
    return {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    };
  }

  @Post("register")
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: "Create a public reader account" })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  async register(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponseDto> {
    const result = await this.authService.register(body, this.meta(req));
    setAuthCookies(res, result.tokens, {
      rememberMe: body.rememberMe ?? false,
      secure: this.cookieSecure(),
    });
    return {
      data: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresAt: result.tokens.expiresAt,
        user: result.user,
      },
    };
  }

  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: "Sign in with email and password" })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponseDto> {
    const result = await this.authService.login(body, this.meta(req));
    setAuthCookies(res, result.tokens, {
      rememberMe: body.rememberMe ?? false,
      secure: this.cookieSecure(),
    });
    return {
      data: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresAt: result.tokens.expiresAt,
        user: result.user,
      },
    };
  }

  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "Sign out and revoke refresh token" })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ data: null }> {
    const refresh =
      (req.cookies?.[REFRESH_COOKIE] as string | undefined) ??
      (req.body as { refreshToken?: string } | undefined)?.refreshToken;
    await this.authService.logout(refresh, this.meta(req));
    clearAuthCookies(res, this.cookieSecure());
    return { data: null };
  }

  @Post("logout-all")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Revoke all sessions except the current one" })
  async logoutAll(
    @CurrentUser() user: AccessPayload,
    @Req() req: Request,
  ): Promise<{ data: null }> {
    const refresh = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.authService.logoutAll(user.sub, refresh, this.meta(req));
    return { data: null };
  }

  @Post("refresh")
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: "Rotate access + refresh tokens" })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { refreshToken?: string },
  ): Promise<AuthSessionResponseDto> {
    const refresh =
      (req.cookies?.[REFRESH_COOKIE] as string | undefined) ?? body.refreshToken;
    if (!refresh) {
      clearAuthCookies(res, this.cookieSecure());
      throw new UnauthorizedException("Missing refresh token");
    }
    try {
      const result = await this.authService.refresh(refresh, this.meta(req));
      setAuthCookies(res, result.tokens, {
        rememberMe: Boolean(req.cookies?.[REFRESH_COOKIE]),
        secure: this.cookieSecure(),
      });
      return {
        data: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresAt: result.tokens.expiresAt,
          user: result.user,
        },
      };
    } catch (error: unknown) {
      clearAuthCookies(res, this.cookieSecure());
      throw error;
    }
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Current authenticated user" })
  @ApiOkResponse({ type: MeResponseDto })
  async me(@CurrentUser() user: AccessPayload): Promise<MeResponseDto> {
    const data = await this.authService.me(user.sub);
    return { data };
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List active device sessions" })
  async sessions(
    @CurrentUser() user: AccessPayload,
    @Req() req: Request,
  ): Promise<{ data: DeviceSessionDto[] }> {
    const refresh = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const data = await this.authService.listSessions(user.sub, refresh);
    return { data };
  }

  @Delete("sessions/:id")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Revoke a device session" })
  async revokeSession(
    @CurrentUser() user: AccessPayload,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<{ data: null }> {
    await this.authService.revokeSession(user.sub, id, this.meta(req));
    return { data: null };
  }

  @Post("forgot-password")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: "Request a password reset email" })
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
    @Req() req: Request,
  ): Promise<{ data: null }> {
    await this.authService.forgotPassword(body.email, this.meta(req));
    return { data: null };
  }

  @Post("reset-password")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: "Reset password with a one-time token" })
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Req() req: Request,
  ): Promise<{ data: null }> {
    await this.authService.resetPassword(body, this.meta(req));
    return { data: null };
  }

  @Post("verify-email")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: "Verify email with a one-time token" })
  async verifyEmail(
    @Body() body: VerifyEmailDto,
    @Req() req: Request,
  ): Promise<MeResponseDto> {
    const data = await this.authService.verifyEmail(body.token, this.meta(req));
    return { data };
  }

  @Post("resend-verification")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: "Resend email verification link" })
  async resendVerification(
    @CurrentUser() user: AccessPayload,
    @Req() req: Request,
  ): Promise<{ data: null }> {
    await this.authService.resendVerification(user.sub, this.meta(req));
    return { data: null };
  }
}
