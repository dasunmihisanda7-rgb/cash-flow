"use client"; // This is a must!

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const getCurrentMonthStr = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export default function Navbar({ activeTab, setActiveTab, currentUser, setCurrentUser, selectedMonth, setSelectedMonth }) {
  const tabs = ["SUMMARY", "ANALYTICS", "LOG", "CONTROL"];
  const router = useRouter();

  const toggleUser = () => {
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
      {/* ── 1. TOP HEADER (Controls & Badges) 🚀 ── */}
      {/* මේක Notch එකට ගැලපෙන්න උඩින්ම තියෙනවා */}
      <div className="sticky top-0 z-40 w-full bg-[#0b0f1a]/80 backdrop-blur-2xl border-b border-white/5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 px-4 flex justify-center shadow-lg">
        <div className="flex items-center gap-3">

          {/* User Toggle */}
          <button
            onClick={toggleUser}
            className={`no-select flex items-center gap-1.5 rounded-full border px-4 py-2 text-[11px] font-bold italic transition-all duration-500 shadow-lg cursor-pointer
              ${currentUser === "DASUN"
                ? "border-sky-500/30 bg-sky-500/10 text-white hover:bg-sky-500/20"
                : "border-purple-500/40 bg-purple-500/20 text-white hover:bg-purple-500/30"}`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            </span>
            {currentUser}
          </button>

          {/* Month Picker */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-md shadow-inner">
            <button
              onClick={() => setSelectedMonth("ALL")}
              className={`no-select rounded-full px-4 py-1.5 text-[10px] font-black italic tracking-widest transition-all duration-300 ${selectedMonth === "ALL"
                ? "bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                : "text-slate-500 hover:text-white"
                }`}
            >
              ALL TIME
            </button>

            <div className={`relative flex items-center rounded-full px-4 py-1.5 transition-all duration-300 ${selectedMonth !== "ALL"
              ? "bg-sky-500/20 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
              : "text-slate-500/40 hover:text-slate-400 cursor-pointer"
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
                onChange={(e) => setSelectedMonth(e.target.value || "ALL")}
                className={`bg-transparent outline-none text-[11px] font-bold italic tracking-widest cursor-pointer uppercase transition-all
                  ${selectedMonth === "ALL" ? "opacity-50 pointer-events-none" : "opacity-100"} 
                  [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-1`}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. BOTTOM NAVIGATION BAR (iOS Style) 🚀 ── */}
      {/* මේක ෆෝන් එකේ යටින්ම පාවෙන්න හදලා තියෙන්නේ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-white/10 bg-[#161b27]/80 backdrop-blur-3xl pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex h-16 sm:h-20 items-center justify-between px-2 sm:px-8 max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="no-select relative flex flex-col items-center justify-center w-full h-full transition-all duration-300"
              >
                {/* Active උනාම උඩින් පේන ලස්සන ග්ලෝ වෙන ඉර */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-[3px] rounded-b-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] transition-all"></span>
                )}

                <span
                  className={`text-[9px] sm:text-[11px] font-black italic tracking-widest uppercase transition-all duration-300 mt-1
                    ${isActive ? "text-purple-400 scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "text-slate-500 hover:text-slate-300 scale-100"}
                  `}
                >
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