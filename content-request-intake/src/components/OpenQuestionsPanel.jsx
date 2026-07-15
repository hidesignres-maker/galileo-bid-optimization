import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * These replace the previous round's open questions (which were about the
 * old "CSV = many products in one request" model and are now moot). All of
 * the current ones are Bulk-CSV-specific, which is why this panel now only
 * renders inside BulkCsvWizard rather than every flow.
 */
const OPEN_QUESTIONS = [
  "In Bulk CSV, does each row always create one request, or can rows be grouped?",
  "Is request type selected once before template download, or included per CSV row?",
  "How are assets/links handled in Bulk — per row URLs, later in detail view, or batch-level upload?",
  "Which request types support Bulk in MVP?",
  "What fields are required for placeholder tasks?",
  "Can bulk-created placeholder requests be edited later in request detail?",
  "Does Bulk validation support partial success, or is it all-or-nothing?",
];

export function OpenQuestionsPanel() {
  return (
    <details className="collapse collapse-arrow border border-warning/40 bg-warning/5 rounded-box">
      <summary className="collapse-title text-sm font-semibold text-base-content min-h-0 py-3 flex items-center gap-2">
        <ExclamationTriangleIcon className="w-4 h-4 text-warning shrink-0" />
        Open questions ({OPEN_QUESTIONS.length}) — not yet decided
      </summary>
      <div className="collapse-content">
        <ol className="list-decimal list-inside text-sm text-base-content/70 flex flex-col gap-1">
          {OPEN_QUESTIONS.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </div>
    </details>
  );
}
