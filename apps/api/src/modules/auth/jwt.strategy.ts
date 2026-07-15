import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Request } from "express";
import type { Env } from "../../config/env";
import type { AccessPayload } from "./auth.service";
import { ACCESS_COOKIE } from "./auth.cookies";

function cookieOrBearer(req: Request): string | null {
  const fromCookie = req.cookies?.[ACCESS_COOKIE] as string | undefined;
  if (fromCookie) return fromCookie;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieOrBearer]),
      ignoreExpiration: false,
      secretOrKey: config.get("DIVINE_JWT_ACCESS_SECRET", { infer: true }),
    });
  }

  validate(payload: AccessPayload): AccessPayload {
    if (!payload?.sub || payload.typ !== "access") {
      throw new UnauthorizedException("Invalid token");
    }
    return payload;
  }
}
