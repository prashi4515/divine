import type { Metadata } from "next";
import { AuthCard, ResetPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your Bhagavad Gita account.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <AuthCard
      title="Reset password"
      subtitle="Choose a new password for your account."
    >
      <ResetPasswordForm token={token ?? ""} />
    </AuthCard>
  );
}
