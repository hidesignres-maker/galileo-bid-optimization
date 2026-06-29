/**
 * KpiStats — DaisyUI stats strip for Galileo KPI cards
 *
 * Usage:
 *   <KpiStats
 *     items={[
 *       { label: "Current Weekly Spend", value: "$142,800", description: "WK12 actuals" },
 *       { label: "Projected RSV Lift",   value: "+$28,400", tone: "success" },
 *       { label: "Projected ROAS",       value: "3.2x",     description: "vs 2.8x target" },
 *     ]}
 *   />
 *
 * Props:
 *   items  — array of { label, value, description?, tone? }
 *   tone   — "default" | "success" | "error" | "warning" | "info"
 *             Colors the value text. Default: base-content.
 *
 * Layout: horizontal scrollable stats strip (DaisyUI `stats` component).
 */

const TONE_CLASS = {
  default: "",
  success: "text-success",
  error:   "text-error",
  warning: "text-warning",
  info:    "text-info",
  primary: "text-primary",
};

export function KpiStats({ items = [] }) {
  return (
    <div className="stats stats-horizontal shadow bg-base-100 border border-base-300 w-full">
      {items.map((item, i) => (
        <div key={i} className="stat">
          <div className="stat-title text-xs font-medium">{item.label}</div>
          <div className={`stat-value text-xl font-semibold ${TONE_CLASS[item.tone] ?? ""}`}>
            {item.value}
          </div>
          {item.description && (
            <div className="stat-desc text-xs">{item.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
