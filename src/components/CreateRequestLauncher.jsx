import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { CreationMethodSelector } from "./CreationMethodSelector";
import { RequestTypeSelector } from "./RequestTypeSelector";
import { BulkTypeSelector } from "./BulkTypeSelector";

/**
 * CreateRequestLauncher — compact modal that replaces the old full-page
 * NewRequestEntry step. Combines creation method + request type into one
 * decision, because the two are not independent:
 *
 *  - Manual creates exactly ONE request, so a single Request Type is
 *    required up front (it becomes ManualRequestWizard's initialRequestType,
 *    skipping its old in-page type gate).
 *  - Bulk CSV creates MANY requests/tickets, one per row, and each row
 *    still carries its own Request_Type column (see ImportCsvStep /
 *    bulkRowToRequest) — mixed types remain possible within a chosen Bulk
 *    type. What IS required up front now (Aug 2026 ticket-centered flow
 *    pass) is a Bulk type/template choice — "Bulk Innovation" or "Bulk
 *    Brand / Viz ID" — since that determines which CSV template
 *    (csvTemplate.js) the user should download/upload. This is a new,
 *    separate `bulkType` concept, NOT a change to the `requestType` enum:
 *    the model still only ever stores `requestType` as `vizId`/
 *    `brandRequest`/`innovation` on each row/request.
 *
 * Mounted conditionally by App.jsx (not always-rendered + toggled), so its
 * local state resets automatically every time it's reopened.
 *
 * Figma-parity pass: renders through the shared `Modal` primitive
 * (ui/Modal.jsx — 552px, 16px radius, no visible close icon, footer-driven
 * dismissal) instead of hand-rolled overlay markup. "Build Manually" is
 * now the default creation method on open, so Request Type is visible
 * immediately with no extra click. Copy/hierarchy corrected to the
 * approved Figma text (see inline notes below). Footer buttons render
 * through Button's Default/Primary and Ghost/Neutral groups (no more
 * red-text Cancel).
 */
export function CreateRequestLauncher({ onCancel, onContinue }) {
  // "Build Manually" is the approved default creation method — the user
  // should see Request Type immediately, not after an extra click. Only
  // the creation *method* defaults; no request type is pre-selected,
  // since no default request type exists in the approved behavior (the
  // primary action stays disabled until the user picks one — see
  // `canContinue` below).
  const [method, setMethod] = useState("manual");
  const [requestType, setRequestType] = useState(null);
  const [bulkType, setBulkType] = useState(null);

  const isManual = method === "manual";
  const isBulk = method === "bulkCsv";
  const canContinue = isManual ? Boolean(requestType) : Boolean(bulkType);

  const handleMethodChange = (value) => {
    setMethod(value);
    // Request type / Bulk type are mutually exclusive selections — clear
    // whichever doesn't apply so it can't leak into the other method's
    // continue if the user switches back and forth.
    if (value !== "manual") setRequestType(null);
    if (value !== "bulkCsv") setBulkType(null);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    onContinue(method, isManual ? requestType : null, isBulk ? bulkType : null);
  };

  return (
    <Modal
      title="Create request"
      onCancel={onCancel}
      footer={
        <>
          {/* Ghost/Neutral group (Button.jsx) — plain neutral text, no
              red/destructive styling. Cancel closes the modal only;
              nothing here mutates any request data. */}
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          {/* Default/Primary group, 40px (Button's own default size).
              Same handleContinue wiring as before this pass — only the
              visible label and button treatment changed, not the
              creation/navigation behavior it triggers. */}
          <Button variant="primary" disabled={!canContinue} onClick={handleContinue}>
            Create request
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Approved introductory copy — replaces the prior prototype
            subtitle ("Choose how requests should be created."), which the
            approved Figma does not show. */}
        <p className="text-sm text-base-content/60">
          Create one request manually or upload a CSV to create multiple requests at once.
        </p>

        <CreationMethodSelector value={method} onChange={handleMethodChange} />

        <div className="border-t border-base-300 pt-4">
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">
            {isBulk ? "Bulk Type" : "Request Type"}
          </p>

          {isManual && (
            <div className="flex flex-col gap-2">
              <RequestTypeSelector value={requestType} onChange={setRequestType} />
              <p className="text-xs text-base-content/50">Required for manual requests.</p>
            </div>
          )}

          {isBulk && (
            <div className="flex flex-col gap-2">
              <BulkTypeSelector value={bulkType} onChange={setBulkType} />
              <p className="text-xs text-base-content/50">
                Determines which CSV template to download and upload. Each row still carries its
                own Request Type within that template — mixed types remain supported.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
