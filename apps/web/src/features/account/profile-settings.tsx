"use client";

import * as React from "react";
import Link from "next/link";
import * as authService from "@/lib/api/services/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/features/auth/auth-provider";
import { useReadingStore } from "@/lib/stores/reading-store";
import { READING_LANGUAGES } from "@/lib/reading/languages";
import { AUTH_ROUTES } from "@/lib/auth/config";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProfileSettings() {
  const { user, status, refresh } = useAuth();
  const setPreferredLanguage = useReadingStore((s) => s.setPreferredLanguage);
  const [editing, setEditing] = React.useState(false);
  const [displayName, setDisplayName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [language, setLanguage] = React.useState("en");
  const [timeZone, setTimeZone] = React.useState("");
  const [theme, setTheme] = React.useState<"system" | "light" | "dark">(
    "system",
  );
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName);
    setUsername(user.username ?? "");
    setLanguage(user.preferredLanguage ?? "en");
    setTimeZone(user.timeZone ?? "");
  }, [user]);

  React.useEffect(() => {
    if (status !== "authenticated") return;
    void authService
      .getPreferences()
      .then((pref) => {
        setTheme(pref.theme);
        setLanguage(pref.language);
        setPreferredLanguage(pref.language);
      })
      .catch(() => {
        /* optional */
      });
  }, [status, setPreferredLanguage]);

  if (status === "loading") {
    return <p className="text-muted-foreground text-sm">Loading profile…</p>;
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="space-y-4 py-10 text-center">
          <p className="font-serif text-2xl tracking-tight">
            Sign in to open My Account
          </p>
          <p className="text-muted-foreground text-sm">
            Create an account to bookmark verses, take notes, and track progress.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href={`${AUTH_ROUTES.login}?next=${AUTH_ROUTES.account}`}>
                Sign in
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={AUTH_ROUTES.signup}>Create account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      await authService.updateProfile({
        displayName,
        username: username.trim() || null,
        preferredLanguage: language,
        timeZone: timeZone.trim() || null,
      });
      await authService.updatePreferences({ language, theme });
      setPreferredLanguage(language);
      await refresh();
      setMessage("Profile saved.");
      setEditing(false);
    } catch (err: unknown) {
      setMessage(
        err instanceof ApiError && err.status === 409
          ? "Username is already taken."
          : "Could not save changes.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
          <Avatar name={user.displayName} size="lg" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-serif text-2xl tracking-tight">
              {user.displayName}
            </p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {user.emailVerifiedAt ? (
                <Badge variant="secondary">Email verified</Badge>
              ) : (
                <Badge variant="muted">
                  <Link href="/verify-email">Verify email</Link>
                </Badge>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant={editing ? "secondary" : "default"}
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Bookmarks" value="0" href="/account/bookmarks" />
        <StatCard label="Notes" value="0" href="/account/notes" />
        <StatCard
          label="Gita reading progress"
          value="0 / 701 verses"
          href="/account/history"
        />
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
            <CardDescription>
              Preferences sync across devices after you sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => void saveProfile(e)}
              className="grid gap-4 sm:grid-cols-2"
            >
              {message ? (
                <p className="text-muted-foreground sm:col-span-2 text-sm">
                  {message}
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="displayName">Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred language</Label>
                <select
                  id="language"
                  className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {READING_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  value={theme}
                  onChange={(e) =>
                    setTheme(e.target.value as "system" | "light" | "dark")
                  }
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="timeZone">Timezone</Label>
                <Input
                  id="timeZone"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  placeholder="Asia/Kolkata"
                />
              </div>

              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving…" : "Save changes"}
                </Button>
                <Button asChild variant="outline" type="button">
                  <Link href="/account/sessions">Device sessions</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="border-border bg-muted/30 hover:bg-muted/50 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors"
    >
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </Link>
  );
}
