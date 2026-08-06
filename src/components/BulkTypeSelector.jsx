import { BULK_TYPE_LABELS } from "../data/formOptions";

const BULK_TYPES = ["innovation", "brandViz"];

/**
 * BulkTypeSelector — Bulk CSV's own type/template choice (Aug 2026 pass).
 * Mirrors RequestTypeSelector.jsx exactly (same plain inline-radio-row
 * treatment, not SelectionCard) — two options is the same "small set,
 * short label, no supporting copy needed" case SelectionCard.jsx's own
 * doc comment says a plain radio row is the better fit for.
 *
 * `value`/`onChange` — same contract as RequestTypeSelector: raw
 * `bulkType` string in, `onChange(newValue)` out. Determines which CSV
 * template ImportCsvStep offers and which mock rows a simulated upload
 * returns — never written onto a Request's own `requestType`.
 */
export function BulkTypeSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {BULK_TYPES.map((type) => (
        <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio"
            name="bulkType"
            className="radio radio-primary radio-sm"
            checked={value === type}
            onChange={() => onChange(type)}
          />
          <span className="text-sm text-base-content">{BULK_TYPE_LABELS[type]}</span>
        </label>
      ))}
    </div>
  );
}
