"use client";

import * as React from "react";
import Link from "next/link";
import { authService } from "@/lib/api/services";
import type { DeviceSession } from "@/lib/auth/types";
import { useAuth } from "@/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SessionsPanel() {
  const { status } = useAuth();
  const [sessions, setSessions] = React.useState<DeviceSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSessions(await authService.listSessions());
    } catch {
      setError("Could not load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (status === "authenticated") void load();
    else setLoading(false);
  }, [status, load]);

  if (status !== "authenticated") {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Button asChild>
            <Link href="/login?next=/account/sessions">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device sessions</CardTitle>
        <CardDescription>
          Sign out of devices you no longer use. Logout from all keeps this
          browser signed in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              void authService.logoutAll().then(() => load())
            }
          >
            Logout from all other devices
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : null}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <ul className="divide-border divide-y rounded-md border">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {session.deviceLabel ?? "Unknown device"}
                  {session.current ? (
                    <span className="text-muted-foreground ml-2 font-normal">
                      (this device)
                    </span>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-xs">
                  {session.ip ?? "—"} · created{" "}
                  {new Date(session.createdAt).toLocaleString()}
                </p>
              </div>
              {!session.current ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    void authService.revokeSession(session.id).then(() => load())
                  }
                >
                  Revoke
                </Button>
              ) : null}
            </li>
          ))}
          {!loading && sessions.length === 0 ? (
            <li className="text-muted-foreground px-4 py-6 text-sm">
              No active sessions.
            </li>
          ) : null}
        </ul>
      </CardContent>
    </Card>
  );
}
