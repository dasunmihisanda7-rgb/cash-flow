"use client";
// BUG-05 FIX: `onMouseMove` now clears `transition` before applying the
// transform. Previously the 0.4s ease-out set by `onMouseLeave` would persist
// into the first few frames of the next mouseEnter, causing a visible
// rubber-band lag before the element snapped to the cursor.
import { useRef, useCallback } from "react";

export function useMagnet(strength = 0.3) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    // Kill any lingering ease-out transition during live tracking
    el.style.transition = "none";
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
  }, [strength]);

  const onMouseLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transition = "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
      ref.current.style.transform = "translate(0, 0) scale(1)";
    }
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
