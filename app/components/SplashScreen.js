"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen({ onComplete }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Reveal logo
    const t1 = setTimeout(() => setStage(1), 100);
    // Stage 2: Start fade out
    const t2 = setTimeout(() => setStage(2), 2000);
    // Stage 3: Complete and unmount
    const t3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2800);

    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05070a] transition-opacity duration-700
      ${stage >= 2 ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

      {/* Ambient orbs */}
      <div className="absolute w-64 h-64 bg-slate-900/40 blur-[120px] rounded-full pointer-events-none" />

      {/* App Logo */}
      <div className={`relative transition-all duration-[1000ms] ${stage >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(56,189,248,0.2)] animate-pulse-slow">
          <Image 
            src="/icon.png" 
            alt="CashFlow V7 Elite Plus Logo" 
            fill 
            className="object-cover" 
            priority
          />
        </div>
      </div>

      {/* Title */}
      <h1 className={`mt-8 text-2xl md:text-3xl font-black italic tracking-[0.2em] text-white uppercase drop-shadow-[0_0_15px_rgba(56,189,248,0.6)] transition-all duration-[800ms] delay-300
        ${stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        CASHFLOW
      </h1>

      {/* Sub-label */}
      <p className={`mt-3 text-[10px] md:text-[11px] font-bold italic tracking-[0.4em] text-sky-400/80 uppercase transition-all duration-[800ms] delay-500
        ${stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        V7 ELITE PLUS
      </p>

      <style jsx>{`
        .animate-pulse-slow {
          animation: pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 10px rgba(56,189,248,0.2)); }
          50% { opacity: 0.85; filter: drop-shadow(0 0 30px rgba(56,189,248,0.5)); }
        }
      `}</style>
    </div>
  );
}
