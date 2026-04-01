"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useHaptic } from "@/lib/useHaptic";

const getCurrentMonthStr = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export default function Navbar({ activeTab, setActiveTab, currentUser, setCurrentUser, selectedMonth, setSelectedMonth }) {
  const tabs = ["SUMMARY", "ANALYTICS", "LOG", "CONTROL"];
  const router = useRouter();
  const haptic = useHaptic();

  const toggleUser = () => {
    haptic.select();
    setCurrentUser(currentUser === "DASUN" ? "KAVINDYA" : "DASUN");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 w-full bg-[#080b12]/80 backdrop-blur-2xl border-b border-white/5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 px-4 flex justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">

          <button
            onClick={toggleUser}
            className={`click-pop no-select flex items-center gap-1.5 rounded-full border px-4 py-3 text-[11px] font-bold italic transition-all duration-300 shadow-lg cursor-pointer
              ${currentUser === "DASUN"
                ? "border-sky-500/30 bg-sky-500/10 text-white hover:bg-sky-500/20 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                : "border-purple-500/40 bg-purple-500/20 text-white hover:bg-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"}`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            </span>
            {currentUser}
          </button>

          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-md shadow-inner">
            <button
              onClick={() => {
                haptic.light();
                setSelectedMonth("ALL");
              }}
              className={`click-pop no-select rounded-full px-4 py-2.5 text-[10px] font-black italic tracking-widest transition-all duration-300 ${selectedMonth === "ALL"
                ? "bg-purple-500/20 border border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                : "border border-transparent text-slate-500 hover:text-white hover:bg-white/5"
                }`}
            >
              ALL TIME
            </button>

            <div className={`relative flex items-center rounded-full px-4 py-2.5 transition-all duration-300 ${selectedMonth !== "ALL"
              ? "bg-sky-500/20 border border-sky-500/30 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
              : "border border-transparent text-slate-500/60 hover:text-slate-300 hover:bg-white/5 cursor-pointer"
              }`}
            >
              {selectedMonth === "ALL" && (
                <div
                  className="absolute inset-0 z-10 rounded-full cursor-pointer"
                  onClick={() => setSelectedMonth(getCurrentMonthStr())}
                />
              )}

              <input
                type="month"
                value={selectedMonth === "ALL" ? getCurrentMonthStr() : selectedMonth}
                onChange={(e) => {
                  haptic.light();
                  setSelectedMonth(e.target.value || "ALL");
                }}
                className={`bg-transparent outline-none text-[16px] font-bold italic tracking-widest cursor-pointer uppercase transition-all
                  ${selectedMonth === "ALL" ? "opacity-50 pointer-events-none" : "opacity-100"} 
                  [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-1`}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Floating Bottom Nav */}
      <div className="fixed z-50 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bottom-[max(1.5rem,env(safe-area-inset-bottom))] pointer-events-none">
        <div className="premium-glass rounded-[2rem] p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto border border-white/10 ring-1 ring-white/5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  if (!isActive) haptic.medium();
                  setActiveTab(tab);
                }}
                className={`click-pop no-select relative flex-1 flex flex-col items-center justify-center min-h-[52px] py-3 rounded-full transition-all duration-300
                  ${isActive ? "bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "hover:bg-white/5"}
                `}
              >
                {isActive && (
                  <span className="absolute -top-2 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                )}
                <span className={`text-[9px] sm:text-[10px] font-black italic tracking-widest uppercase transition-all duration-300
                    ${isActive ? "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" : "text-slate-500"}`}>
                  {tab}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}