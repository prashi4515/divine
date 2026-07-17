import Link from "next/link";
import type { Metadata } from "next";
import { AuthCard, LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Divine account.",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue reading with bookmarks, notes, and progress."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-foreground font-medium hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
