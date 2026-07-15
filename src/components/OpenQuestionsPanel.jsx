import { ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

/**
 * These replace the previous round's open questions (which were about the
 * old "CSV = many products in one request" model and are now moot). All of
 * the current ones are Bulk-CSV-specific, which is why this panel now only
 * renders inside BulkCsvWizard rather than every flow.
 */
const OPEN_QUESTIONS = [
  "In Bulk CSV, does each row always create one request, or can rows be grouped?",
  "How are assets/links handled in Bulk — per row URLs, later in detail view, or batch-level upload?",
  "Which request types support Bulk in MVP?",
  "What fields are required for placeholder tasks?",
  "Can bulk-created placeholder requests be edited later in request detail?",
  "Does Bulk validation support partial success, or is it all-or-nothing?",
];

// Kept visible for traceability — confirms what used to be open and is now
// settled, so it isn't re-litigated or mistaken for still-undecided.
const RESOLVED_QUESTIONS = [
  "Request type is per-row (Request_Type column), not selected once for the whole batch. A single upload can mix Viz ID Change, Brand Request, and Innovation rows.",
];

export function OpenQuestionsPanel() {
  return (
    <details className="collapse collapse-arrow border border-warning/40 bg-warning/5 rounded-box">
      <summary className="collapse-title text-sm font-semibold text-base-content min-h-0 py-3 flex items-center gap-2">
        <ExclamationTriangleIcon className="w-4 h-4 text-warning shrink-0" />
        Open questions ({OPEN_QUESTIONS.length}) — not yet decided
      </summary>
      <div className="collapse-content flex flex-col gap-4">
        <ol className="list-decimal list-inside text-sm text-base-content/70 flex flex-col gap-1">
          {OPEN_QUESTIONS.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>

        {RESOLVED_QUESTIONS.length > 0 && (
          <div className="border-t border-warning/30 pt-3">
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <CheckCircleIcon className="w-3.5 h-3.5 text-success" />
              Resolved this round
            </p>
            <ul className="text-sm text-base-content/70 flex flex-col gap-1">
              {RESOLVED_QUESTIONS.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}
