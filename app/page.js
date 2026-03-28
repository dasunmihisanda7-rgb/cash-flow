// app/page.js
// ─────────────────────────────────────────────────────────────────────────────
// Server Component — runs on the server on every request (after revalidatePath).
// Fetches fresh data from Firestore and passes it to the interactive shell.
// NO "use client" here — that's what makes revalidatePath work correctly.
// ─────────────────────────────────────────────────────────────────────────────

import { getTransactions } from "@/lib/data";
import DashboardShell from "@/app/components/DashboardShell";

export default async function DashboardPage() {
  // Runs on the server; re-runs automatically when revalidatePath("/") fires
  const transactions = await getTransactions();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0b0d13]">

      {/* ── Background Glows ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] h-[600px] w-[600px] rounded-full bg-purple-600/30 blur-[150px]" />
        <div className="absolute -bottom-[15%] -right-[10%] h-[600px] w-[600px] rounded-full bg-sky-500/20 blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">

        {/* Branding Header */}
        <div className="flex w-full flex-col items-center justify-center text-center pt-8 pb-4">
          <h1 className="text-4xl font-black italic tracking-tighter md:text-6xl text-white uppercase leading-none">
            CASH<span className="text-purple-500">FLOW</span>
          </h1>
          <p className="mt-2 text-[10px] italic font-bold tracking-[0.6em] text-white/30 uppercase">
            V7 ELITE PLUS - BY DASUN MIHISANDA
          </p>
        </div>

        {/* DashboardShell owns all interactive state & renders the rest of the UI */}
        <DashboardShell transactions={transactions} />

        <footer className="mt-12 border-t border-white/5 py-6 text-center text-[10px] font-bold italic text-slate-700 tracking-[0.5em] uppercase">
          V7 ELITE SYSTEM &copy; 2026 &middot; SECURE TERMINAL ACCESS
        </footer>

      </div>
    </div>
  );
}