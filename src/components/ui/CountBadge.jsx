/**
 * CountBadge — shared, reusable count-pill primitive (Galileo design
 * system). Not DaisyUI's `.badge`/`badge-ghost` combo — that pairs a
 * fixed neutral text color with the pill, which can't turn blue when
 * its parent tab is active without fighting the component's own
 * built-in color. This is a small, self-contained primitive instead, so
 * that state is a plain prop.
 *
 * Visual values (Figma): background `#EFEFEF` / border `#D5D6D6` —
 * defined once as theme tokens (`--color-count-badge` /
 * `--color-count-badge-outline` in theme/corporate.css) and consumed
 * here via `bg-count-badge` / `border-count-badge-outline`, not repeated
 * as literal hex in this file or anywhere else. Radius reuses the same
 * `--radius-selector` (4px) token DaisyUI's own `.badge` already uses
 * elsewhere in the app (status pills), for a compact rounded-square
 * feel consistent with the rest of the UI rather than a new radius.
 *
 * `active` (default false): when true, the numeral renders in the same
 * blue as the parent Tab's active label (`text-primary`) with a
 * matching light-blue tint on the pill itself instead of the neutral
 * fill/border — this is what makes the count badge and its tab label
 * read as one highlighted unit. When false (default), the pill stays
 * neutral (`bg-count-badge` / `border-count-badge` / muted text)
 * regardless of what's around it — this component has no awareness of
 * tabs, filters, or any business logic; the caller owns entirely when
 * to pass `active`.
 *
 * Deliberately generic — no tab-specific or Queue-specific naming —
 * reusable anywhere a small neutral count needs to render:
 *   <CountBadge count={9} />
 *   <CountBadge count={9} active />
 */
export function CountBadge({ count, active = false }) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium border ${
        active
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-count-badge border-count-badge-outline text-base-content/60"
      }`}
      style={{ borderRadius: "var(--radius-selector)" }}
    >
      {count}
    </span>
  );
}
