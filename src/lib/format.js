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
