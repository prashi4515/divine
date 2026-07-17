import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/auth-card";
import { VerifyEmailClient } from "@/features/auth/verify-email-client";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Verify your email"
      subtitle="Confirm your address to finish setting up your account."
    >
      <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
        <VerifyEmailClient />
      </Suspense>
    </AuthCard>
  );
}
