import type { Metadata } from "next";
import { AuthCard, LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Divine console.",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue to the Divine console."
      footer={
        <>
          Need access? Ask an administrator for an invite.
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
