"use client";
import { useState, useEffect, memo } from "react";

const AnimatedNumber = memo(({ value, decimals = 0 }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = null;
        const duration = 1400;
        let animationFrameId;

        const raf = (ts) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);

            setDisplay(ease * value);

            if (p < 1) {
                animationFrameId = requestAnimationFrame(raf);
            }
        };

        animationFrameId = requestAnimationFrame(raf);

        // 🔴 CRITICAL FIX: Component එක අයින් වෙද්දි Loop එක නවත්වනවා (Memory Leak එක හරි)
        return () => cancelAnimationFrame(animationFrameId);
    }, [value]);

    return new Intl.NumberFormat("en-LK", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(display);
});

AnimatedNumber.displayName = "AnimatedNumber";
export default AnimatedNumber;