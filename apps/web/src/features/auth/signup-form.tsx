"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as authService from "@/lib/api/services/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/features/auth/auth-provider";
import { SignupSuccessDialog } from "@/features/auth/signup-success-dialog";
import { AUTH_ROUTES } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Public account sign-up with success modal (My Account entry).
 */
export function SignupForm() {
  const router = useRouter();
  const { applySession } = useAuth();
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [welcomeName, setWelcomeName] = React.useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await authService.register({
        email,
        password,
        displayName,
      });
      applySession({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        user: result.data.user,
      });
      setWelcomeName(result.data.user.displayName);
      setSuccessOpen(true);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setError("An account with this email already exists. Try signing in.");
      } else if (err instanceof ApiError && err.status === 0) {
        setError(
          "Cannot reach the server. Make sure the API is running on port 8080.",
        );
      } else {
        setError("Could not create your account. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  function goToAccount() {
    setSuccessOpen(false);
    router.push(AUTH_ROUTES.account);
    router.refresh();
  }

  return (
    <>
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <SignupSuccessDialog
        open={successOpen}
        displayName={welcomeName}
        onDismiss={goToAccount}
      />
    </>
  );
}
