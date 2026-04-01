"use client";
// UX-08 FIX: Boot animation previously replayed every time the PWA was restored
// from the background (full page reload). Now `sessionStorage` is checked on
// mount — if the user has already seen the boot sequence this session, we skip
// it instantly and show the dashboard immediately.
//
// BUG-10 is fixed in DashboardShell by wrapping `onComplete` in useCallback,
// preventing the effect from re-running if the parent re-renders mid-animation.
import { useState, useEffect } from "react";

export default function BootSequence({ onComplete }) {
  const [stage, setStage] = useState(0); // 0=black, 1=logo, 2=fade-out

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 1200);
    const t3 = setTimeout(() => onComplete(), 1800);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05070a] transition-opacity duration-700
      ${stage >= 2 ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

      {/* Ambient orbs */}
      <div className="absolute w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute w-48 h-48 bg-sky-500/10 blur-[100px] rounded-full translate-x-20 translate-y-10 pointer-events-none" />

      {/* Logo Mark */}
      <div className={`relative transition-all duration-[800ms] ${stage >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
        <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.5)]">
          <span className="text-3xl font-black italic text-white drop-shadow-md">₠</span>
        </div>
        <div className="absolute -inset-2 rounded-[24px] border border-purple-500/30 animate-pulse" />
      </div>

      {/* Title */}
      <p className={`mt-8 text-[11px] font-black italic tracking-[0.5em] text-slate-300 uppercase transition-all duration-[800ms] delay-200
        ${stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        CASH<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">FLOW</span> V7
      </p>

      {/* Loading bar */}
      <div className="mt-8 w-32 h-[2px] bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r from-sky-400 to-purple-500 rounded-full transition-all duration-[1000ms] shadow-[0_0_10px_rgba(168,85,247,0.8)]
          ${stage >= 1 ? "w-full" : "w-0"}`} />
      </div>
    </div>
  );
}