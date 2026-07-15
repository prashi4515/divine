import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { AccessPayload } from "./auth.service";

export type AuthRequest = Request & { user?: AccessPayload };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccessPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user;
  },
);
