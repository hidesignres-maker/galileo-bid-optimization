/**
 * CustomBadge — shared, reusable Galileo compact-metadata badge (Queue
 * retailer tags today; any other short "code + optional dot" tag in the
 * future). Built on DaisyUI's own `badge` class as the foundation (base
 * inline-flex/alignment/line-height behavior), with Galileo-specific
 * sizing, spacing, color, and typography layered on top — this is
 * intentionally NOT the same visual language as `STATUS_BADGE`'s status
 * pills (`badge-soft badge-{semantic}`, --radius-box/8px, semantic
 * color) or `CountBadge` (its own bg/border tokens, tab-count-only
 * semantics). Do not reuse CustomBadge for status pills, Queue tab
 * counts, editable controls, or action buttons — those already have
 * their own established, unrelated components/styling.
 *
 * Visual: neutral light surface (`bg-base-200`), a subtle `border-
 * base-300` outline, compact horizontal padding, `text-xs font-normal`
 * (no heavy weight), and DaisyUI's own default `--radius-selector`
 * (4px) — a tighter, more "tag-like" radius than the rounder 8px status
 * pills use, which keeps the two patterns visually distinct on the same
 * table row.
 *
 * `dotColor` — optional Tailwind background-color class (e.g.
 * "bg-primary"), rendered as a small circular dot before the label.
 * Omit it for a plain neutral tag with no dot — used for the overflow
 * badge (`<CustomBadge label="+2" />`), which never gets a dot per the
 * Retailer cell spec.
 *
 * `title` — optional, sets a native tooltip with the full accessible
 * text (e.g. "Walmart") when `label` itself is an abbreviation (e.g.
 * "WMT"); the rendered `label` is always in the accessible text either
 * way, this just adds the full name on hover.
 *
 * Deliberately generic — no retailer-specific naming or data — reusable
 * anywhere a compact "dot + short label" tag is needed:
 *   <CustomBadge label="WMT" dotColor="bg-primary" title="Walmart" />
 *   <CustomBadge label="+2" />
 */
export function CustomBadge({ label, dotColor, title }) {
  return (
    <span
      className="badge inline-flex items-center gap-1 px-1.5 h-5 text-xs font-normal leading-none whitespace-nowrap bg-base-200 border border-base-300 text-base-content/70"
      title={title}
    >
      {dotColor && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />}
      {label}
    </span>
  );
}
