"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth";

/**
 * Clears the session and redirects to /login.
 */
export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    void logout();
  }, [logout]);

  return (
    <p className="text-muted-foreground text-sm" role="status">
      Signing out…
    </p>
  );
}
