"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authService } from "@/lib/api/services";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/features/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const sent = searchParams.get("sent") === "1";
  const { user, refresh, status } = useAuth();
  const [state, setState] = React.useState<
    "idle" | "verifying" | "ok" | "error"
  >(token ? "verifying" : "idle");
  const [message, setMessage] = React.useState<string | null>(null);
  const [resending, setResending] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;
    let active = true;
    void (async () => {
      try {
        await authService.verifyEmail(token);
        if (!active) return;
        setState("ok");
        setMessage("Email verified. You can continue reading.");
        try {
          await refresh();
        } catch {
          /* session optional */
        }
      } catch (err: unknown) {
        if (!active) return;
        setState("error");
        setMessage(
          err instanceof ApiError
            ? "This verification link is invalid or expired."
            : "Could not verify email.",
        );
      }
    })();
    return () => {
      active = false;
    };
  }, [token, refresh]);

  async function resend() {
    setResending(true);
    setMessage(null);
    try {
      await authService.resendVerification();
      setMessage("A new verification email was sent.");
    } catch {
      setMessage("Could not resend verification email. Sign in and try again.");
    } finally {
      setResending(false);
    }
  }

  if (state === "verifying") {
    return <p className="text-muted-foreground text-sm">Verifying…</p>;
  }

  return (
    <div className="space-y-4 text-sm">
      {sent && state === "idle" ? (
        <p className="text-muted-foreground">
          We sent a verification link to your email. Click it to confirm your
          account.
        </p>
      ) : null}

      {user?.emailVerifiedAt ? (
        <p className="text-foreground">
          Your email ({user.email}) is verified.
        </p>
      ) : null}

      {message ? (
        <p
          role="status"
          className={
            state === "error"
              ? "text-destructive"
              : "text-muted-foreground"
          }
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {status === "authenticated" && !user?.emailVerifiedAt ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={resending}
            onClick={() => void resend()}
          >
            {resending ? "Sending…" : "Resend email"}
          </Button>
        ) : null}
        <Button asChild size="sm">
          <Link href="/bhagavad-gita">Continue reading</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/profile">Profile</Link>
        </Button>
      </div>
    </div>
  );
}
