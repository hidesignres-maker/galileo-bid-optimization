/**
 * Tab — shared presentational primitive for the underline-style tab
 * pattern used across the app (module top nav, Content Request Queue
 * status tabs, Product Selection view tabs). Purely visual: it owns no
 * state, no routing, and no selection logic — every caller still owns
 * `active`/`onClick`/labels/counts/aria-* exactly as before. This exists
 * so the Figma-approved tab-item geometry lives in one place instead of
 * being hand-copied (and drifting slightly) across three call sites.
 *
 * Figma source of truth (shared tab item):
 *   display: inline-flex; height: 40px (--fields-size-md);
 *   padding: 1px 12px (--tailwind-spacing-312); justify/align: center;
 *   gap: 8px (--tailwind-spacing-28).
 * Tailwind mapping used below — no new CSS tokens needed, these are
 * exact matches to Tailwind's default scale:
 *   h-10 = 2.5rem = 40px | py-px = 1px | px-3 = 12px | gap-2 = 8px.
 *
 * Visual states (all backed by existing Galileo tokens, nothing
 * hardcoded here):
 *   - default/hover/selected all stay background-transparent — no
 *     DaisyUI `tabs`/`tab` classes are used anywhere in this app, so
 *     there is no filled-background class to override; this component
 *     simply never introduces one.
 *   - active: text-primary + border-primary (existing Galileo blue),
 *     via a 2px bottom border used as the underline. `-mb-px` overlaps
 *     that underline with the 1px neutral divider each tab row/wrapper
 *     already draws (border-b border-base-300), so the active underline
 *     sits flush against it instead of stacking a second line below.
 *     Weight is `font-medium` (500), not `font-semibold` (600) — the
 *     Figma tab spec distinguishes the active tab by color + underline
 *     only, not heavy bold; color/underline already carry the
 *     hierarchy, so the type doesn't need to feel heavy too.
 *   - inactive: muted text (text-base-content/60), transparent border,
 *     explicit `font-normal` (regular weight); hover only darkens the
 *     text (text-base-content) — no background, no weight change.
 *
 * `className` appends caller-specific layout needs (e.g. `whitespace-nowrap`)
 * without touching the shared visual contract above. Any other prop
 * (`role`, `id`, `aria-*`, `aria-selected`, `aria-current`,
 * `aria-controls`...) passes straight through, so each caller keeps its
 * own tab/tablist semantics and focus behavior unchanged.
 */
export function Tab({ active = false, onClick, children, className = "", ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 py-px px-3 justify-center items-center gap-2 text-sm border-b-2 -mb-px transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        active
          ? "border-primary text-primary font-medium"
          : "border-transparent text-base-content/60 font-normal hover:text-base-content"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
