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
        className="sticky top-0 z-40 w-full gpu-promote pointer-events-none"
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top))",
        }}
      >
        <div className="w-full pb-3 px-4 flex justify-center transition-all pointer-events-auto">
          {/* Action Buttons Container */}
          <div className="flex items-center justify-center gap-3 w-full max-w-sm mx-auto pt-1">

            {/* User Toggle Pill - Premium Glass Card */}
            <button
              onClick={toggleUser}
              aria-label={`Active user: ${currentUser}. Tap to switch.`}
              className={`click-pop no-select flex items-center shrink-0 gap-2 rounded-full px-4 py-2.5 text-[12px] font-bold italic transition-all duration-300 cursor-pointer min-h-[44px] bg-[#161b27]/80 backdrop-blur-md border shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.5)]
                ${currentUser === "DASUN"
                  ? "border-sky-500/30 ring-1 ring-sky-500/20 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                  : "border-purple-500/30 ring-1 ring-purple-500/20 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"}`}
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {currentUser}
            </button>

            {/* Month filter group */}
            <div className="flex items-center gap-2 shrink-0">

              {/* ALL TIME button - Premium Glass Card */}
              <button
                onClick={() => { haptic.light(); setSelectedMonth("ALL"); }}
                aria-pressed={selectedMonth === "ALL"}
                className={`click-pop no-select rounded-full px-4 py-2.5 text-[10px] font-black italic tracking-widest transition-all duration-300 min-h-[44px] bg-[#161b27]/80 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.5)] border
                  ${selectedMonth === "ALL"
                    ? "border-purple-500/30 ring-1 ring-purple-500/20 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                    : "border-white/10 text-slate-400 hover:text-white"
                  }`}
              >
                ALL TIME
              </button>

              {/* MONTH SELECTOR - Premium Glass Card */}
              {selectedMonth === "ALL" ? (
                <button
                  type="button"
                  onClick={() => { haptic.light(); setSelectedMonth(getCurrentMonthStr()); }}
                  className="click-pop no-select rounded-full px-4 py-2.5 text-[10px] font-black italic tracking-widest transition-all duration-300 min-h-[44px] bg-[#161b27]/80 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.5)] border border-white/10 text-slate-400 hover:text-white"
                >
                  THIS MONTH
                </button>
              ) : (
                <div className="rounded-full px-4 py-2.5 transition-all duration-300 bg-[#161b27]/80 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.5)] border border-sky-500/30 ring-1 ring-sky-500/20 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)] flex items-center min-h-[44px]">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => { haptic.light(); setSelectedMonth(e.target.value || "ALL"); }}
                    aria-label="Select month"
                    className="bg-transparent outline-none text-[12px] sm:text-[14px] font-bold italic tracking-widest cursor-pointer uppercase [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-1"
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