const COPY_BY_FLOW = {
  vizId: {
    manual: "Search and select products. (small requests)",
    bulkCsv: "Upload a CSV file to add multiple products at once. (bulk requests)",
  },
  brandRequest: {
    manual: "Search and select products. (small requests)",
    bulkCsv: "Upload a CSV file to add multiple products at once. (bulk requests)",
  },
  innovation: {
    manual: "Enter item inputs one by one. (small requests)",
    bulkCsv: "Upload a CSV file to add multiple item inputs at once. (bulk requests)",
  },
};

/**
 * UploadMethodSelector — "Upload data" card selector (Build manually /
 * Import CSV), matching the reference UI's two-card radio pattern.
 */
export function UploadMethodSelector({ requestType, value, onChange }) {
  const copy = COPY_BY_FLOW[requestType] ?? COPY_BY_FLOW.vizId;

  const options = [
    { value: "manual", title: "Build manually", description: copy.manual },
    { value: "bulkCsv", title: "Import CSV", description: copy.bulkCsv },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex items-start gap-3 rounded-box border p-4 cursor-pointer transition-colors ${
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-base-300 bg-base-100 hover:border-base-content/30"
            }`}
          >
            <input
              type="radio"
              name="uploadMethod"
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
