"use client";
import { useHaptic } from "@/lib/useHaptic";
import { useEffect, useCallback } from "react";

const KEYS = [
  "1", "2", "3",
  "4", "5", "6",
  "7", "8", "9",
  ".", "0", "DEL"
];

export default function DialPad({ onKeyPress }) {
  const haptic = useHaptic();

  const handlePress = useCallback((key) => {
    // Only fire haptic on valid keypress
    onKeyPress(key);
  }, [onKeyPress]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if they are typing in a native text input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      
      if (KEYS.includes(e.key)) {
        handlePress(e.key);
      } else if (e.key === "Backspace") {
        handlePress("DEL");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePress]);

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full animate-in fade-in zoom-in-95 duration-300">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onTouchStart={(e) => {
            haptic.light();
            e.currentTarget.style.transform = "scale(0.92)";
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={(e) => {
            // Trigger haptic for mouse users (desktop) as touchStart won't fire
            if (e.nativeEvent.pointerType === "mouse") haptic.light();
            handlePress(key);
          }}
          className="relative flex items-center justify-center min-h-[6.5vh] max-h-[9dvh] sm:h-[70px] rounded-[20px] bg-[#161b27]/80 backdrop-blur-md border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_10px_rgba(0,0,0,0.3)] active:bg-[#1e273a] transition-all duration-100 touch-manipulation no-select"
        >
          {key === "DEL" ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
             </svg>
          ) : (
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{key}</span>
          )}
        </button>
      ))}
    </div>
  );
}
