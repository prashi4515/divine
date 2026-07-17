import { redirect } from "next/navigation";

/** Alias used by some readers — signup lives at /signup. */
export default function BhagavadGitaSignupAliasPage() {
  redirect("/signup");
}
