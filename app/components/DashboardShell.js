"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import SummaryCards from "@/app/components/SummaryCards";
import AddTransactionForm from "@/app/components/AddTransactionForm";
import TransactionTable from "@/app/components/TransactionTable";
import SpendingBreakdown from "@/app/components/SpendingBreakdown";
import CashFlowTrend from "@/app/components/CashFlowTrend";
// PERF-02 FIX: CATEGORY_EMOJI now imported from shared constants instead of duplicated here.
import { INITIAL_EXPENSE_CATEGORIES, INITIAL_CAPITAL_CATEGORIES, CATEGORY_EMOJI } from "@/lib/constants";
// REFACTOR-03 FIX: getCurrentMonthStr now from shared utils instead of duplicated here.
import { getCurrentMonthStr } from "@/lib/utils";

import AnimatedNumber from "@/lib/AnimatedNumber";
import SkeletonLoader from "@/app/components/SkeletonLoader";
import BootSequence from "@/app/components/BootSequence";
import { useSwipe } from "@/lib/useSwipe";
import { useHaptic } from "@/lib/useHaptic";
import { useFinancialHealth, HEALTH_CONFIG } from "@/lib/useFinancialHealth";
import { useMagnet } from "@/lib/useMagnet";
import EmptyState from "@/app/components/EmptyState";

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

const fmtNum = (n) => new Intl.NumberFormat("en-LK").format(n);
const TABS = ["SUMMARY", "ANALYTICS", "LOG", "CONTROL"];

export default function DashboardShell({ transactions }) {
  const router = useRouter();
  const haptic = useHaptic();
  const logoutMagnet = useMagnet(0.3);

  const [activeTab, setActiveTab] = useState("SUMMARY");
  const [currentUser, setCurrentUser] = useState("DASUN");
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr);

  // UX-08 FIX: Initialise from sessionStorage so the boot sequence is skipped
  // when the user returns to the PWA within the same browser session.
  const [bootComplete, setBootComplete] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("boot-complete") === "1";
    }
    return false;
  });

  // BUG-10 FIX: Memoised with useCallback so BootSequence's useEffect dependency
  // doesn't change on DashboardShell re-renders, preventing mid-animation restarts.
  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
    sessionStorage.setItem("boot-complete", "1");
  }, []);

  const [expenseCats, setExpenseCats] = useState(INITIAL_EXPENSE_CATEGORIES);
  const [capitalCats, setCapitalCats] = useState(INITIAL_CAPITAL_CATEGORIES);

  // Debounce ref for localStorage writes (PERF-04 FIX)
  const saveCatsTimeoutRef = { expense: null, capital: null };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedExpense = localStorage.getItem("customExpenseCats");
      if (savedExpense) setExpenseCats([...new Set([...INITIAL_EXPENSE_CATEGORIES, ...JSON.parse(savedExpense)])]);
      const savedCapital = localStorage.getItem("customCapitalCats");
      if (savedCapital) setCapitalCats([...new Set([...INITIAL_CAPITAL_CATEGORIES, ...JSON.parse(savedCapital)])]);
    }
  }, []);

  // PERF-04 FIX: localStorage writes are now debounced to avoid synchronous
  // main-thread writes on every rapid deletion.
  const expenseSaveTimer = useState(null);
  const capitalSaveTimer = useState(null);

  const handleUpdateExpenseCats = useCallback((newCats) => {
    setExpenseCats(newCats);
    clearTimeout(expenseSaveTimer[0]);
    expenseSaveTimer[0] = setTimeout(() => {
      localStorage.setItem(
        "customExpenseCats",
        JSON.stringify(newCats.filter((c) => !INITIAL_EXPENSE_CATEGORIES.includes(c)))
      );
    }, 300);
  }, [expenseSaveTimer]);

  const handleUpdateCapitalCats = useCallback((newCats) => {
    setCapitalCats(newCats);
    clearTimeout(capitalSaveTimer[0]);
    capitalSaveTimer[0] = setTimeout(() => {
      localStorage.setItem(
        "customCapitalCats",
        JSON.stringify(newCats.filter((c) => !INITIAL_CAPITAL_CATEGORIES.includes(c)))
      );
    }, 300);
  }, [capitalSaveTimer]);

  // BUG-04 FIX: `isMounted` guard prevents calling setState / router.push on
  // an unmounted component if the auth callback fires after navigation.
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;
      if (user) {
        if (user.email.toLowerCase().includes("dasun")) setCurrentUser("DASUN");
        else if (user.email.toLowerCase().includes("kavindya")) setCurrentUser("KAVINDYA");
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    haptic.medium();
    await signOut(auth);
    router.push("/login");
  };

  // ── Filtered data ─────────────────────────────────────────────────────────
  const monthFilteredTransactions = useMemo(
    () => transactions.filter((t) => selectedMonth === "ALL" ? true : t.date?.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  // PERF-01 FIX: Consolidated from 4 separate O(n) passes into one useMemo.
  // Previously getMonthlyStats + userFilteredTransactions = 4 array iterations per render.
  const { income, expense, balance, userTransactions } = useMemo(() => {
    const userT = monthFilteredTransactions.filter(
      (t) => t.user?.toUpperCase() === currentUser.toUpperCase()
    );
    const income = userT.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = userT.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense, userTransactions: userT };
  }, [monthFilteredTransactions, currentUser]);

  // UX-10 FIX: Wallet cards now use monthFilteredTransactions, consistent with
  // everything else on the page. Previously they used the raw `transactions` prop,
  // always showing an ALL-TIME balance regardless of the selected month filter.
  const dasunBalance = useMemo(
    () => monthFilteredTransactions
      .filter((t) => t.user === "DASUN")
      .reduce((s, t) => t.type === "income" ? s + t.amount : s - t.amount, 0),
    [monthFilteredTransactions]
  );
  const kavindyaBalance = useMemo(
    () => monthFilteredTransactions
      .filter((t) => t.user === "KAVINDYA")
      .reduce((s, t) => t.type === "income" ? s + t.amount : s - t.amount, 0),
    [monthFilteredTransactions]
  );

  const recentTransactions = useMemo(
    () => [...userTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [userTransactions]
  );

  const isDasun = currentUser === "DASUN";
  const isKavindya = currentUser === "KAVINDYA";

  const health = useFinancialHealth(income, expense);
  const hc = HEALTH_CONFIG[health];

  const currentIndex = TABS.indexOf(activeTab);
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => { if (currentIndex < TABS.length - 1) { haptic.light(); setActiveTab(TABS[currentIndex + 1]); } },
    onSwipeRight: () => { if (currentIndex > 0) { haptic.light(); setActiveTab(TABS[currentIndex - 1]); } },
    threshold: 50,
  });

  if (loading) return <SkeletonLoader />;

  return (
    <>
      {!bootComplete && <BootSequence onComplete={handleBootComplete} />}

      <div className={`flex flex-col relative w-full transition-opacity duration-[800ms] ${bootComplete ? "opacity-100" : "opacity-0"}`}>

        {/* ── Dynamic Financial Health Background Orbs ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-[140px] transition-all duration-[3000ms]"
            style={{ backgroundColor: hc.orb1 }} />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full blur-[120px] transition-all duration-[3000ms]"
            style={{ backgroundColor: hc.orb2 }} />
        </div>

        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />

        <main
          {...swipeHandlers}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 pb-safe-nav overflow-hidden"
          style={{ touchAction: "pan-y" }}
        >
          <div className="space-y-10">

            {/* ── SUMMARY TAB ── */}
            {activeTab === "SUMMARY" && (
              <div
                id="panel-summary"
                role="tabpanel"
                aria-labelledby="tab-summary"
                key={`summary-${currentUser}-${selectedMonth}`}
                className="space-y-10"
              >
                {/* Health Badge */}
                <div className={`flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full w-fit text-[9px] font-black italic tracking-widest uppercase border animate-vibe
                  ${health === "SURPLUS" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]" :
                    health === "WARNING" ? "bg-amber-500/10  border-amber-500/20  text-amber-400" :
                      health === "DANGER" ? "bg-rose-500/10   border-rose-500/20   text-rose-400 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.1)]" :
                        "bg-slate-500/10 border-slate-500/20 text-slate-400"}`}>
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {hc.label}
                </div>

                {/* Wallet Cards — UX-10 FIX: now use monthFilteredTransactions via dasunBalance/kavindyaBalance */}
                <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-16 relative">
                  <article
                    onClick={() => { haptic.select(); setCurrentUser("DASUN"); }}
                    className={`animate-vibe click-pop group relative overflow-hidden rounded-[30px] sm:rounded-[60px] p-4 sm:p-10 transition-all duration-700 cursor-pointer flex flex-col justify-between min-h-[140px] sm:min-h-[200px] ${isDasun ? "scroll-glass gpu-promote shadow-[0_20px_60px_-15px_rgba(56,189,248,0.4)]" : "border border-white/5 bg-white/[0.02] scale-[0.96] opacity-60"}`}
                  >
                    {isDasun && <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 blur-[50px] rounded-full pointer-events-none" />}
                    <div className={`absolute -right-2 -bottom-2 sm:right-4 sm:bottom-4 h-24 w-24 sm:h-32 sm:w-32 transition-all duration-700 pointer-events-none z-0 ${isDasun ? "opacity-[0.15]" : "opacity-[0.03] text-slate-500"}`}><WalletOutlineIcon /></div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4 sm:gap-0 w-full">
                      <p className={`text-[12px] sm:text-[18px] font-black italic tracking-[0.2em] sm:tracking-[0.3em] uppercase ${isDasun ? "text-white drop-shadow-md" : "text-slate-500"}`}>DASUN</p>
                      <div className="flex items-baseline gap-1.5 w-full">
                        <span className={`text-[9px] sm:text-[11px] font-bold italic shrink-0 ${isDasun ? "text-sky-400" : "text-slate-500"}`}>Rs.</span>
                        <p className={`text-2xl sm:text-4xl font-black italic tracking-tighter break-all ${isDasun ? "text-gradient-premium" : "text-slate-300"}`}>
                          <AnimatedNumber value={dasunBalance} decimals={0} />
                        </p>
                      </div>
                    </div>
                  </article>

                  <article
                    onClick={() => { haptic.select(); setCurrentUser("KAVINDYA"); }}
                    className={`animate-vibe click-pop group relative overflow-hidden rounded-[30px] sm:rounded-[60px] p-4 sm:p-10 transition-all duration-700 cursor-pointer flex flex-col justify-between min-h-[140px] sm:min-h-[200px] ${isKavindya ? "scroll-glass gpu-promote shadow-[0_20px_60px_-15px_rgba(246,211,101,0.3)]" : "border border-white/5 bg-white/[0.02] scale-[0.96] opacity-60"}`}
                    style={{ animationDelay: "0.1s" }}
                  >
                    {isKavindya && <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/15 blur-[50px] rounded-full pointer-events-none" />}
                    <div className={`absolute -right-2 -bottom-2 sm:right-4 sm:bottom-4 h-24 w-24 sm:h-32 sm:w-32 transition-all duration-700 pointer-events-none z-0 ${isKavindya ? "opacity-[0.15]" : "opacity-[0.03] text-slate-500"}`}><BankOutlineIcon /></div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4 sm:gap-0 w-full">
                      <p className={`text-[12px] sm:text-[18px] font-black italic tracking-[0.2em] sm:tracking-[0.3em] uppercase ${isKavindya ? "text-white drop-shadow-md" : "text-slate-500"}`}>KAVINDYA</p>
                      <div className="flex items-baseline gap-1.5 w-full">
                        <span className={`text-[9px] sm:text-[11px] font-bold italic shrink-0 ${isKavindya ? "text-[#f6d365]" : "text-slate-500"}`}>Rs.</span>
                        <p className={`text-2xl sm:text-4xl font-black italic tracking-tighter break-all ${isKavindya ? "text-gradient-gold" : "text-slate-300"}`}>
                          <AnimatedNumber value={kavindyaBalance} decimals={0} />
                        </p>
                      </div>
                    </div>
                  </article>
                </div>

                {/* Summary Cards */}
                <div className="animate-vibe" style={{ animationDelay: "0.2s" }}>
                  <SummaryCards
                    totalIncome={income}
                    totalExpenses={expense}
                    balance={balance}
                    transactions={transactions}
                    currentUser={currentUser}
                    selectedMonth={selectedMonth}
                  />
                </div>

                {/* Recent Activity */}
                <div className="mt-12 animate-vibe" style={{ animationDelay: "0.3s" }}>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-[12px] sm:text-[14px] font-black italic tracking-widest text-white uppercase">Recent Activity</h3>
                    </div>
                    <button
                      onClick={() => { haptic.light(); setActiveTab("LOG"); }}
                      className="relative flex items-center justify-center min-h-[44px] px-2 text-[9px] font-bold italic tracking-widest text-slate-500 hover:text-purple-400 uppercase transition-colors click-pop"
                    >
                      View Log →
                    </button>
                  </div>

                  <div className="rounded-[24px] sm:rounded-[40px] scroll-glass gpu-promote p-3 sm:p-5 flex flex-col gap-2">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((txn, idx) => (
                        <div
                          key={txn.id}
                          className="animate-vibe click-pop group flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all hover:bg-white/[0.05] border border-transparent hover:border-white/10 cursor-pointer"
                          style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
                          onClick={() => haptic.light()}
                        >
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
                            {txn.type === "income" ? "+ " : "- "}{fmtNum(txn.amount)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState variant="noActivity" setActiveTab={setActiveTab} />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── ANALYTICS TAB ── */}
            {activeTab === "ANALYTICS" && (
              <div id="panel-analytics" role="tabpanel" aria-labelledby="tab-analytics" key="analytics" className="py-6 space-y-10">
                {userTransactions.length > 0 ? (
                  <>
                    <SpendingBreakdown transactions={userTransactions} />
                    <div className="animate-vibe" style={{ animationDelay: "0.3s" }}>
                      <CashFlowTrend transactions={userTransactions} />
                    </div>
                  </>
                ) : (
                  <EmptyState variant="noAnalytics" />
                )}
              </div>
            )}

            {/* ── LOG TAB ── */}
            {activeTab === "LOG" && (
              <div id="panel-log" role="tabpanel" aria-labelledby="tab-log" key="log" className="animate-vibe py-6">
                <TransactionTable
                  transactions={userTransactions}
                  expenseCats={expenseCats}
                  capitalCats={capitalCats}
                  setActiveTab={setActiveTab}
                />
              </div>
            )}

            {/* ── CONTROL TAB ── */}
            {activeTab === "CONTROL" && (
              <div id="panel-control" role="tabpanel" aria-labelledby="tab-control" key="control" className="animate-vibe py-6 max-w-4xl mx-auto flex flex-col gap-10">
                <AddTransactionForm
                  currentUser={currentUser}
                  expenseCats={expenseCats}
                  setExpenseCats={handleUpdateExpenseCats}
                  capitalCats={capitalCats}
                  setCapitalCats={handleUpdateCapitalCats}
                />

                <div className="w-full rounded-[32px] border border-rose-500/20 scroll-glass gpu-promote p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(244,63,94,0.05)] mt-10">
                  <div>
                    <h3 className="text-[14px] sm:text-[16px] font-black italic tracking-widest text-white uppercase leading-none">System Disconnect</h3>
                    <p className="text-[10px] sm:text-[12px] font-bold italic text-slate-400 uppercase tracking-widest mt-2">Safely terminate current session</p>
                  </div>
                  <button
                    ref={logoutMagnet.ref}
                    onMouseMove={logoutMagnet.onMouseMove}
                    onMouseLeave={logoutMagnet.onMouseLeave}
                    onClick={handleLogout}
                    className="click-pop group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-2xl bg-rose-500/10 px-8 py-4 border border-rose-500/30 transition-all duration-300 hover:bg-rose-500/20 hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] font-black italic tracking-widest uppercase text-[11px] text-rose-400"
                  >
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