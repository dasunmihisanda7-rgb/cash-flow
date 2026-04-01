// lib/constants.js
// PERF-02 FIX: CATEGORY_EMOJI was duplicated in DashboardShell.js and
// TransactionTable.js. It now lives here as the single source of truth.

export const INITIAL_EXPENSE_CATEGORIES = [
  "Food", "Transport", "Utilities", "Health",
  "Entertainment", "Education", "Other",
];

export const INITIAL_CAPITAL_CATEGORIES = [
  "Salary", "Freelance", "Investments", "Business", "Bonus",
];

// PERF-02: Single source of truth for category emojis
export const CATEGORY_EMOJI = {
  Salary: "💼",
  Freelance: "🖊️",
  Investments: "📈",
  Business: "🏢",
  Bonus: "🎁",
  Food: "🍔",
  Transport: "🚌",
  Utilities: "⚡",
  Health: "🏥",
  Entertainment: "🎬",
  Education: "📚",
  Other: "📦",
};

export const CATEGORY_THEME = {
  Salary: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
  Freelance: "bg-teal-500/10 text-teal-400 border-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]",
  Investments: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]",
  Business: "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]",
  Bonus: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 shadow-[0_0_10px_rgba(217,70,239,0.1)]",
  Food: "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]",
  Transport: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]",
  Utilities: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  Health: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]",
  Entertainment: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]",
  Education: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
  Other: "bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-[0_0_10px_rgba(100,116,139,0.1)]",
};