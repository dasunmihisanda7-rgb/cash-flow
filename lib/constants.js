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