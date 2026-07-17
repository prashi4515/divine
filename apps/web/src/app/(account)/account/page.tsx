import type { Metadata } from "next";
import { ProfileSettings } from "@/features/account/profile-settings";

export const metadata: Metadata = { title: "My Account" };

export default function AccountHomePage() {
  return <ProfileSettings />;
}
