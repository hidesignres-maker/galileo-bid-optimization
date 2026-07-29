import { REQUEST_STATUS, isDueThisPeriod } from "../lib/models";
import { Card } from "./ui/Card";

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
 */
export function QueueMetricCards({ requests }) {
  const dueThisPeriod = requests.filter((r) => isDueThisPeriod(r.dueDate)).length;
  const completed = requests.filter((r) => r.status === REQUEST_STATUS.COMPLETED).length;

  const cards = [
    { label: "Due this Period", value: dueThisPeriod, tone: "text-warning" },
    { label: "Completed This Period", value: completed, tone: "text-success" },
  ];

  return (
    <div className="flex gap-6">
      {cards.map((c) => (
        <Card
          key={c.label}
          flat
          className="w-[194px] h-[84px] shrink-0"
          bodyClassName="p-4 h-full flex flex-col justify-center"
        >
          <div className={`text-2xl font-bold ${c.tone}`}>{c.value}</div>
          <div className="text-xs text-base-content/60 mt-1">{c.label}</div>
        </Card>
      ))}
    </div>
  );
}
