import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable, from, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

/**
 * Attaches `req.user` when a valid JWT is present; otherwise continues as guest.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const result = super.canActivate(context);
    if (typeof result === "boolean") return result;
    if (result instanceof Promise) {
      return result.catch(() => true);
    }
    return from(result).pipe(
      map(() => true),
      catchError(() => of(true)),
    );
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser | null {
    if (err || !user) return null;
    return user;
  }
}
