import { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { WizardStepper } from "../components/WizardStepper";
import { ImportCsvStep } from "../components/ImportCsvStep";
import { BulkReviewStep } from "../components/BulkReviewStep";
import { ConfirmRequestsStep } from "../components/ConfirmRequestsStep";
import { Button } from "../components/ui/Button";
import { createBulkBatch, bulkRowToRequest } from "../lib/models";

// Bulk CSV's own stepper — deliberately NOT the Manual wizard's stepper.
// Putting Bulk upload inside "Step 2" of the manual wizard was the previous
// prototype's structural bug.
//
// "Download Template" and "Upload Template" used to be two separate steps;
// they're now merged into one "Upload" step (ImportCsvStep) per
// stakeholder feedback — the download action, required columns, and the
// upload control belong in a single card, matching the reference
// internal-app pattern. Review and Confirm remain their own steps.
// Step labels (Aug 2026 ticket-centered flow pass): "Upload" / "Review
// tickets" / "Confirm" — matches the approved flow's own literal naming.
const BULK_STEPS = ["Upload", "Review tickets", "Confirm"];

/**
 * BulkCsvWizard — creates MANY requests, one per uploaded row (per the
 * corrected data model). Ends by calling onRequestsCreated with the full
 * array of new placeholder Requests.
 *
 * Open assumption: Bulk is currently treated as a global request
 * generator — any mix of VizID Change, Brand Request, and Innovation rows
 * in one file, no batch-level constraints. This hasn't been confirmed with
 * product as final.
 *
 * Flow simplification (Aug 2026 pass): ImportCsvStep no longer renders its
 * own full imported-row table — that duplicated the exact same `rows` the
 * Review step already shows, with richer (product-centered, validated)
 * detail. A successful upload now auto-advances straight to Review
 * (`setCurrentStep(1)` inside `handleUploadComplete`, only when rows were
 * actually returned — the empty/failed upload outcomes stay on Import CSV
 * exactly as before, since ImportCsvStep still owns those states itself).
 * `rows`/`batch` remain the single source of truth here, unchanged in
 * shape or meaning — only when the step advances is new.
 *
 * Ticket-centered flow pass (Aug 2026): `initialBulkType` (from
 * CreateRequestLauncher's new Bulk type/template choice) is threaded
 * straight through to ImportCsvStep, unchanged for this wizard's own
 * lifetime — the type is chosen once, before Upload, per the approved
 * flow. `handleUpdateRow` is the single place a ticket's data can change
 * after upload (Edit Ticket's Save, via BulkReviewStep) — same
 * "rows/batch owned here" principle as everything else in this component.
 */
export function BulkCsvWizard({ initialBulkType = null, onRequestsCreated, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rows, setRows] = useState([]);
  const [batch, setBatch] = useState(null);

  const stepName = BULK_STEPS[currentStep];

  const handleUpdateRow = (rowId, patch) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
  };

  const handleUploadComplete = (uploadedRows, fileName) => {
    setRows(uploadedRows);
    // No batch-level requestType — rows carry their own. templateName now
    // carries the real picked filename (from UploadDropzone's browser File
    // API callback) instead of staying at its hardcoded default, so the
    // compact source metadata shown in Review can display it honestly.
    setBatch(
      createBulkBatch({
        rowCount: uploadedRows.length,
        ...(fileName ? { templateName: fileName } : {}),
      })
    );
    // Auto-advance to Review — the single place the full row table now
    // renders. Only when there's something to review; the "empty upload"
    // outcome (uploadedRows.length === 0) stays on Import CSV so its own
    // "No rows found" prompt still shows.
    if (uploadedRows.length > 0) {
      setCurrentStep(1);
    }
  };

  // Shared by ImportCsvStep's "Try again" (empty/failed upload) and
  // BulkReviewStep's new "Replace file" action — clears rows/batch and
  // returns to the Import CSV step so the dropzone shows again. rows/batch
  // stay owned here (the single source of truth), not duplicated in either
  // step's own state. Forcing currentStep back to 0 is a no-op for the
  // pre-existing ImportCsvStep call sites (already on step 0 whenever they
  // can be clicked) and is what makes "Replace file" from Review work.
  const handleReset = () => {
    setRows([]);
    setBatch(null);
    setCurrentStep(0);
  };

  const handleConfirm = () => {
    const readyRows = rows.filter((r) => r.willCreateRequest && r.status !== "issue");
    const newRequests = readyRows.map((row) => bulkRowToRequest(row, batch?.id));
    onRequestsCreated(newRequests, {
      ...batch,
      createdRequestCount: newRequests.length,
      status: "confirmed",
    });
  };

  const canContinue = stepName !== "Upload" || rows.length > 0;
  const isReviewStep = stepName === "Review tickets";

  return (
    <div className="flex flex-col gap-6">
      <WizardStepper steps={BULK_STEPS} currentStep={currentStep} furthestStep={BULK_STEPS.length - 1} />

      {stepName === "Upload" && (
        <ImportCsvStep
          rows={rows}
          batch={batch}
          bulkType={initialBulkType}
          onUploadComplete={handleUploadComplete}
          onReset={handleReset}
        />
      )}

      {isReviewStep && (
        <BulkReviewStep rows={rows} batch={batch} onReplaceFile={handleReset} onUpdateRow={handleUpdateRow} />
      )}

      {stepName === "Confirm" && (
        <ConfirmRequestsStep rows={rows} onConfirm={handleConfirm} onBack={() => setCurrentStep(1)} />
      )}

      {stepName !== "Confirm" && (
        <div className="flex flex-col gap-2 border-t border-base-300 pt-4">
          {isReviewStep && (
            <p className="text-xs text-base-content/50">Only tickets marked Ready will be created.</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="text" className="text-error" onClick={onCancel}>
                Discard
              </Button>
              {currentStep > 0 && (
                <Button variant="ghost" onClick={() => setCurrentStep((s) => Math.max(s - 1, 0))}>
                  Back
                </Button>
              )}
            </div>
            <Button
              icon={ArrowRightIcon}
              disabled={!canContinue}
              onClick={() => setCurrentStep((s) => Math.min(s + 1, BULK_STEPS.length - 1))}
            >
              {isReviewStep ? "Continue to confirm" : `Continue to ${BULK_STEPS[currentStep + 1]}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
