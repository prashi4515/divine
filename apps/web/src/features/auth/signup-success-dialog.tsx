"use client";

import Link from "next/link";
import {
  Bookmark,
  LineChart,
  NotebookPen,
  Sunrise,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AUTH_ROUTES } from "@/lib/auth/config";

const UNLOCKED = [
  {
    title: "Bookmarks",
    body: "Save verses for quick return",
    icon: Bookmark,
  },
  {
    title: "Notes",
    body: "Write your own reflections",
    icon: NotebookPen,
  },
  {
    title: "Progress",
    body: "Track all 18 chapters",
    icon: LineChart,
  },
  {
    title: "Verse of the Day",
    body: "A new shloka in your inbox daily",
    icon: Sunrise,
  },
] as const;

type SignupSuccessDialogProps = {
  open: boolean;
  displayName: string;
  onDismiss: () => void;
};

/**
 * Post-signup welcome — mirrors the familiar “account created” moment readers expect.
 */
export function SignupSuccessDialog({
  open,
  displayName,
  onDismiss,
}: SignupSuccessDialogProps) {
  const firstName = displayName.trim().split(/\s+/)[0] || "friend";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss();
      }}
    >
      <DialogContent className="max-w-md gap-0 p-0 sm:rounded-2xl">
        <div className="space-y-6 p-6 sm:p-8">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="font-serif text-2xl tracking-tight">
              Account created successfully
            </DialogTitle>
            <DialogDescription className="text-base text-foreground">
              Welcome <span className="font-medium">{firstName}</span>
            </DialogDescription>
            <p className="text-muted-foreground text-sm">
              Here&apos;s what you&apos;ve unlocked
            </p>
          </DialogHeader>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {UNLOCKED.map((item) => (
              <li
                key={item.title}
                className="border-border bg-muted/40 flex gap-3 rounded-xl border px-3 py-3"
              >
                <item.icon
                  className="text-foreground mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href={AUTH_ROUTES.account} onClick={onDismiss}>
                Go to My Account
              </Link>
            </Button>
            <button
              type="button"
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground mx-auto block text-sm underline-offset-4 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
