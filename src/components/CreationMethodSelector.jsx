import { SelectionCard } from "./ui/SelectionCard";

// Approved copy (Figma parity pass). "Build Manually" is the exact
// approved title casing. Description is the single supporting line each
// card shows below its title — matches the one-line treatment both
// approved cards use.
const OPTIONS = [
  {
    value: "manual",
    title: "Build Manually",
    description: "Create one request by completing a form.",
  },
  {
    value: "bulkCsv",
    title: "Bulk CSV import",
    description: "Multiple requests from a CSV. Each row becomes one request.",
  },
];

/**
 * CreationMethodSelector — the very first decision in the flow (Content
 * Request Queue → New Request → here). Nothing request-type-specific is
 * shown until this is picked, because Manual and Bulk are structurally
 * different: Manual builds one Request; Bulk builds many.
 *
 * Renders through the shared `SelectionCard` primitive (ui/SelectionCard.jsx)
 * — this component now only owns the two options' copy/values and the
 * `grid`/responsive layout (side-by-side at `sm:` and up, stacked below
 * that), not the card markup itself.
 */
export function CreationMethodSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {OPTIONS.map((opt) => (
        <SelectionCard
          key={opt.value}
          name="creationMethod"
          value={opt.value}
          selected={value === opt.value}
          title={opt.title}
          description={opt.description}
          onSelect={() => onChange(opt.value)}
        />
      ))}
    </div>
  );
}
