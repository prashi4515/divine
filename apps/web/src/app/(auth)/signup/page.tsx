import Link from "next/link";
import type { Metadata } from "next";
import { AuthCard, SignupForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Divine account.",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Read, bookmark, and continue where you left off."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-ink hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
