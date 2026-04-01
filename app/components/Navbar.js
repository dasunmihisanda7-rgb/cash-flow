"use client";

import { useHaptic } from "@/lib/useHaptic";
import { getCurrentMonthStr } from "@/lib/utils";

const tabs = ["SUMMARY", "ANALYTICS", "LOG", "CONTROL"];

export default function Navbar({ activeTab, setActiveTab, currentUser, setCurrentUser, selectedMonth, setSelectedMonth }) {
  const haptic = useHaptic();

  const toggleUser = () => {
    haptic.select();
    setCurrentUser(currentUser === "DASUN" ? "KAVINDYA" : "DASUN");
  };

  return (
    <>
      {/* ── Top Bar ── */}
      <div
        className="sticky top-0 z-40 w-full gpu-promote"
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top))",
        }}
      >
        <div className="w-full bg-[#080b12]/60 border-b border-white/5 pb-3 px-4 flex justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all"
          style={{
            WebkitBackdropFilter: "blur(28px) saturate(2)",
            backdropFilter: "blur(28px) saturate(2)",
          }}
        >
          {/* Action Buttons Container (Background box removed) */}
          <div className="flex items-center justify-center gap-3 w-full max-w-sm mx-auto pt-1">

            {/* User toggle pill */}
            <button
              onClick={toggleUser}
              aria-label={`Active user: ${currentUser}. Tap to switch.`}
              className={`click-pop no-select flex items-center shrink-0 gap-1.5 rounded-full border px-4 py-2.5 text-[11px] font-bold italic transition-all duration-300 shadow-lg cursor-pointer min-h-[44px]
                ${currentUser === "DASUN"
                  ? "border-sky-500/30 bg-sky-500/10 text-white hover:bg-sky-500/20 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                  : "border-purple-500/40 bg-purple-500/20 text-white hover:bg-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"}`}
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {currentUser}
            </button>

            {/* Month filter group */}
            <div className="flex items-center gap-1.5 shrink-0">

              {/* ALL TIME button */}
              <button
                onClick={() => { haptic.light(); setSelectedMonth("ALL"); }}
                aria-pressed={selectedMonth === "ALL"}
                className={`click-pop no-select rounded-full px-4 py-2.5 text-[10px] font-black italic tracking-widest transition-all duration-300 min-h-[44px] ${selectedMonth === "ALL"
                  ? "bg-purple-500/20 border border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  : "border border-transparent text-slate-500 hover:text-white hover:bg-white/5"
                  }`}
              >
                ALL TIME
              </button>

              {selectedMonth === "ALL" ? (
                <button
                  type="button"
                  onClick={() => { haptic.light(); setSelectedMonth(getCurrentMonthStr()); }}
                  className="click-pop no-select rounded-full px-4 py-2.5 text-[10px] font-black italic tracking-widest border border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-300 min-h-[44px]"
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
      </div>

      {/* ── Floating Bottom Nav ── */}
      <div
        className="fixed z-50 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md pointer-events-none transition-all gpu-promote"
        style={{ bottom: 0, paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <nav
          role="tablist"
          aria-label="Main Navigation"
          className="bg-[#080b12]/60 rounded-[2rem] p-2 relative flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto border border-white/10 ring-1 ring-white/5"
          style={{
            WebkitBackdropFilter: "blur(28px) saturate(2)",
            backdropFilter: "blur(28px) saturate(2)",
          }}
        >
          {/* Sliding Active Pill */}
          <div
            className="absolute top-2 bottom-2 bg-white/[0.08] rounded-full border border-white/[0.05] pointer-events-none gpu-promote"
            style={{
              width: `calc((100% - 16px) / ${tabs.length})`,
              transform: `translateX(calc(${tabs.indexOf(activeTab)} * 100%))`,
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)",
            }}
            aria-hidden="true"
          />

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
                className={`click-pop no-select relative z-10 flex-1 flex flex-col items-center justify-center min-h-[52px] py-3 rounded-full transition-all duration-300
                  ${isActive ? "" : "hover:bg-white/5"}
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