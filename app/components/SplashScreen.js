"use client";
import { useState, useEffect } from "react";

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
          <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="cg" x1="380" y1="28" x2="65" y2="468" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38ddff"/>
                <stop offset="14%" stopColor="#4466ff"/>
                <stop offset="38%" stopColor="#7733ee"/>
                <stop offset="62%" stopColor="#9922cc"/>
                <stop offset="82%" stopColor="#cc33ee"/>
                <stop offset="100%" stopColor="#ff44ee"/>
              </linearGradient>
              <radialGradient id="hl" cx="322" cy="110" r="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#aaeeff" stopOpacity="0.52"/>
                <stop offset="48%" stopColor="#88ccff" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="sh" cx="168" cy="182" r="105" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#000" stopOpacity="0.62"/>
                <stop offset="58%" stopColor="#000" stopOpacity="0.18"/>
                <stop offset="100%" stopColor="#000" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="sh2" cx="168" cy="358" r="88" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#000" stopOpacity="0.28"/>
                <stop offset="100%" stopColor="#000" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="bgg" cx="250" cy="250" r="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1a0033" stopOpacity="0.75"/>
                <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
              </radialGradient>
              <filter id="gl" x="-38%" y="-38%" width="176%" height="176%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="13" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <clipPath id="cm">
                <path d="M250 50 L395 195 L325 195 L250 120 L120 250 L250 380 L325 305 L395 305 L250 450 L50 250 Z"/>
              </clipPath>
            </defs>

            {/* Background */}
            <rect width="500" height="500" fill="#000"/>
            <rect width="500" height="500" fill="url(#bgg)"/>

            {/* Glow aura */}
            <path d="M250 50 L395 195 L325 195 L250 120 L120 250 L250 380 L325 305 L395 305 L250 450 L50 250 Z"
                  fill="#7733dd" filter="url(#gl)" opacity="0.42"/>

            {/* Main C band */}
            <path d="M250 50 L395 195 L325 195 L250 120 L120 250 L250 380 L325 305 L395 305 L250 450 L50 250 Z"
                  fill="url(#cg)"/>

            {/* Top arm highlight */}
            <rect width="500" height="500" fill="url(#hl)" clipPath="url(#cm)"/>

            {/* Weave junction shadow (top arm over spine) */}
            <rect width="500" height="500" fill="url(#sh)" clipPath="url(#cm)"/>

            {/* Lower arm depth shadow */}
            <rect width="500" height="500" fill="url(#sh2)" clipPath="url(#cm)"/>

            {/* Outer top-right edge highlight */}
            <path d="M250 50 L395 195" fill="none" stroke="#88eeff" strokeWidth="2.5" strokeOpacity="0.4" strokeLinecap="round"/>

            {/* Outer top-left edge highlight */}
            <path d="M50 250 L250 50" fill="none" stroke="#aaddff" strokeWidth="1.5" strokeOpacity="0.18" strokeLinecap="round"/>

            {/* Inner top-left face glow */}
            <path d="M250 120 L120 250" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.2" strokeLinecap="round"/>

            {/* Inner boundary outline */}
            <path d="M250 120 L120 250 L250 380 L325 305 L325 195 Z"
                  fill="none" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.1"/>
          </svg>
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
