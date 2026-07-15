import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
  ForgotPasswordDto,
  LoginDto,
  MeResponseDto,
  ResetPasswordDto,
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

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Sign in with email and password" })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponseDto> {
    const result = await this.authService.login(body, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
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
    await this.authService.logout(refresh);
    clearAuthCookies(res, this.cookieSecure());
    return { data: null };
  }

  @Post("refresh")
  @HttpCode(200)
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
      const result = await this.authService.refresh(refresh, {
        userAgent: req.headers["user-agent"],
        ip: req.ip,
      });
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

  @Post("forgot-password")
  @HttpCode(200)
  @ApiOperation({ summary: "Request a password reset email" })
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<{ data: null }> {
    await this.authService.forgotPassword(body.email);
    return { data: null };
  }

  @Post("reset-password")
  @HttpCode(200)
  @ApiOperation({ summary: "Reset password with a one-time token" })
  async resetPassword(@Body() body: ResetPasswordDto): Promise<{ data: null }> {
    await this.authService.resetPassword(body);
    return { data: null };
  }
}
