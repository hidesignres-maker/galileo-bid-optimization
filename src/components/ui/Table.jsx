/**
 * Table — Galileo dense data table wrapper (Layer 2 enterprise density rules)
 * Always table table-sm. Caller supplies <thead>/<tbody> children.
 *
 * flush: optional, default false. Drops the wrapper's own border/radius so
 * the table sits flush/integrated when it's already inside another
 * bordered surface (e.g. the Queue's Card) instead of reading as a nested
 * card-within-a-card. Every other existing Table usage is unaffected.
 *
 * `...rest` (e.g. id, role, aria-labelledby) — optional, spread onto the
 * outer wrapper div. Added so ContentRequestQueue's table can be
 * associated with its status tabs (role="tabpanel" + aria-labelledby the
 * active tab) without every other existing Table caller needing to change;
 * omitted entirely, these simply don't render, same as before.
 */
export function Table({ children, className = "", flush = false, ...rest }) {
  return (
    <div className={`overflow-x-auto ${flush ? "" : "border border-base-300 rounded-box"} ${className}`} {...rest}>
      <table className="table table-sm">{children}</table>
    </div>
  );
}

/**
 * ClampCell — opt-in text-heavy table cell that wraps up to 2 lines and
 * clamps with ellipsis beyond that, letting its row grow to fit the second
 * line instead of forcing a fixed row height.
 *
 * <td> stays the real outer table-cell element so column layout and the
 * semantic table structure are untouched — no display override, no
 * min-height on <tr>/<td> (unreliable on table-row/table-cell boxes).
 * The clamp, wrap, and vertical-centering logic all live on plain block
 * elements nested inside the cell:
 *  - outer inner div: min-h-12 (48px floor, matches this table's default
 *    row height) + flex items-center, so short titles still sit centered
 *    exactly like a normal single-line cell.
 *  - inner div: line-clamp-2 + break-words, the actual 2-line clamp.
 *
 * className applies to the <td> itself (layout/positioning, same as any
 * other cell in this table). contentClassName applies only to the clamped
 * text node inside (typography), so callers can style the text without
 * touching cell layout.
 *
 * Opt-in only: every existing <td> in every existing table is unaffected
 * unless it's explicitly rewritten to use ClampCell.
 */
export function ClampCell({ children, className = "", contentClassName = "" }) {
  return (
    <td className={className}>
      <div className="min-h-12 flex items-center">
        <div className={`line-clamp-2 break-words ${contentClassName}`}>{children}</div>
      </div>
    </td>
  );
}

export function EmptyRow({ colSpan, children = "No rows yet." }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center text-sm text-base-content/50 py-6">
        {children}
      </td>
    </tr>
  );
}
