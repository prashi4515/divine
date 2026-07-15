"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from "lucide-react";
import { libraryService } from "@/lib/api/services/library";
import type { Scripture, ScriptureNode } from "@/lib/api/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/features/admin/empty-state";
import { FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScriptureStructureClient({ scriptureId }: { scriptureId: string }) {
  const [scripture, setScripture] = React.useState<Scripture | null>(null);
  const [nodes, setNodes] = React.useState<ScriptureNode[]>([]);
  const [title, setTitle] = React.useState("");
  const [label, setLabel] = React.useState("Chapter");
  const [parentId, setParentId] = React.useState<string>("");
  const [dragId, setDragId] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    const [s, n] = await Promise.all([
      libraryService.get(scriptureId),
      libraryService.listNodes(scriptureId),
    ]);
    setScripture(s);
    setNodes(n);
    if (s.structureLevels[0]) setLabel(s.structureLevels[0]);
  }, [scriptureId]);

  React.useEffect(() => {
    void reload().catch(() => {
      setScripture(null);
      setNodes([]);
    });
  }, [reload]);

  async function addNode() {
    if (!title.trim()) return;
    await libraryService.createNode(scriptureId, {
      title: title.trim(),
      label,
      parentId: parentId || null,
    });
    setTitle("");
    await reload();
  }

  async function removeNode(nodeId: string) {
    await libraryService.deleteNode(scriptureId, nodeId);
    await reload();
  }

  async function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const flat = flatten(nodes);
    const ids = flat.map((n) => n.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]!);
    await libraryService.reorderNodes(scriptureId, ids);
    setDragId(null);
    await reload();
  }

  if (!scripture) {
    return <p className="text-muted-foreground text-sm">Loading structure…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="border-border rounded-lg border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Hierarchy</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {scripture.structureLevels.join(" › ") || "No levels configured"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void libraryService.syncStructure(scriptureId).then(() => reload());
            }}
          >
            Sync from catalog
          </Button>
        </div>
      </div>

      <div className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end">
        <label className="flex-1 space-y-2 text-sm">
          <span className="font-medium">Title</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter 1" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Level</span>
          <select
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          >
            {scripture.structureLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 space-y-2 text-sm">
          <span className="font-medium">Parent</span>
          <select
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">None (root)</option>
            {flatten(nodes).map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}: {node.title}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={() => void addNode()}>
          <Plus className="h-4 w-4" aria-hidden />
          Add node
        </Button>
      </div>

      {nodes.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No structure defined"
          description="Add books, chapters, surahs, or other levels matching this scripture’s hierarchy."
        />
      ) : (
        <ul className="space-y-1">
          {nodes.map((node) => (
            <StructureNode
              key={node.id}
              node={node}
              depth={0}
              onDelete={(id) => void removeNode(id)}
              onDragStart={setDragId}
              onDrop={(id) => void onDrop(id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function StructureNode({
  node,
  depth,
  onDelete,
  onDragStart,
  onDrop,
}: {
  node: ScriptureNode;
  depth: number;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className={cn(
          "border-border hover:bg-muted/40 group flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm",
        )}
        style={{ marginLeft: depth * 16 }}
        draggable
        onDragStart={() => onDragStart(node.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => onDrop(node.id)}
      >
        <GripVertical className="text-muted-foreground h-3.5 w-3.5 shrink-0" aria-hidden />
        {hasChildren ? (
          <button
            type="button"
            className="text-muted-foreground"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-muted-foreground text-xs">{node.label}</span>
        <span className="min-w-0 flex-1 truncate font-medium">{node.title}</span>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100"
          aria-label={`Delete ${node.title}`}
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {open && hasChildren ? (
        <ul className="mt-1 space-y-1">
          {node.children.map((child) => (
            <StructureNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function flatten(nodes: ScriptureNode[]): ScriptureNode[] {
  const out: ScriptureNode[] = [];
  const walk = (list: ScriptureNode[]) => {
    for (const node of list) {
      out.push(node);
      walk(node.children);
    }
  };
  walk(nodes);
  return out;
}
