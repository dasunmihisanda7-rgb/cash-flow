// app/page.js
import { getTransactions } from "@/lib/data";
import DashboardShell from "@/app/components/DashboardShell";

export default async function DashboardPage() {
  const transactions = await getTransactions();

  return (
    // 🚀 UI Upgrade: පසුබිම තවත් Dark කළා (Opacity 0.1 -> 0.03)
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#05070a] bg-animated-mesh text-white"
      style={{ backgroundImage: "radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.03), transparent 50%), radial-gradient(circle at 100% 100%, rgba(192, 132, 252, 0.03), transparent 50%)" }}>

      {/* ── Background Glows (Subtle Ambient Lights) ── */}
      {/* 🚀 වෙනස් කළ තැන: Glow එකේ සැර ගොඩක් අඩු කළා (opacity /20 -> /5 සහ mix-blend අයින් කළා) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[400px] w-[400px] rounded-full bg-sky-500/5 blur-[150px]" />
        <div className="absolute top-[30%] -right-[10%] h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[150px]" />
        <div className="absolute -bottom-[10%] left-[10%] h-[500px] w-[500px] rounded-full bg-fuchsia-500/5 blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">

        {/* ── Branding Header ── */}
        <div className="flex w-full flex-col items-center justify-center text-center pt-8 pb-4 ios-safe-top mt-2">
          <h1 className="text-4xl font-black italic tracking-tighter md:text-5xl uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <span className="text-white">CASH</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">FLOW</span>
          </h1>
          <p className="mt-2 text-[9px] sm:text-[10px] italic font-bold tracking-[0.6em] text-slate-500/80 uppercase">
            V7 ELITE PLUS - BY DASUN MIHISANDA
          </p>
        </div>

        {/* DashboardShell owns all interactive state & renders the rest of the UI */}
        <DashboardShell transactions={transactions} />

        <footer className="mt-auto border-t border-white/5 py-8 text-center text-[9px] font-bold italic text-slate-600 tracking-[0.5em] uppercase pb-safe-nav relative z-10 bg-black/20 backdrop-blur-md">
          V7 ELITE SYSTEM &copy; 2026 &middot; SECURE TERMINAL ACCESS
        </footer>

      </div>
    </div>
  );
}