"use client";
// BUG-06 FIX: Added `onPointerCancel` handler.
// Without it, an interrupted gesture (incoming call, OS notification) left
// `startX.current` set, causing the *next* pointerUp (dismissing the OS UI)
// to trigger a phantom tab switch with a stale delta.
import { useRef, useCallback } from "react";

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 60 }) {
  const startX = useRef(null);
  const startY = useRef(null);
  const isLocked = useRef(false);

  const reset = useCallback(() => {
    startX.current = null;
    startY.current = null;
    isLocked.current = false;
  }, []);

  const onPointerDown = useCallback((e) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isLocked.current = false;
  }, []);

  const onPointerMove = useCallback((e) => {
    if (startX.current === null || isLocked.current) return;
    const dx = Math.abs(e.clientX - startX.current);
    const dy = Math.abs(e.clientY - startY.current);

    // Lock the scroll direction early to prevent glitching
    if (dx > 10 || dy > 10) {
      if (dy > dx) {
        // Vertical scroll detected — lock horizontal swipe
        isLocked.current = true;
      }
    }
  }, []);

  const onPointerUp = useCallback((e) => {
    if (isLocked.current || startX.current === null) {
      reset();
      return;
    }

    const dx = e.clientX - startX.current;

    if (dx < -threshold) onSwipeLeft?.();
    if (dx > threshold) onSwipeRight?.();

    reset();
  }, [onSwipeLeft, onSwipeRight, threshold, reset]);

  // BUG-06 FIX: Handles mid-gesture OS interruptions (incoming call, etc.)
  const onPointerCancel = useCallback(() => {
    reset();
  }, [reset]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}