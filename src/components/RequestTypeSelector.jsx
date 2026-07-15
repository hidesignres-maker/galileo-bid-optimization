import { REQUEST_TYPE_LABELS } from "../data/formOptions";

const TYPES = ["vizId", "brandRequest", "innovation"];

/**
 * RequestTypeSelector — inline radio row (matches reference UI: filled
 * circle radio + label, horizontal, no card chrome).
 */
export function RequestTypeSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {TYPES.map((type) => (
        <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio"
            name="requestType"
            className="radio radio-primary radio-sm"
            checked={value === type}
            onChange={() => onChange(type)}
          />
          <span className="text-sm text-base-content">{REQUEST_TYPE_LABELS[type]}</span>
        </label>
      ))}
    </div>
  );
}
