/**
 * Atlas renderer contract — separate from data/engine.
 * Swap illustrated artwork by registering a new renderer; scene stays stable.
 */
import type { ReactNode } from "react";
import type { AtlasScene } from "@/lib/atlas/engine/build-scene";

export type AtlasRenderHandlers = {
  onSelectPlace?: (slug: string) => void;
  onSelectCluster?: (clusterId: string, placeIds: string[]) => void;
  onHoverPlace?: (id: string | null) => void;
  onActivateRoute?: (routeId: string | null) => void;
};

export type AtlasViewport = {
  width: number;
  height: number;
  /** Camera pan/zoom applied by the shell; renderer draws in projection space. */
  camera: { x: number; y: number; k: number };
};

export type AtlasRenderProps = {
  scene: AtlasScene;
  viewport: AtlasViewport;
  handlers?: AtlasRenderHandlers;
  className?: string;
};

/**
 * Pluggable map renderer.
 * Implementations must not load KG or fetch — only draw the given scene.
 */
export type AtlasRenderer = {
  /** Stable id — matches dataset.baseMapProviderId when dedicated. */
  readonly id: string;
  readonly label: string;
  render(props: AtlasRenderProps): ReactNode;
};

export type AtlasRendererRegistry = ReadonlyMap<string, AtlasRenderer>;

export function createRendererRegistry(
  renderers: readonly AtlasRenderer[],
): AtlasRendererRegistry {
  return new Map(renderers.map((r) => [r.id, r]));
}

export function resolveRenderer(
  registry: AtlasRendererRegistry,
  preferredId: string,
  fallbackId = "placeholder",
): AtlasRenderer {
  return (
    registry.get(preferredId) ??
    registry.get(fallbackId) ??
    [...registry.values()][0]!
  );
}
