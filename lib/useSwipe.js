"use client";
import { useRef, useCallback } from "react";

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 60 }) {
    const startX = useRef(null);
    const startY = useRef(null);
    const isLocked = useRef(false);

    const onPointerDown = useCallback((e) => {
        startX.current = e.clientX;
        startY.current = e.clientY;
        isLocked.current = false;
    }, []);

    const onPointerMove = useCallback((e) => {
        if (startX.current === null || isLocked.current) return;
        const dx = Math.abs(e.clientX - startX.current);
        const dy = Math.abs(e.clientY - startY.current);

        [span_3](start_span)// Lock the scroll direction early to prevent glitching[span_3](end_span)
        if (dx > 10 || dy > 10) {
            if (dy > dx) {
                // Vertical scroll detected, lock horizontal swipe
                isLocked.current = true;
            }
        }
    }, []);

    const onPointerUp = useCallback((e) => {
        if (isLocked.current || startX.current === null) {
            startX.current = null;
            return;
        }

        const dx = e.clientX - startX.current;

        if (dx < -threshold) onSwipeLeft?.();
        if (dx > threshold) onSwipeRight?.();

        startX.current = null;
        isLocked.current = false;
    }, [onSwipeLeft, onSwipeRight, threshold]);

    return { onPointerDown, onPointerMove, onPointerUp };
}