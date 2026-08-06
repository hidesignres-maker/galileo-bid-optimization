import { Card } from "./Card";

// Semantic color rule: metric cards do not use color by default. These
// exist only as explicit, opt-in variants for future use — nothing in
// this file applies "success"/"warning"/"danger" automatically.
const VALUE_TEXT_CLASS_BY_VARIANT = {
  neutral: "text-base-content",
  success: "text-success",
  warning: "text-warning",
  danger: "text-error",
};

/**
 * MetricCard — shared, reusable summary-metric tile (Galileo design
 * system). Built on the shared Card primitive, which already owns
 * surface/border/radius/shadow — bg-base-100, border-base-300,
 * radius-box (8px), shadow-sm (Card's default, already an exact match
 * for the Figma shadow/sm value) — none of that is redefined here.
 *
 * Figma spec: 194px fixed width, 12px padding, 8px internal gap,
 * flex-column, content left-aligned (items-start/text-left — corrected
 * from an earlier centered treatment; Figma does not center this card),
 * label rendered above value.
 * `bodyPadding="p-3"` (Card's new, backward-compatible prop) replaces
 * Card's default 16px body padding outright — see Card.jsx's doc
 * comment for why this uses a real prop instead of an appended class.
 * `flex-col`/`gap-2` are listed explicitly for clarity, even though
 * DaisyUI's own `.card-body` rule already sets `flex-direction: column;
 * gap: .5rem` by default.
 *
 * No fixed height — the Figma spec only defines width/padding/gap, not
 * a height; the card sizes to its content plus the 12px padding, same
 * as `flex-shrink: 0` in the Figma composition (which governs sizing
 * within a flex row, not a hardcoded height).
 *
 * `variant` (default "neutral"): value text stays plain
 * `text-base-content` — no yellow/green/red by default, per product
 * direction. "success"/"warning"/"danger" are explicit opt-in variants
 * for future callers (e.g. an overdue-count tile); the Queue's current
 * approved Figma state uses "neutral" for every card.
 *
 * Deliberately generic — no Queue-specific naming, no request
 * terminology, no fixed copy — so any future module can reuse it for
 * its own summary tiles:
 *   <MetricCard label="Due this Period" value={3} />
 */
export function MetricCard({ label, value, variant = "neutral" }) {
  const valueClass = VALUE_TEXT_CLASS_BY_VARIANT[variant] ?? VALUE_TEXT_CLASS_BY_VARIANT.neutral;

  return (
    <Card
      className="w-[194px] shrink-0"
      bodyPadding="p-3"
      bodyClassName="flex flex-col items-start gap-2 text-left"
    >
      <div className="w-full text-xs text-base-content/60">{label}</div>
      <div className={`w-full text-2xl font-bold ${valueClass}`}>{value}</div>
    </Card>
  );
}
