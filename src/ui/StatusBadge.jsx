/**
 * StatusBadge — DaisyUI badge with Galileo semantic statuses
 *
 * Usage:
 *   <StatusBadge status="pending" />
 *   <StatusBadge status="applied" label="Pushed" />
 *
 * Supported statuses:
 *   pending   → neutral (grey)
 *   applied   → success (green)
 *   accepted  → success (green)
 *   rejected  → error (pink)
 *   declined  → error (pink)
 *   expired   → neutral/outline
 *   pushed    → primary (purple, AI accent)
 *   draft     → warning (orange)
 *
 * Props:
 *   status  — one of the keys above (required)
 *   label   — override display text (optional; defaults to capitalized status)
 *   size    — "xs" | "sm" | "md" (default "sm")
 */

const STATUS_MAP = {
  pending:  { variant: "badge-neutral",  label: "Pending" },
  applied:  { variant: "badge-success",  label: "Applied" },
  accepted: { variant: "badge-success",  label: "Accepted" },
  rejected: { variant: "badge-error",    label: "Rejected" },
  declined: { variant: "badge-error",    label: "Declined" },
  expired:  { variant: "badge-ghost",    label: "Expired" },
  pushed:   { variant: "badge-primary",  label: "Pushed" },
  draft:    { variant: "badge-warning",  label: "Draft" },
};

const SIZE_MAP = {
  xs: "badge-xs",
  sm: "badge-sm",
  md: "",
};

export function StatusBadge({ status, label, size = "sm" }) {
  const cfg = STATUS_MAP[status] ?? { variant: "badge-neutral", label: status };
  const displayLabel = label ?? cfg.label;
  const sizeClass = SIZE_MAP[size] ?? "";

  return (
    <span className={`badge ${cfg.variant} ${sizeClass}`}>
      {displayLabel}
    </span>
  );
}
