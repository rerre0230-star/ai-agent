"use client";

import { useCallback, useRef, useState } from "react";
import type { PointerEvent, WheelEvent } from "react";

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.15;

export function usePanZoom() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  const onWheel = useCallback((e: WheelEvent) => {
    setScale((s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s - e.deltaY * 0.001)));
  }, []);

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      dragOrigin.current = { startX: e.clientX, startY: e.clientY, originX: offset.x, originY: offset.y };
      setIsDragging(true);
    },
    [offset],
  );

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragOrigin.current) return;
    setOffset({
      x: dragOrigin.current.originX + (e.clientX - dragOrigin.current.startX),
      y: dragOrigin.current.originY + (e.clientY - dragOrigin.current.startY),
    });
  }, []);

  const endDrag = useCallback(() => {
    dragOrigin.current = null;
    setIsDragging(false);
  }, []);

  const zoomIn = useCallback(() => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP)), []);
  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  return { scale, offset, isDragging, onWheel, onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerLeave: endDrag, zoomIn, zoomOut, reset };
}
