import { CalendarIcon } from "@heroicons/react/24/outline";

/**
 * Input — labeled text/date input with inline error, Corporate style.
 * Date inputs get a leading calendar icon to match the reference UI.
 */
export function Input({
  label,
  hint,
  error,
  required,
  className = "",
  containerClassName = "",
  type,
  ...props
}) {
  const isDate = type === "date";

  return (
    <div className={`form-control w-full ${containerClassName}`}>
      {label && (
        <label className="label pb-1">
          <span className="label-text text-sm font-semibold text-base-content">
            {label}
            {required && <span className="text-error ml-0.5">*</span>}
          </span>
        </label>
      )}
      <div className="relative">
        {isDate && (
          <CalendarIcon className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        <input
          type={type}
          className={`input input-bordered w-full ${isDate ? "pl-9" : ""} ${
            error ? "input-error" : ""
          } ${className}`}
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
