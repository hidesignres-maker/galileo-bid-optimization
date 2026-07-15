import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Button } from "./ui/Button";
import { CreationMethodSelector } from "./CreationMethodSelector";
import { RequestTypeSelector } from "./RequestTypeSelector";

/**
 * CreateRequestLauncher — compact modal that replaces the old full-page
 * NewRequestEntry step. Combines creation method + request type into one
 * decision, because the two are not independent:
 *
 *  - Manual creates exactly ONE request, so a single Request Type is
 *    required up front (it becomes ManualRequestWizard's initialRequestType,
 *    skipping its old in-page type gate).
 *  - Bulk CSV creates MANY requests, one per row, and each row carries its
 *    own Request_Type column (see ImportCsvStep / bulkRowToRequest) — so
 *    there is no batch-level type to choose here. Selecting Bulk shows
 *    informational copy instead of a required selector.
 *
 * Mounted conditionally by App.jsx (not always-rendered + toggled), so its
 * local state resets automatically every time it's reopened.
 */
export function CreateRequestLauncher({ onCancel, onContinue }) {
  const [method, setMethod] = useState(null);
  const [requestType, setRequestType] = useState(null);

  const isManual = method === "manual";
  const isBulk = method === "bulkCsv";
  const canContinue = isManual ? Boolean(requestType) : isBulk;

  const handleMethodChange = (value) => {
    setMethod(value);
    // Request type only applies to Manual — clear any prior selection so it
    // can't leak into a Bulk continue if the user switches methods.
    if (value !== "manual") setRequestType(null);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    onContinue(method, isManual ? requestType : null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-base-100 border border-base-300 rounded-box shadow-lg">
        <div className="flex items-start justify-between px-5 pt-5">
          <div>
            <h2 className="text-base font-bold text-base-content">Create request</h2>
            <p className="text-xs text-base-content/50 mt-0.5">
              Choose how requests should be created.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-base-content/40 hover:text-base-content"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <CreationMethodSelector value={method} onChange={handleMethodChange} />

          <div className="border-t border-base-300 pt-4">
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">
              Request type
            </p>

            {!method && (
              <p className="text-sm text-base-content/40 italic">
                Select a creation method to continue.
              </p>
            )}

            {isManual && (
              <div className="flex flex-col gap-2">
                <RequestTypeSelector value={requestType} onChange={setRequestType} />
                <p className="text-xs text-base-content/50">Required for manual requests.</p>
              </div>
            )}

            {isBulk && (
              <p className="text-sm text-base-content/60">
                Bulk CSV supports mixed request types. Each row defines its own request type
                using the Request_Type column.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-base-300 px-5 py-4">
          <Button variant="text" className="text-error" onClick={onCancel}>
            Cancel
          </Button>
          <Button icon={ArrowRightIcon} disabled={!canContinue} onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
