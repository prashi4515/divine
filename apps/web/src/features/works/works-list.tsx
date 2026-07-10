import type { Work } from "@divine/types";
import { Library } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function WorksList({ works }: { works: Work[] }) {
  if (works.length === 0) {
    return (
      <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="border-border bg-muted/40 mb-3 flex h-9 w-9 items-center justify-center rounded-md border">
          <Library className="text-muted-foreground h-4 w-4" aria-hidden />
        </div>
        <p className="text-sm font-medium">No works published yet</p>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          Published scripture corpora will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {works.map((work) => (
        <li key={work.id}>
          <Card className="h-full text-left transition-divine hover:border-foreground/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="font-serif text-xl tracking-tight">{work.title}</CardTitle>
                <Badge variant="outline" className="shrink-0 font-mono text-[11px]">
                  {work.code}
                </Badge>
              </div>
              <CardDescription className="font-mono text-xs">{work.slug}</CardDescription>
            </CardHeader>
            {work.description ? (
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{work.description}</p>
              </CardContent>
            ) : null}
          </Card>
        </li>
      ))}
    </ul>
  );
}

export function WorksError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="border-border bg-muted/30 rounded-lg border px-6 py-10 text-center"
    >
      <p className="text-sm font-medium">Unable to load works</p>
      <p className="text-muted-foreground mt-1 text-sm">{message}</p>
      <p className="text-muted-foreground mt-3 text-xs">
        Ensure the API is running and DIVINE_API_URL points to it.
      </p>
    </div>
  );
}
