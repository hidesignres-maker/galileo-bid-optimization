/**
 * Galileo — shared formatters for Content Request Intake
 * Mirrors the pattern in bid optimization/src/theme/formatters.js
 */

export const fmtDate = (isoOrDate) => {
  if (!isoOrDate) return "—";
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate + "T00:00:00") : isoOrDate;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const fmtCount = (n, singular, plural = `${singular}s`) =>
  `${n} ${n === 1 ? singular : plural}`;

export const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * fmtRelativeDate — small, additive pure formatter for the READ header's
 * "latest activity" line (e.g. "Sandra Smith changed Status · 3 days ago").
 * Not a replacement for fmtDate (still used everywhere an absolute date is
 * wanted) — this is only for the one relative-day-count use case.
 *
 * Whole-day difference between `isoDate` and `today` (both ISO
 * YYYY-MM-DD, local midnight so DST doesn't shift the day count). Covers
 * the only two directions this app's History events actually need
 * (past events, and "today") but also handles a future date gracefully
 * ("in N days") since nothing here assumes the input is in the past.
 */
export const fmtRelativeDate = (isoDate, today = todayIso()) => {
  if (!isoDate) return "—";
  const d = new Date(isoDate + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  if (Number.isNaN(d.getTime()) || Number.isNaN(t.getTime())) return "—";
  const diffDays = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays === -1) return "yesterday";
  if (diffDays > 1) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};
