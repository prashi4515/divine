import Link from "next/link";
import type { Metadata } from "next";
import { AuthCard, ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Bhagavad Gita account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email and we'll send a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-ink hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
