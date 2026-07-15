/**
 * Checkbox — Galileo checkbox with optional inline label
 */
export function Checkbox({ label, className = "", ...props }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" className={`checkbox checkbox-primary checkbox-sm ${className}`} {...props} />
      {label && <span className="text-sm text-base-content">{label}</span>}
    </label>
  );
}
