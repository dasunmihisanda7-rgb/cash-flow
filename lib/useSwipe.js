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

    const onPointerUp = useCallback((e) => {
        if (isLocked.current || startX.current === null) return;
        const dx = e.clientX - startX.current;
        const dy = Math.abs(e.clientY - startY.current);

        // Scroll කරනවා නම් (උඩට පල්ලෙහාට), Swipe එක වැඩ කරන්නේ නෑ
        if (dy > Math.abs(dx) * 0.7) return;

        if (dx < -threshold) onSwipeLeft?.();
        if (dx > threshold) onSwipeRight?.();
        startX.current = null;
    }, [onSwipeLeft, onSwipeRight, threshold]);

    return { onPointerDown, onPointerUp };
}