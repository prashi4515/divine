import { Images } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { EmptyState } from "@/features/admin/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Media" };

const MEDIA_TYPES = ["All", "Images", "Audio", "Video", "PDF", "Illustrations"];

export default function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Media"
        description="Central library for images, audio recitations, video, PDFs, and illustrations. Organized into folders with upload, replace, optimize, and delete."
        actionLabel="Upload"
      />
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Media types">
        {MEDIA_TYPES.map((type) => (
          <Badge key={type} variant={type === "All" ? "secondary" : "outline"}>
            {type}
          </Badge>
        ))}
      </div>
      <EmptyState
        icon={Images}
        title="No media yet"
        description="Upload assets or create folders to organize media across scriptures."
        actionLabel="Upload media"
      />
    </div>
  );
}
