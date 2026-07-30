"use client";

import * as React from "react";

export type TimelineCamera = {
  x: number;
  y: number;
  k: number;
};

const MIN_K = 0.55;
const MAX_K = 3.2;

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

export function fitTimelineCamera(
  viewW: number,
  viewH: number,
  worldW: number,
  worldH: number,
): TimelineCamera {
  const pad = 0.92;
  const k = Math.min((viewW / worldW) * pad, (viewH / worldH) * pad, 1.15);
  return {
    k: clamp(k, MIN_K, 1.2),
    x: (viewW - worldW * k) / 2,
    y: (viewH - worldH * k) / 2,
  };
}

/**
 * Horizontal Timeline camera.
 * Plain wheel → horizontal pan (when map focused).
 * Ctrl/Cmd + wheel → zoom.
 * Drag → pan. Does not steal page scroll until the canvas is focused.
 */
export function useTimelineCamera(
  containerRef: React.RefObject<HTMLElement | null>,
  worldW: number,
  worldH: number,
) {
  const [camera, setCamera] = React.useState<TimelineCamera>({
    x: 0,
    y: 0,
    k: 1,
  });
  const [active, setActive] = React.useState(false);
  const dragging = React.useRef(false);
  const last = React.useRef<{ x: number; y: number } | null>(null);
  const cameraRef = React.useRef(camera);
  cameraRef.current = camera;
  const fitted = React.useRef(false);

  const fit = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    setCamera(fitTimelineCamera(r.width, r.height, worldW, worldH));
  }, [containerRef, worldW, worldH]);

  React.useEffect(() => {
    fitted.current = false;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!fitted.current) {
        fit();
        fitted.current = true;
      }
    });
    ro.observe(el);
    fit();
    fitted.current = true;
    return () => ro.disconnect();
  }, [containerRef, fit]);

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

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!active) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.12;
        zoomAt(e.clientX, e.clientY, factor);
        return;
      }
      // Focused timeline: convert vertical wheel into horizontal pan
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        setCamera((c) => ({ ...c, x: c.x - e.deltaY }));
      } else if (e.deltaX !== 0) {
        e.preventDefault();
        setCamera((c) => ({ ...c, x: c.x - e.deltaX }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [containerRef, active, zoomAt]);

  React.useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setActive(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [containerRef]);

  const onPointerDown = React.useCallback((e: React.PointerEvent) => {
    setActive(true);
    if ((e.target as HTMLElement).closest("[data-timeline-ui]")) return;
    if ((e.target as HTMLElement).closest("[data-timeline-node]")) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !last.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setCamera((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
  }, []);

  const onPointerUp = React.useCallback(() => {
    dragging.current = false;
    last.current = null;
  }, []);

  const onDoubleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-timeline-ui]")) return;
      zoomAt(e.clientX, e.clientY, 1.35);
    },
    [zoomAt],
  );

  return {
    camera,
    fit,
    zoomBy,
    zoomAt,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onDoubleClick,
    active,
    setActive,
    minK: MIN_K,
    maxK: MAX_K,
  };
}
