import { REQUEST_STATUS, isDueThisPeriod } from "../lib/models";
import { MetricCard } from "./ui/MetricCard";

/**
 * QueueMetricCards — Galileo summary-card row above the Queue surface.
 *
 * Two cards only, per the approved Figma composition: "Due this Period" and
 * "Completed This Period". Values reuse the exact calculations this
 * component already had — no new metric or calculation introduced:
 *  - Due this Period: isDueThisPeriod(dueDate), unchanged (date-based, not
 *    status-scoped).
 *  - Completed This Period: reuses the existing all-time
 *    `status === COMPLETED` count. There is no existing calculation that
 *    additionally scopes "completed" to the current period, and combining
 *    one wasn't introduced here per "do not add new calculations" — so the
 *    card's title is period-scoped (Figma copy) but its number is the same
 *    all-time Completed count that already existed. Flagged in the parity
 *    report; not silently invented.
 *
 * Rendering moved to the shared MetricCard primitive (ui/MetricCard.jsx)
 * — this component now only computes the two values and supplies
 * label/value; card geometry, colors, and the label-above-value order
 * live in MetricCard, not here. Both cards use the default "neutral"
 * variant per the approved Figma state — the prior yellow/green tones
 * are gone, not reassigned to a different token.
 */
export function QueueMetricCards({ requests }) {
  const dueThisPeriod = requests.filter((r) => isDueThisPeriod(r.dueDate)).length;
  const completed = requests.filter((r) => r.status === REQUEST_STATUS.COMPLETED).length;

  const cards = [
    { label: "Due this Period", value: dueThisPeriod },
    { label: "Completed This Period", value: completed },
  ];

  return (
    <div className="flex gap-6">
      {cards.map((c) => (
        <MetricCard key={c.label} label={c.label} value={c.value} />
      ))}
    </div>
  );
}
