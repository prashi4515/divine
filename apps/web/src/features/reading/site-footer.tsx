"use client";

import { useMessages } from "@/lib/i18n/use-messages";

export function SiteFooter() {
  const t = useMessages();
  return (
    <footer className="border-border mt-auto border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-content flex-col items-center justify-between gap-2 px-6 py-10 text-xs sm:flex-row">
        <span>{t.footer}</span>
        <span>© {new Date().getFullYear()} Divine</span>
      </div>
    </footer>
  );
}
