// lib/utils.js
// REFACTOR-03 FIX: `getCurrentMonthStr` was duplicated in Navbar.js and
// DashboardShell.js. It now lives here as the single source of truth.

/**
 * Returns the current month as a "YYYY-MM" string.
 * Suitable for use as a value in <input type="month"> and for date filtering.
 */
export function getCurrentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
