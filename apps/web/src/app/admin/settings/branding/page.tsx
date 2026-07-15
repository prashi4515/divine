import { Palette } from "lucide-react";
import { EmptyState } from "@/features/admin/empty-state";

export const metadata = { title: "Branding" };

export default function BrandingSettingsPage() {
  return (
    <EmptyState
      icon={Palette}
      title="Branding"
      description="Logo, colors, and typography for public surfaces will be configured here."
      actionLabel="Edit branding"
    />
  );
}
