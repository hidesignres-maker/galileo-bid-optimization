/**
 * Table — Galileo dense data table wrapper (Layer 2 enterprise density rules)
 * Always table table-sm. Caller supplies <thead>/<tbody> children.
 *
 * flush: optional, default false. Drops the wrapper's own border/radius so
 * the table sits flush/integrated when it's already inside another
 * bordered surface (e.g. the Queue's Card) instead of reading as a nested
 * card-within-a-card. Every other existing Table usage is unaffected.
 */
export function Table({ children, className = "", flush = false }) {
  return (
    <div className={`overflow-x-auto ${flush ? "" : "border border-base-300 rounded-box"} ${className}`}>
      <table className="table table-sm">{children}</table>
    </div>
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
