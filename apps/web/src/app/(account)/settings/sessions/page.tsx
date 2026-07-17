import type { Metadata } from "next";
import { SessionsPanel } from "@/features/account/sessions-panel";

export const metadata: Metadata = { title: "Sessions" };

export default function SessionsPage() {
  return <SessionsPanel />;
}
