"use client";

import * as React from "react";
import { ATLAS_VIEWBOX, type Point } from "@/lib/atlas/geo";

export type CameraState = {
  x: number;
  y: number;
  k: number;
};

const MIN_K = 0.75;
const MAX_K = 6;

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

export function fitIndiaCamera(viewW: number, viewH: number): CameraState {
  const pad = 0.9;
  const k = Math.min(
    (viewW / ATLAS_VIEWBOX.width) * pad,
    (viewH / ATLAS_VIEWBOX.height) * pad,
  );
  return {
    k: clamp(k, MIN_K, 1.35),
    x: (viewW - ATLAS_VIEWBOX.width * k) / 2,
    y: (viewH - ATLAS_VIEWBOX.height * k) / 2,
  };
}

/**
 * Camera for the Atlas canvas.
 * Plain wheel → page scroll (never hijacked).
 * Ctrl/Cmd + wheel → map zoom.
 * Drag → pan. Buttons → zoom/fit.
 */
export function useAtlasCamera(
  containerRef: React.RefObject<HTMLElement | null>,
) {
  const [camera, setCamera] = React.useState<CameraState>({
    x: 0,
    y: 0,
    k: 1,
  });
  const [mapActive, setMapActive] = React.useState(false);
  const vel = React.useRef({ x: 0, y: 0 });
  const dragging = React.useRef(false);
  const last = React.useRef<{ x: number; y: number; t: number } | null>(null);
  const spaceDown = React.useRef(false);
  const raf = React.useRef<number>(0);
  const cameraRef = React.useRef(camera);
  cameraRef.current = camera;
  const fittedOnce = React.useRef(false);

  const fitIndia = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    setCamera(fitIndiaCamera(r.width, r.height));
    vel.current = { x: 0, y: 0 };
  }, [containerRef]);

  React.useEffect(() => {
    if (fittedOnce.current) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!fittedOnce.current) {
        fitIndia();
        fittedOnce.current = true;
      }
    });
    ro.observe(el);
    fitIndia();
    fittedOnce.current = true;
    return () => ro.disconnect();
  }, [containerRef, fitIndia]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && mapActive) {
        spaceDown.current = true;
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceDown.current = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [mapActive]);

  React.useEffect(() => {
    const tick = () => {
      const v = vel.current;
      if (!dragging.current && (Math.abs(v.x) > 0.05 || Math.abs(v.y) > 0.05)) {
        setCamera((c) => ({ ...c, x: c.x + v.x, y: c.y + v.y }));
        vel.current = { x: v.x * 0.9, y: v.y * 0.9 };
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const zoomAt = React.useCallback(
    (clientX: number, clientY: number, factor: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      setCamera((c) => {
        const nextK = clamp(c.k * factor, MIN_K, MAX_K);
        const wx = (px - c.x) / c.k;
        const wy = (py - c.y) / c.k;
        return {
          k: nextK,
          x: px - wx * nextK,
          y: py - wy * nextK,
        };
      });
    },
    [containerRef],
  );

  const zoomBy = React.useCallback(
    (factor: number) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor);
    },
    [containerRef, zoomAt],
  );

  const animateTo = React.useCallback(
    (world: Point, targetK = 2.4) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const k = clamp(targetK, MIN_K, MAX_K);
      const target: CameraState = {
        k,
        x: r.width / 2 - world.x * k,
        y: r.height / 2 - world.y * k,
      };
      const start = { ...cameraRef.current };
      const t0 = performance.now();
      const dur = 650;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const step = (now: number) => {
        const t = clamp((now - t0) / dur, 0, 1);
        const e = ease(t);
        setCamera({
          k: start.k + (target.k - start.k) * e,
          x: start.x + (target.x - start.x) * e,
          y: start.y + (target.y - start.y) * e,
        });
        if (t < 1) requestAnimationFrame(step);
      };
      vel.current = { x: 0, y: 0 };
      requestAnimationFrame(step);
    },
    [containerRef],
  );

  /**
   * Wheel zoom only when the map is focused (clicked) AND Ctrl/Cmd is held.
   * Plain scroll always moves the page. Trackpad pinch often sets ctrlKey —
   * we still require mapActive so scrolling the page never zooms the map.
   */
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!mapActive) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      e.stopPropagation();
      const factor = e.deltaY > 0 ? 0.9 : 1.12;
      zoomAt(e.clientX, e.clientY, factor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [containerRef, zoomAt, mapActive]);

  React.useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setMapActive(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [containerRef]);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      setMapActive(true);
      if ((e.target as HTMLElement).closest("[data-atlas-ui]")) return;
      if ((e.target as HTMLElement).closest("[data-marker]")) return;
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      vel.current = { x: 0, y: 0 };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const onPointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !last.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    const dt = Math.max(16, performance.now() - last.current.t);
    vel.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 };
    last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    setCamera((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
  }, []);

  const onPointerUp = React.useCallback(() => {
    dragging.current = false;
    last.current = null;
  }, []);

  const onDoubleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-atlas-ui]")) return;
      zoomAt(e.clientX, e.clientY, 1.4);
    },
    [zoomAt],
  );

  return {
    camera,
    setCamera,
    fitIndia,
    zoomBy,
    zoomAt,
    animateTo,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onDoubleClick,
    mapActive,
    setMapActive,
    minK: MIN_K,
    maxK: MAX_K,
  };
}
