"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import SummaryCards from "@/app/components/SummaryCards";
import AddTransactionForm from "@/app/components/AddTransactionForm";
import TransactionTable from "@/app/components/TransactionTable";
import SpendingBreakdown from "@/app/components/SpendingBreakdown";

// ── HOLOGRAPHIC ICONS ──────────────────────────────────────────────────────────

const WalletOutlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="w-full h-full">
    <defs>
      <linearGradient id="grad-wallet" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
    <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="url(#grad-wallet)" />
    <path d="M16 12h5v4h-5a2 2 0 010-4z" stroke="url(#grad-wallet)" />
    <circle cx="18" cy="14" r="1" fill="url(#grad-wallet)" />
    <path d="M3 10h12" stroke="url(#grad-wallet)" strokeOpacity="0.3" />
  </svg>
);

const BankOutlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="w-full h-full">
    <defs>
      <linearGradient id="grad-bank" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3L2 10h20L12 3z" stroke="url(#grad-bank)" />
  </svg>
);

// ── HELPERS ────────────────────────────────────────────────────────────────────

const getCurrentMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const fmtNum = (n) => new Intl.NumberFormat("en-LK").format(n);

// ── COMPONENT ──────────────────────────────────────────────────────────────────

export default function DashboardShell({ transactions }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [currentUser, setCurrentUser] = useState("DASUN"); // Default
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // ── AUTH LISTENER ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Email එක අනුව User කවුද කියලා තීරණය කරනවා
        // ඔයා Firebase එකේ දුන්න Email එක මෙතනට දාන්න (dasun@flow.com වගේ)
        if (user.email.toLowerCase().includes("dasun")) {
          setCurrentUser("DASUN");
        } else if (user.email.toLowerCase().includes("kavindya")) {
          setCurrentUser("KAVINDYA");
        }
        setLoading(false);
      } else {
        // ලොග් වෙලා නැත්නම් පන්නනවා!
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // ── Loading Screen (Cyberpunk style) ──
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0b0f1a] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent shadow-[0_0_20px_rgba(217,70,239,0.5)]"></div>
          <p className="text-[10px] font-black italic tracking-[0.5em] uppercase text-fuchsia-400">Syncing Bio-Data...</p>
        </div>
      </div>
    );
  }

  // ── Data Filtering Logic ──
  const monthFilteredTransactions = transactions.filter((t) => {
    if (selectedMonth === "ALL") return true;
    return t.date?.startsWith(selectedMonth);
  });

  const getStats = (userName) => {
    const userT = monthFilteredTransactions.filter(
      (t) => t.user?.toUpperCase() === userName.toUpperCase()
    );
    const income = userT.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = userT.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  };

  const dasunStats = getStats("DASUN");
  const kavindyaStats = getStats("KAVINDYA");
  const currentStats = currentUser === "DASUN" ? dasunStats : kavindyaStats;

  const userFilteredTransactions = monthFilteredTransactions.filter(
    (t) => t.user?.toUpperCase() === currentUser.toUpperCase()
  );

  const isDasun = currentUser === "DASUN";
  const isKavindya = currentUser === "KAVINDYA";

  return (
    <>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      {/* Logout Button (Floating) */}
      <button
        onClick={handleLogout}
        className="fixed bottom-8 right-8 z-[100] rounded-full border border-white/5 bg-[#161b27]/80 p-4 text-slate-500 backdrop-blur-xl transition-all hover:border-rose-500/50 hover:text-rose-400 group shadow-2xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
      </button>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6">
        <div className="space-y-10">

          {activeTab === "OVERVIEW" && (
            <div key={`overview-${currentUser}-${selectedMonth}`} className="animate-vibe space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                <article
                  onClick={() => setCurrentUser("DASUN")}
                  className={`group relative overflow-hidden rounded-[60px] border p-10 shadow-2xl transition-all duration-700 cursor-pointer backdrop-blur-2xl ${isDasun ? 'bg-[#161b27]/80 border-sky-500/60 shadow-[0_15px_50px_-20px_rgba(14,165,233,0.5)]' : 'bg-[#161b27]/30 border-white/5 scale-[0.98]'}`}
                >
                  <div className={`absolute right-4 bottom-4 h-32 w-32 transition-all duration-700 ${isDasun ? 'opacity-10 text-sky-400' : 'opacity-5 text-slate-500'}`}><WalletOutlineIcon /></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div><p className={`text-[18px] font-black italic tracking-[0.3em] uppercase mb-2 ${isDasun ? 'text-white' : 'text-slate-500'}`}>DASUN</p></div>
                    <div className="flex items-baseline gap-1.5"><span className={`text-[11px] font-bold italic ${isDasun ? 'text-sky-400' : 'text-slate-500'}`}>Rs.</span><p className={`text-4xl font-black italic tracking-tighter ${isDasun ? 'text-white' : 'text-slate-300'}`}>{fmtNum(dasunStats.balance)}</p></div>
                  </div>
                </article>

                <article
                  onClick={() => setCurrentUser("KAVINDYA")}
                  className={`group relative overflow-hidden rounded-[60px] border p-10 shadow-2xl transition-all duration-700 cursor-pointer backdrop-blur-2xl ${isKavindya ? 'bg-[#161b27]/80 border-purple-500/60 shadow-[0_15px_50px_-20px_rgba(168,85,247,0.5)]' : 'bg-[#161b27]/30 border-white/5 scale-[0.98]'}`}
                >
                  <div className={`absolute right-4 bottom-4 h-32 w-32 transition-all duration-700 ${isKavindya ? 'opacity-10 text-purple-400' : 'opacity-5 text-slate-500'}`}><BankOutlineIcon /></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div><p className={`text-[18px] font-black italic tracking-[0.3em] uppercase mb-2 ${isKavindya ? 'text-white' : 'text-slate-500'}`}>KAVINDYA</p></div>
                    <div className="flex items-baseline gap-1.5"><span className={`text-[11px] font-bold italic ${isKavindya ? 'text-purple-400' : 'text-slate-500'}`}>Rs.</span><p className={`text-4xl font-black italic tracking-tighter ${isKavindya ? 'text-white' : 'text-slate-300'}`}>{fmtNum(kavindyaStats.balance)}</p></div>
                  </div>
                </article>
              </div>

              <div className="space-y-10">
                <SummaryCards totalIncome={currentStats.income} totalExpenses={currentStats.expense} balance={currentStats.balance} />
                <div className="pt-8"><SpendingBreakdown transactions={userFilteredTransactions} /></div>
              </div>
            </div>
          )}

          {activeTab === "LOG" && (
            <div key={`log-${currentUser}-${selectedMonth}`} className="animate-vibe py-6">
              <TransactionTable transactions={userFilteredTransactions} />
            </div>
          )}

          {activeTab === "CONTROL" && (
            <div key={`control-${currentUser}`} className="animate-vibe py-6 max-w-4xl mx-auto">
              <AddTransactionForm currentUser={currentUser} />
            </div>
          )}

        </div>
      </main>
    </>
  );
}