// app/error.js — Next.js Error Boundary
// REFACTOR-05 FIX: Without this file, a Firestore outage during server-side
// data fetching in page.js would render a completely blank page. This boundary
// catches those errors and provides a premium, on-brand recovery UI.
"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#080b12] text-white px-6 text-center">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-rose-500/10 blur-[120px]" />
      </div>

      {/* Icon */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-rose-500/10 border border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.2)]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-9 w-9 text-rose-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div className="absolute -inset-1 rounded-[28px] border border-rose-500/20 animate-pulse" />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-3 max-w-xs">
        <h1 className="text-[14px] font-black italic tracking-widest text-white uppercase">
          Terminal Offline
        </h1>
        <p className="text-[10px] font-bold italic tracking-widest text-slate-400 uppercase leading-relaxed">
          Unable to reach the data terminal. Check your connection and try again.
        </p>
        {process.env.NODE_ENV === "development" && error?.message && (
          <p className="text-[9px] font-mono text-rose-400/60 break-all mt-2">
            {error.message}
          </p>
        )}
      </div>

      {/* Retry button */}
      <button
        onClick={reset}
        className="click-pop group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-[10px] font-black italic tracking-[0.3em] uppercase text-slate-300 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      >
        Retry Connection
      </button>
    </div>
  );
}
