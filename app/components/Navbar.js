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
  // 🚀 වෙනස් කළ තැන: "TRENDS" අයින් කරලා Tabs 4කට හැදුවා
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
    <div className="sticky z-50 flex flex-col items-center w-full px-4 mb-8 gap-4 top-[max(1rem,env(safe-area-inset-top))]">

      {/* 1. Glassmorphism Navigation Bar */}
      <div className="w-full max-w-3xl overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl">
        <header className="flex items-center justify-center gap-6 sm:gap-8 px-6 sm:px-9 py-3.5 sm:py-4 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full text-[10px] md:text-xs font-bold italic">
          {tabs.map((tab) => (
            <span
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer transition-all duration-300 tracking-[0.15em] sm:tracking-widest ${activeTab === tab
                ? "text-purple-400 scale-110"
                : "text-white/60 hover:text-white"
                }`}
            >
              {tab}
            </span>
          ))}
        </header>
      </div>

      {/* 2. Nav Badges & Controls */}
      <div className="flex items-center gap-3">

        <button
          onClick={toggleUser}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[11px] font-bold italic transition-all duration-500 shadow-lg cursor-pointer
            ${currentUser === "DASUN"
              ? "border-sky-500/30 bg-sky-500/10 text-white hover:bg-sky-500/20 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]"
              : "border-purple-500/40 bg-purple-500/20 text-white hover:bg-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          </span>
          {currentUser}
        </button>

        {/* ── 3. HYBRID MONTH PICKER ── */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 p-1.5 backdrop-blur-md shadow-inner">

          <button
            onClick={() => setSelectedMonth("ALL")}
            className={`rounded-full px-4 py-2 text-[10px] font-black italic tracking-widest transition-all duration-300 ${selectedMonth === "ALL"
              ? "bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              : "text-slate-500 hover:text-white"
              }`}
          >
            ALL TIME
          </button>

          <div className={`relative flex items-center rounded-full px-4 py-2 transition-all duration-300 ${selectedMonth !== "ALL"
            ? "bg-sky-500/20 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
            : "text-slate-500/40 hover:text-slate-400 cursor-pointer"
            }`}
          >
            {selectedMonth === "ALL" && (
              <div
                className="absolute inset-0 z-10 rounded-full cursor-pointer"
                onClick={() => setSelectedMonth(getCurrentMonthStr())}
                title="Click to go back to Current Month"
              />
            )}

            <input
              type="month"
              value={selectedMonth === "ALL" ? getCurrentMonthStr() : selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value || "ALL");
              }}
              className={`bg-transparent outline-none text-[12px] font-bold italic tracking-widest cursor-pointer uppercase transition-all
                ${selectedMonth === "ALL" ? "opacity-50 pointer-events-none" : "opacity-100"} 
                [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-2 hover:[&::-webkit-calendar-picker-indicator]:opacity-80`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}