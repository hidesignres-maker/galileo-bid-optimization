/**
 * Galileo — shared formatters
 * Extracted from App.jsx (lines 16–24).
 * Do not duplicate these in App.jsx once App.jsx imports from here.
 * Phase 4+ will replace the inline copies.
 */

export const fmtCurrency = (n) =>
  n == null ? "—" : "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

export const fmtPct = (n) =>
  n == null ? "—" : (n > 0 ? "+" : "") + n.toFixed(1) + "%";

export const fmtBid = (n) =>
  n == null ? "—" : "$" + n.toFixed(2);
