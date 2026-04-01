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
import CashFlowTrend from "@/app/components/CashFlowTrend";
import { INITIAL_EXPENSE_CATEGORIES, INITIAL_CAPITAL_CATEGORIES } from "@/lib/constants";

// 🚀 අලුත් Imports ටික (වරහන් ගැන සැලකිලිමත් වෙන්න!)
import AnimatedNumber from "@/lib/AnimatedNumber";
import SkeletonLoader from "@/app/components/SkeletonLoader";
import BootSequence from "@/app/components/BootSequence";
import { useSwipe } from "@/lib/useSwipe";
import { useHaptic } from "@/lib/useHaptic";

const CATEGORY_EMOJI = {
  Salary: "💼", Freelance: "🖊️", Investments: "📈", Business: "🏢", Bonus: "🎁",
  Food: "🍔", Transport: "🚌", Utilities: "⚡",
  Health: "🏥", Entertainment: "🎬", Education: "📚", Other: "📦",
};

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const WalletOutlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="w-full h-full">
    <defs><linearGradient id="grad-wallet" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#c084fc" /></linearGradient></defs>
    <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="url(#grad-wallet)" />
    <path d="M16 12h5v4h-5a2 2 0 010-4z" stroke="url(#grad-wallet)" /><circle cx="18" cy="14" r="1" fill="url(#grad-wallet)" />
    <path d="M3 10h12" stroke="url(#grad-wallet)" strokeOpacity="0.3" />
  </svg>
);

const BankOutlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="w-full h-full">
    <defs><linearGradient id="grad-bank" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f6d365" /><stop offset="100%" stopColor="#fda085" /></linearGradient></defs>
    <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3L2 10h20L12 3z" stroke="url(#grad-bank)" />
  </svg>
);

const getCurrentMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const fmtNum = (n) => new Intl.NumberFormat("en-LK").format(n);

// 🚀 Tab Array එක එළියෙන් තියාගමු
const TABS = ["SUMMARY", "ANALYTICS", "LOG", "CONTROL"];

export default function DashboardShell({ transactions }) {
  const router = useRouter();
  const haptic = useHaptic(); // 🚀 Haptic Initialize කළා

  const [activeTab, setActiveTab] = useState("SUMMARY");
  const [currentUser, setCurrentUser] = useState("DASUN");
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [bootComplete, setBootComplete] = useState(false);

  const [expenseCats, setExpenseCats] = useState(INITIAL_EXPENSE_CATEGORIES);
  const [capitalCats, setCapitalCats] = useState(INITIAL_CAPITAL_CATEGORIES);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedExpense = localStorage.getItem("customExpenseCats");
      if (savedExpense) {
        setExpenseCats([...new Set([...INITIAL_EXPENSE_CATEGORIES, ...JSON.parse(savedExpense)])]);
      }
      const savedCapital = localStorage.getItem("customCapitalCats");
      if (savedCapital) {
        setCapitalCats([...new Set([...INITIAL_CAPITAL_CATEGORIES, ...JSON.parse(savedCapital)])]);
      }
    }
  }, []);

  const handleUpdateExpenseCats = (newCats) => {
    setExpenseCats(newCats);
    localStorage.setItem("customExpenseCats", JSON.stringify(newCats.filter(c => !INITIAL_EXPENSE_CATEGORIES.includes(c))));
  };

  const handleUpdateCapitalCats = (newCats) => {
    setCapitalCats(newCats);
    localStorage.setItem("customCapitalCats", JSON.stringify(newCats.filter(c => !INITIAL_CAPITAL_CATEGORIES.includes(c))));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email.toLowerCase().includes("dasun")) setCurrentUser("DASUN");
        else if (user.email.toLowerCase().includes("kavindya")) setCurrentUser("KAVINDYA");
        setLoading(false);
      } else router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    haptic.medium();
    await signOut(auth);
    router.push("/login");
  };

  // 🚀 Swipe Logic: තිරය හරහා ඇඟිල්ල අදින විට ටැබ් මාරු වේ [cite: 23]
  const currentIndex = TABS.indexOf(activeTab);
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (currentIndex < TABS.length - 1) {
        haptic.light();
        setActiveTab(TABS[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        haptic.light();
        setActiveTab(TABS[currentIndex - 1]);
      }
    },
    threshold: 50,
  });

  // 🚀 Sprint 1: දත්ත ලෝඩ් වෙනකම් Skeleton පෙන්වයි
  if (loading) return <SkeletonLoader />;

  const getAllTimeStats = (userName) => {
    const userT = transactions.filter((t) => t.user?.toUpperCase() === userName.toUpperCase());
    const income = userT.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = userT.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { balance: income - expense };
  };

  const dasunAllTimeBalance = getAllTimeStats("DASUN").balance;
  const kavindyaAllTimeBalance = getAllTimeStats("KAVINDYA").balance;

  const monthFilteredTransactions = transactions.filter((t) => selectedMonth === "ALL" ? true : t.date?.startsWith(selectedMonth));

  const getMonthlyStats = (userName) => {
    const userT = monthFilteredTransactions.filter((t) => t.user?.toUpperCase() === userName.toUpperCase());
    const income = userT.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = userT.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  };

  const currentMonthlyStats = getMonthlyStats(currentUser);
  const userFilteredTransactions = monthFilteredTransactions.filter((t) => t.user?.toUpperCase() === currentUser.toUpperCase());

  const recentTransactions = [...userFilteredTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const isDasun = currentUser === "DASUN";
  const isKavindya = currentUser === "KAVINDYA";

  return (
    <>
      {/* 🚀 Sprint 1: Cinematic Boot Sequence [cite: 1, 14] */}
      {!bootComplete && <BootSequence onComplete={() => setBootComplete(true)} />}

      <div className={`flex flex-col relative w-full transition-opacity duration-[800ms] ${bootComplete ? 'opacity-100' : 'opacity-0'}`}>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

        <main
          {...swipeHandlers}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 pb-safe-nav overflow-hidden"
        >
          <div className="space-y-10">

            {activeTab === "SUMMARY" && (
              <div key={`summary-${currentUser}-${selectedMonth}`} className="space-y-10">

                <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-16 relative">
                  {/* Dasun's Card */}
                  <article onClick={() => { haptic.select(); setCurrentUser("DASUN"); }} className={`animate-vibe click-pop group relative overflow-hidden rounded-[30px] sm:rounded-[60px] p-4 sm:p-10 transition-all duration-700 cursor-pointer flex flex-col justify-between min-h-[140px] sm:min-h-[200px] ${isDasun ? 'scroll-glass gpu-promote shadow-[0_20px_60px_-15px_rgba(56,189,248,0.4)]' : 'border border-white/5 bg-white/[0.02] scale-[0.96] opacity-60'}`}>
                    {isDasun && <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 blur-[50px] rounded-full pointer-events-none"></div>}
                    <div className={`absolute -right-2 -bottom-2 sm:right-4 sm:bottom-4 h-24 w-24 sm:h-32 sm:w-32 transition-all duration-700 pointer-events-none z-0 ${isDasun ? 'opacity-[0.15]' : 'opacity-[0.03] text-slate-500'}`}><WalletOutlineIcon /></div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4 sm:gap-0 w-full">
                      <p className={`text-[12px] sm:text-[18px] font-black italic tracking-[0.2em] sm:tracking-[0.3em] uppercase ${isDasun ? 'text-white drop-shadow-md' : 'text-slate-500'}`}>DASUN</p>
                      <div className="flex items-baseline gap-1.5 w-full">
                        <span className={`text-[9px] sm:text-[11px] font-bold italic shrink-0 ${isDasun ? 'text-sky-400' : 'text-slate-500'}`}>Rs.</span>
                        <p className={`text-2xl sm:text-4xl font-black italic tracking-tighter break-all ${isDasun ? 'text-gradient-premium' : 'text-slate-300'}`}><AnimatedNumber value={dasunAllTimeBalance} decimals={0} /></p>
                      </div>
                    </div>
                  </article>

                  {/* Kavindya's Card */}
                  <article onClick={() => { haptic.select(); setCurrentUser("KAVINDYA"); }} className={`animate-vibe click-pop group relative overflow-hidden rounded-[30px] sm:rounded-[60px] p-4 sm:p-10 transition-all duration-700 cursor-pointer flex flex-col justify-between min-h-[140px] sm:min-h-[200px] ${isKavindya ? 'scroll-glass gpu-promote shadow-[0_20px_60px_-15px_rgba(246,211,101,0.3)]' : 'border border-white/5 bg-white/[0.02] scale-[0.96] opacity-60'}`} style={{ animationDelay: '0.1s' }}>
                    {isKavindya && <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/15 blur-[50px] rounded-full pointer-events-none"></div>}
                    <div className={`absolute -right-2 -bottom-2 sm:right-4 sm:bottom-4 h-24 w-24 sm:h-32 sm:w-32 transition-all duration-700 pointer-events-none z-0 ${isKavindya ? 'opacity-[0.15]' : 'opacity-[0.03] text-slate-500'}`}><BankOutlineIcon /></div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4 sm:gap-0 w-full">
                      <p className={`text-[12px] sm:text-[18px] font-black italic tracking-[0.2em] sm:tracking-[0.3em] uppercase ${isKavindya ? 'text-white drop-shadow-md' : 'text-slate-500'}`}>KAVINDYA</p>
                      <div className="flex items-baseline gap-1.5 w-full">
                        <span className={`text-[9px] sm:text-[11px] font-bold italic shrink-0 ${isKavindya ? 'text-[#f6d365]' : 'text-slate-500'}`}>Rs.</span>
                        <p className={`text-2xl sm:text-4xl font-black italic tracking-tighter break-all ${isKavindya ? 'text-gradient-gold' : 'text-slate-300'}`}><AnimatedNumber value={kavindyaAllTimeBalance} decimals={0} /></p>
                      </div>
                    </div>
                  </article>
                </div>

                <div className="animate-vibe" style={{ animationDelay: '0.2s' }}>
                  <SummaryCards
                    totalIncome={currentMonthlyStats.income}
                    totalExpenses={currentMonthlyStats.expense}
                    balance={currentMonthlyStats.balance}
                    transactions={transactions}
                    currentUser={currentUser}
                    selectedMonth={selectedMonth}
                  />
                </div>

                {/* Recent Activity Widget */}
                <div className="mt-12 animate-vibe" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-[12px] sm:text-[14px] font-black italic tracking-widest text-white uppercase">Recent Activity</h3>
                    </div>
                    {/* View Log Button with compliance [cite: 39, 43] */}
                    <button onClick={() => { haptic.light(); setActiveTab("LOG"); }} className="relative flex items-center justify-center min-h-[44px] px-2 text-[9px] font-bold italic tracking-widest text-slate-500 hover:text-purple-400 uppercase transition-colors click-pop">
                      View Log &rarr;
                    </button>
                  </div>

                  <div className="rounded-[24px] sm:rounded-[40px] scroll-glass gpu-promote p-3 sm:p-5 flex flex-col gap-2">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((txn, idx) => (
                        <div key={txn.id} className="animate-vibe click-pop group flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all hover:bg-white/[0.05] border border-transparent hover:border-white/10 cursor-pointer" style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }} onClick={() => haptic.light()}>
                          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-lg sm:text-xl border transition-transform duration-300 group-hover:scale-110 ${txn.type === "income" ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]" : "bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]"}`}>
                              {CATEGORY_EMOJI[txn.category] ?? "📦"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] sm:text-[14px] font-bold text-slate-200 uppercase truncate">{txn.description}</p>
                              <p className="text-[9px] sm:text-[10px] font-bold italic text-slate-500 uppercase truncate mt-0.5">{txn.category} • {fmtDate(txn.date)}</p>
                            </div>
                          </div>
                          <div className={`text-right text-[12px] sm:text-[14px] font-black italic truncate shrink-0 ml-4 ${txn.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                            {txn.type === "income" ? "+ " : "- "} {fmtNum(txn.amount)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                        <p className="text-[10px] font-bold italic tracking-widest text-slate-400 uppercase">No recent activity found</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ANALYTICS Tab */}
            {activeTab === "ANALYTICS" && (
              <div key="analytics" className="py-6 space-y-10">
                <SpendingBreakdown transactions={userFilteredTransactions} />
                <div className="animate-vibe" style={{ animationDelay: '0.3s' }}>
                  <CashFlowTrend transactions={userFilteredTransactions} />
                </div>
              </div>
            )}

            {/* LOG Tab */}
            {activeTab === "LOG" && (
              <div key="log" className="animate-vibe py-6">
                <TransactionTable transactions={userFilteredTransactions} expenseCats={expenseCats} capitalCats={capitalCats} />
              </div>
            )}

            {/* CONTROL Tab */}
            {activeTab === "CONTROL" && (
              <div key="control" className="animate-vibe py-6 max-w-4xl mx-auto flex flex-col gap-10">
                <AddTransactionForm currentUser={currentUser} expenseCats={expenseCats} setExpenseCats={handleUpdateExpenseCats} capitalCats={capitalCats} setCapitalCats={handleUpdateCapitalCats} />

                {/* System Disconnect Section */}
                <div className="w-full rounded-[32px] border border-rose-500/20 scroll-glass gpu-promote p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(244,63,94,0.05)] mt-10">
                  <div>
                    <h3 className="text-[14px] sm:text-[16px] font-black italic tracking-widest text-white uppercase">System Disconnect</h3>
                    <p className="text-[10px] sm:text-[12px] font-bold italic text-slate-400 uppercase tracking-widest mt-1">Safely terminate current session</p>
                  </div>
                  <button onClick={handleLogout} className="click-pop group flex items-center gap-3 rounded-2xl bg-rose-500/10 px-8 py-4 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all font-black italic tracking-widest uppercase text-[11px]">
                    Logout
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}