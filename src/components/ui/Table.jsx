/**
 * Table — Galileo dense data table wrapper (Layer 2 enterprise density rules)
 * Always table table-sm. Caller supplies <thead>/<tbody> children.
 */
export function Table({ children, className = "" }) {
  return (
    <div className={`overflow-x-auto border border-base-300 rounded-box ${className}`}>
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
