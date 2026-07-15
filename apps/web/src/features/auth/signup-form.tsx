"use client";

import * as React from "react";
import { authService } from "@/lib/api/services";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Public account sign-up. Social providers are placeholders until OAuth is wired.
 */
export function SignupForm() {
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await authService.register({ email, password, displayName });
    } catch (err: unknown) {
      setError(
        err instanceof ApiError && err.status === 0
          ? "Cannot reach the server. Please try again."
          : "Could not create your account. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Button variant="outline" className="w-full" disabled>
          Continue with Google
        </Button>
        <Button variant="outline" className="w-full" disabled>
          Continue with Apple
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" aria-hidden />
        <span className="text-muted-foreground text-xs">or</span>
        <span className="bg-border h-px flex-1" aria-hidden />
      </div>

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
          <Label htmlFor="displayName">Name</Label>
          <Input
            id="displayName"
            autoComplete="name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
