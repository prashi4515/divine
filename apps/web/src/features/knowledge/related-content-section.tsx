import { getRelatedContent } from "@/lib/knowledge/related-content";
import { RelatedContentRail } from "@/features/knowledge/related-content-rail";

/**
 * Server section — fetches graph recommendations for any entity id.
 * Works for every published KG entity without hard-coded lists.
 */
export async function RelatedContentSection({
  entityId,
  className,
  title,
  description,
}: {
  entityId: string;
  className?: string;
  title?: string;
  description?: string;
}) {
  const related = await getRelatedContent(entityId);
  if (related.buckets.length === 0) return null;

  return (
    <div className={className ?? "page-gutter mx-auto max-w-4xl pb-16"}>
      <RelatedContentRail
        related={related}
        title={title}
        description={description}
      />
    </div>
  );
}
