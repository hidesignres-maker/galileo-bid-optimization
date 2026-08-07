import { CalendarIcon } from "@heroicons/react/24/outline";
import { FieldInfoTooltip } from "./FieldInfoTooltip";

/**
 * Input — labeled text/date input with inline error, Corporate style.
 * Date inputs get a leading calendar icon to match the reference UI.
 *
 * `icon` — optional leading Heroicon component for non-date inputs (e.g.
 * LinkIcon on Reference link, per Add Details Pattern v1). Purely visual:
 * no navigation/click behavior is attached to it. Backward-compatible —
 * every existing caller omits it and renders exactly as before. Date
 * inputs keep their own CalendarIcon regardless of this prop, so `type`
 * and `icon` can never both try to render a leading icon at once.
 *
 * `size` — optional, "md" (default, unchanged) | "sm" (appends DaisyUI's
 * own `input-sm` modifier, ~32px tall, for compact table-cell editing —
 * see InnovationItemTable.jsx). Every existing caller omits this prop and
 * renders with the exact same classes as before.
 *
 * `labelInfo` — optional tooltip text rendered as a small info icon next to
 * the label (see FieldInfoTooltip). Omitted by every existing caller, so
 * every existing Input renders with no label icon, exactly as before.
 */
export function Input({
  label,
  labelInfo,
  hint,
  error,
  required,
  className = "",
  containerClassName = "",
  type,
  icon: Icon,
  size = "md",
  ...props
}) {
  const isDate = type === "date";
  const hasLeadingIcon = isDate || Boolean(Icon);

  return (
    <div className={`form-control w-full ${containerClassName}`}>
      {label && (
        <label className="label pb-1">
          <span className="label-text text-sm font-semibold text-base-content inline-flex items-center gap-1">
            {label}
            {required && <span className="text-error ml-0.5">*</span>}
            {labelInfo && <FieldInfoTooltip text={labelInfo} />}
          </span>
        </label>
      )}
      <div className="relative">
        {isDate && (
          <CalendarIcon className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        )}
        {!isDate && Icon && (
          <Icon className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        )}
        <input
          type={type}
          className={`input input-bordered w-full ${size === "sm" ? "input-sm" : ""} ${
            hasLeadingIcon ? "pl-9" : ""
          } ${error ? "input-error" : ""} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <span className="text-xs text-error mt-1">{error}</span>
      ) : hint ? (
        <span className="text-xs text-base-content/50 mt-1">{hint}</span>
      ) : null}
    </div>
  );
}
