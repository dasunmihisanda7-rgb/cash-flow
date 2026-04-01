"use client";
// BUG-01 FIX: `canVibrate` was captured at hook instantiation (stale closure).
// Now the vibrate check happens *inside* the callback at call-time, so it is
// always evaluated against the live `navigator` object and never captured during SSR.
import { useCallback } from "react";

export function useHaptic() {
  const vibrate = useCallback((pattern) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return {
    light:   useCallback(() => vibrate(10),                  [vibrate]),
    medium:  useCallback(() => vibrate(20),                  [vibrate]),
    success: useCallback(() => vibrate([15, 30, 15]),        [vibrate]),
    error:   useCallback(() => vibrate([30, 20, 30, 20, 60]),[vibrate]),
    select:  useCallback(() => vibrate([5, 50, 5]),          [vibrate]),
  };
}