"use client";
// UX-03 FIX: Replaced overlay click-catcher approach with conditional rendering
//   of a placeholder button vs. the real <input type="month">. Avoids cross-browser
//   issues where Firefox Android would open the native picker despite pointer-events:none.
// UX-04 FIX: Bottom nav now has role="tablist" / role="tab" / aria-selected / aria-controls.
// REFACTOR-02 FIX: Removed dead handleLogout and unused signOut import.
// REFACTOR-03 FIX: Imports getCurrentMonthStr from lib/utils instead of duplicating it.

import { useRouter } from "next/navigation";
import { useHaptic } from "@/lib/useHaptic";
import { getCurrentMonthStr } from "@/lib/utils";

const tabs = ["SUMMARY", "ANALYTICS", "LOG", "CONTROL"];

export default function Navbar({ activeTab, setActiveTab, currentUser, setCurrentUser, selectedMonth, setSelectedMonth }) {
  const router = useRouter();
  const haptic = useHaptic();

  const toggleUser = () => {
    haptic.select();
    setCurrentUser(currentUser === "DASUN" ? "KAVINDYA" : "DASUN");
  };

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-40 w-full bg-[#080b12]/60 backdrop-blur-3xl saturate-[2] border-b border-white/5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 px-4 flex justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all">
        <div className="flex items-center gap-3">

          {/* User toggle pill */}
          <button
            onClick={toggleUser}
            aria-label={`Active user: ${currentUser}. Tap to switch.`}
            className={`click-pop no-select flex items-center gap-1.5 rounded-full border px-4 py-3 text-[11px] font-bold italic transition-all duration-300 shadow-lg cursor-pointer
              ${currentUser === "DASUN"
                ? "border-sky-500/30 bg-sky-500/10 text-white hover:bg-sky-500/20 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                : "border-purple-500/40 bg-purple-500/20 text-white hover:bg-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"}`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {currentUser}
          </button>

          {/* Month filter group */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-md shadow-inner">

            {/* ALL TIME button */}
            <button
              onClick={() => { haptic.light(); setSelectedMonth("ALL"); }}
              aria-pressed={selectedMonth === "ALL"}
              className={`click-pop no-select rounded-full px-4 py-2.5 text-[10px] font-black italic tracking-widest transition-all duration-300 ${selectedMonth === "ALL"
                ? "bg-purple-500/20 border border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                : "border border-transparent text-slate-500 hover:text-white hover:bg-white/5"
                }`}
            >
              ALL TIME
            </button>

            {/* UX-03 FIX: When selectedMonth === "ALL", render a plain button that
                sets the month on click. When a month is already selected, render
                the real <input type="month"> directly. This avoids the overlay
                pattern that conflicted with the native picker on Firefox Android. */}
            {selectedMonth === "ALL" ? (
              <button
                type="button"
                onClick={() => { haptic.light(); setSelectedMonth(getCurrentMonthStr()); }}
                className="click-pop no-select rounded-full px-4 py-2.5 text-[10px] font-black italic tracking-widest border border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-300"
              >
                THIS MONTH
              </button>
            ) : (
              <div className="rounded-full px-4 py-2.5 bg-sky-500/20 border border-sky-500/30 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all duration-300">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => { haptic.light(); setSelectedMonth(e.target.value || "ALL"); }}
                  aria-label="Select month"
                  className="bg-transparent outline-none text-[16px] font-bold italic tracking-widest cursor-pointer uppercase [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-1"
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Floating Bottom Nav ── */}
      <div className="fixed z-50 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bottom-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] pointer-events-none transition-all">
        {/* UX-04 FIX: role="tablist" + per-button role="tab" + aria-selected + aria-controls */}
        <nav
          role="tablist"
          aria-label="Main Navigation"
          className="bg-[#080b12]/60 backdrop-blur-3xl saturate-[2] rounded-[2rem] p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto border border-white/10 ring-1 ring-white/5"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.toLowerCase()}`}
                onClick={() => {
                  if (!isActive) haptic.medium();
                  setActiveTab(tab);
                }}
                className={`click-pop no-select relative flex-1 flex flex-col items-center justify-center min-h-[52px] py-3 rounded-full transition-all duration-300
                  ${isActive ? "bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "hover:bg-white/5"}
                `}
              >
                {isActive && (
                  <span className="absolute -top-2 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                )}
                <span className={`text-[9px] sm:text-[10px] font-black italic tracking-widest uppercase transition-all duration-300
                    ${isActive ? "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" : "text-slate-500"}`}>
                  {tab}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}