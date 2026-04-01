"use client";
// BUG-07 FIX: The component previously always started the counter from 0.
// Now it initialises `display` to the actual `value` and animates FROM the
// previous displayed value TO the new one, preventing the distracting
// flash-to-zero when the user switches between DASUN and KAVINDYA.
import { useState, useEffect, useRef, memo } from "react";

const AnimatedNumber = memo(({ value, decimals = 0 }) => {
  // Initialise to `value` so the very first render shows the real number
  const [display, setDisplay] = useState(value);
  // Track previous displayed value so we animate from it, not from 0
  const prevDisplayRef = useRef(value);

  useEffect(() => {
    const from = prevDisplayRef.current;
    prevDisplayRef.current = value;

    // No need to animate if the value didn't change
    if (from === value) return;

    let start = null;
    const duration = 900; // slightly snappier than 1400ms
    let animationFrameId;

    const raf = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      // Expo-out easing
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay(from + (value - from) * ease);

      if (p < 1) {
        animationFrameId = requestAnimationFrame(raf);
      }
    };

    animationFrameId = requestAnimationFrame(raf);

    // Cleanup: cancel the loop when the component unmounts or value changes
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(display);
});

AnimatedNumber.displayName = "AnimatedNumber";
export default AnimatedNumber;