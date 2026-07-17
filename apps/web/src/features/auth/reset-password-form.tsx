"use client";

import * as React from "react";
import Link from "next/link";
import * as authService from "@/lib/api/services/auth";
import { AUTH_ROUTES } from "@/lib/auth/config";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await authService.resetPassword({ token, password });
      setDone(true);
    } catch (err: unknown) {
      setError(
        err instanceof ApiError && err.status === 0
          ? "Cannot reach the server. Please try again."
          : "This reset link is invalid or has expired.",
      );
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Button asChild className="w-full">
          <Link href={AUTH_ROUTES.login}>Back to sign in</Link>
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <p className="text-muted-foreground text-sm leading-relaxed">
        This reset link is missing its token. Request a new link from the{" "}
        <Link href={AUTH_ROUTES.forgotPassword} className="text-ink hover:underline">
          forgot password
        </Link>{" "}
        page.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error ? (
        <p
          role="alert"
          className="border-destructive/40 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}
