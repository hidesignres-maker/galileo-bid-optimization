const OPTIONS = [
  {
    value: "manual",
    title: "Build manually",
    description: "Create one request. Search products or enter item inputs directly.",
  },
  {
    value: "bulkCsv",
    title: "Bulk CSV import",
    description: "Upload a CSV to create many requests at once — e.g. a Q4 Viz ID calendar.",
  },
];

/**
 * CreationMethodSelector — the very first decision in the flow (Content
 * Request Queue → New Request → here). Nothing request-type-specific is
 * shown until this is picked, because Manual and Bulk are structurally
 * different: Manual builds one Request; Bulk builds many.
 */
export function CreationMethodSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex items-start gap-3 rounded-box border p-5 cursor-pointer transition-colors ${
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-base-300 bg-base-100 hover:border-base-content/30"
            }`}
          >
            <input
              type="radio"
              name="creationMethod"
              className="radio radio-primary radio-sm mt-0.5"
              checked={selected}
              onChange={() => onChange(opt.value)}
            />
            <div>
              <div className="text-sm font-bold text-base-content">{opt.title}</div>
              <div className="text-xs text-base-content/60 mt-1">{opt.description}</div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
