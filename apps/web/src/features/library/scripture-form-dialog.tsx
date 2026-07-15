"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { STRUCTURE_PRESETS, type Scripture } from "@/lib/api/schemas";
import { ApiError } from "@/lib/api/client";

export type ScriptureFormValues = {
  name: string;
  slug: string;
  shortName: string;
  description: string;
  religion: string;
  originalLanguage: string;
  author: string;
  estimatedDate: string;
  coverImageUrl: string;
  bannerImageUrl: string;
  themeColor: string;
  seoTitle: string;
  seoDescription: string;
  copyright: string;
  license: string;
  website: string;
  isPublished: boolean;
  structureLevels: string[];
  structurePreset: string;
};

const emptyValues: ScriptureFormValues = {
  name: "",
  slug: "",
  shortName: "",
  description: "",
  religion: "",
  originalLanguage: "",
  author: "",
  estimatedDate: "",
  coverImageUrl: "",
  bannerImageUrl: "",
  themeColor: "",
  seoTitle: "",
  seoDescription: "",
  copyright: "",
  license: "",
  website: "",
  isPublished: false,
  structureLevels: ["Chapter", "Verse"],
  structurePreset: "gita",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fromScripture(scripture: Scripture): ScriptureFormValues {
  const levels = scripture.structureLevels;
  const preset =
    STRUCTURE_PRESETS.find(
      (p) =>
        p.key !== "custom" &&
        p.levels.length === levels.length &&
        p.levels.every((level, i) => level === levels[i]),
    )?.key ?? "custom";

  return {
    name: scripture.name,
    slug: scripture.slug,
    shortName: scripture.shortName ?? "",
    description: scripture.description ?? "",
    religion: scripture.religion ?? "",
    originalLanguage: scripture.originalLanguage ?? "",
    author: scripture.author ?? "",
    estimatedDate: scripture.estimatedDate ?? "",
    coverImageUrl: scripture.coverImageUrl ?? "",
    bannerImageUrl: scripture.bannerImageUrl ?? "",
    themeColor: scripture.themeColor ?? "",
    seoTitle: scripture.seoTitle ?? "",
    seoDescription: scripture.seoDescription ?? "",
    copyright: scripture.copyright ?? "",
    license: scripture.license ?? "",
    website: scripture.website ?? "",
    isPublished: scripture.isPublished,
    structureLevels: levels.length ? levels : ["Chapter", "Verse"],
    structurePreset: preset,
  };
}

function toPayload(values: ScriptureFormValues) {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    shortName: values.shortName.trim() || undefined,
    description: values.description.trim() || undefined,
    religion: values.religion.trim() || undefined,
    originalLanguage: values.originalLanguage.trim() || undefined,
    author: values.author.trim() || undefined,
    estimatedDate: values.estimatedDate.trim() || undefined,
    coverImageUrl: values.coverImageUrl.trim() || undefined,
    bannerImageUrl: values.bannerImageUrl.trim() || undefined,
    themeColor: values.themeColor.trim() || undefined,
    seoTitle: values.seoTitle.trim() || undefined,
    seoDescription: values.seoDescription.trim() || undefined,
    copyright: values.copyright.trim() || undefined,
    license: values.license.trim() || undefined,
    website: values.website.trim() || undefined,
    isPublished: values.isPublished,
    status: values.isPublished ? "published" : "draft",
    structureLevels: values.structureLevels.filter(Boolean),
  };
}

type ScriptureFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scripture?: Scripture | null;
  onSubmit: (payload: ReturnType<typeof toPayload>) => Promise<void>;
};

export function ScriptureFormDialog({
  open,
  onOpenChange,
  scripture,
  onSubmit,
}: ScriptureFormDialogProps) {
  const [values, setValues] = React.useState<ScriptureFormValues>(emptyValues);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setPending(false);
    if (scripture) {
      setValues(fromScripture(scripture));
      setSlugTouched(true);
    } else {
      setValues(emptyValues);
      setSlugTouched(false);
    }
  }, [open, scripture]);

  function update<K extends keyof ScriptureFormValues>(key: K, value: ScriptureFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!values.name.trim() || !values.slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onSubmit(toPayload(values));
      onOpenChange(false);
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.status === 409
            ? "A scripture with this slug already exists."
            : "Could not save scripture. Please try again."
          : "Could not save scripture. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex max-h-[min(90vh,52rem)] flex-col">
          <DialogHeader>
            <DialogTitle>{scripture ? "Edit scripture" : "New scripture"}</DialogTitle>
            <DialogDescription>
              Configure identity, structure type, media, and SEO for this corpus.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5">
            {error ? (
              <p role="alert" className="border-destructive/40 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm">
                {error}
              </p>
            ) : null}

            <section className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="name">
                <Input id="name" required value={values.name} onChange={(e) => update("name", e.target.value)} />
              </Field>
              <Field label="Slug" htmlFor="slug">
                <Input
                  id="slug"
                  required
                  value={values.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update("slug", e.target.value);
                  }}
                />
              </Field>
              <Field label="Short name" htmlFor="shortName">
                <Input id="shortName" value={values.shortName} onChange={(e) => update("shortName", e.target.value)} />
              </Field>
              <Field label="Religion" htmlFor="religion">
                <Input id="religion" value={values.religion} onChange={(e) => update("religion", e.target.value)} />
              </Field>
              <Field label="Original language" htmlFor="originalLanguage">
                <Input
                  id="originalLanguage"
                  placeholder="sa, he, ar…"
                  value={values.originalLanguage}
                  onChange={(e) => update("originalLanguage", e.target.value)}
                />
              </Field>
              <Field label="Author" htmlFor="author">
                <Input id="author" value={values.author} onChange={(e) => update("author", e.target.value)} />
              </Field>
              <Field label="Estimated date" htmlFor="estimatedDate">
                <Input
                  id="estimatedDate"
                  placeholder="c. 2nd century BCE"
                  value={values.estimatedDate}
                  onChange={(e) => update("estimatedDate", e.target.value)}
                />
              </Field>
              <Field label="Theme color" htmlFor="themeColor">
                <Input id="themeColor" placeholder="#1c1917" value={values.themeColor} onChange={(e) => update("themeColor", e.target.value)} />
              </Field>
            </section>

            <Field label="Description" htmlFor="description">
              <Textarea id="description" value={values.description} onChange={(e) => update("description", e.target.value)} />
            </Field>

            <section className="space-y-3">
              <h3 className="text-sm font-medium">Structure type</h3>
              <select
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                value={values.structurePreset}
                onChange={(e) => {
                  const preset = STRUCTURE_PRESETS.find((p) => p.key === e.target.value);
                  update("structurePreset", e.target.value);
                  if (preset && preset.key !== "custom") {
                    update("structureLevels", [...preset.levels]);
                  }
                }}
                aria-label="Structure preset"
              >
                {STRUCTURE_PRESETS.map((preset) => (
                  <option key={preset.key} value={preset.key}>
                    {preset.label}
                    {preset.levels.length ? ` — ${preset.levels.join(" › ")}` : ""}
                  </option>
                ))}
              </select>
              {values.structurePreset === "custom" ? (
                <Input
                  aria-label="Custom structure levels"
                  placeholder="Book, Chapter, Verse"
                  value={values.structureLevels.join(", ")}
                  onChange={(e) =>
                    update(
                      "structureLevels",
                      e.target.value
                        .split(",")
                        .map((part) => part.trim())
                        .filter(Boolean),
                    )
                  }
                />
              ) : (
                <p className="text-muted-foreground text-xs">
                  {values.structureLevels.join(" › ")}
                </p>
              )}
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <Field label="Cover image" htmlFor="cover">
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    update("coverImageUrl", await readFileAsDataUrl(file));
                  }}
                />
              </Field>
              <Field label="Banner image" htmlFor="banner">
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    update("bannerImageUrl", await readFileAsDataUrl(file));
                  }}
                />
              </Field>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <Field label="SEO title" htmlFor="seoTitle">
                <Input id="seoTitle" value={values.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} />
              </Field>
              <Field label="Website" htmlFor="website">
                <Input id="website" value={values.website} onChange={(e) => update("website", e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="SEO description" htmlFor="seoDescription">
                  <Textarea id="seoDescription" value={values.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} />
                </Field>
              </div>
              <Field label="Copyright" htmlFor="copyright">
                <Input id="copyright" value={values.copyright} onChange={(e) => update("copyright", e.target.value)} />
              </Field>
              <Field label="License" htmlFor="license">
                <Input id="license" value={values.license} onChange={(e) => update("license", e.target.value)} />
              </Field>
            </section>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="border-input accent-foreground h-4 w-4 rounded border"
                checked={values.isPublished}
                onChange={(e) => update("isPublished", e.target.checked)}
              />
              <span>Published</span>
            </label>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : scripture ? (
                "Save changes"
              ) : (
                "Create scripture"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
