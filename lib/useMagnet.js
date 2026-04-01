"use client";
import { useRef, useCallback } from "react";

export function useMagnet(strength = 0.3) {
    const ref = useRef(null);

    const onMouseMove = useCallback((e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        el.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
    }, [strength]);

    const onMouseLeave = useCallback(() => {
        if (ref.current) {
            ref.current.style.transform = "translate(0, 0) scale(1)";
            ref.current.style.transition = "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
        }
    }, []);

    return { ref, onMouseMove, onMouseLeave };
}
