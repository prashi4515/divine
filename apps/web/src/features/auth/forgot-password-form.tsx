"use client";

import * as React from "react";
import { authService } from "@/lib/api/services";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch (err: unknown) {
      // Don't reveal whether the email exists; only surface transport failures.
      if (err instanceof ApiError && err.status === 0) {
        setError("Cannot reach the server. Please try again.");
      } else {
        setSent(true);
      }
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p className="text-muted-foreground text-sm leading-relaxed">
        If an account exists for <span className="text-foreground">{email}</span>, a
        password reset link is on its way. Check your inbox and spam folder.
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
