import { FieldInfoTooltip } from "./FieldInfoTooltip";

/**
 * Select — labeled select input, Galileo style
 * options: [{ value, label }]
 *
 * `size` — optional, "md" (default, unchanged) | "sm" (appends DaisyUI's
 * own `select-sm` modifier, ~32px tall, for compact table-cell editing —
 * see InnovationItemTable.jsx). Every existing caller omits this prop and
 * renders with the exact same classes as before.
 *
 * `labelInfo` — optional tooltip text rendered as a small info icon next to
 * the label (see FieldInfoTooltip). Omitted by every existing caller, so
 * every existing Select renders with no label icon, exactly as before.
 */
export function Select({
  label,
  labelInfo,
  hint,
  error,
  required,
  options = [],
  placeholder = "Select…",
  className = "",
  containerClassName = "",
  size = "md",
  ...props
}) {
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
      <select
        className={`select select-bordered w-full ${size === "sm" ? "select-sm" : ""} ${
          error ? "select-error" : ""
        } ${className}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-xs text-error mt-1">{error}</span>
      ) : hint ? (
        <span className="text-xs text-base-content/50 mt-1">{hint}</span>
      ) : null}
    </div>
  );
}
