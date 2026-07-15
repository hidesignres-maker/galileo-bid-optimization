import { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { WizardStepper } from "../components/WizardStepper";
import { ImportCsvStep } from "../components/ImportCsvStep";
import { BulkReviewStep } from "../components/BulkReviewStep";
import { ConfirmRequestsStep } from "../components/ConfirmRequestsStep";
import { OpenQuestionsPanel } from "../components/OpenQuestionsPanel";
import { Button } from "../components/ui/Button";
import { createBulkBatch, bulkRowToRequest } from "../lib/models";

// Bulk CSV's own stepper — deliberately NOT the Manual wizard's stepper.
// Putting Bulk upload inside "Step 2" of the manual wizard was the previous
// prototype's structural bug.
//
// "Download Template" and "Upload Template" used to be two separate steps;
// they're now merged into one "Import CSV" step (ImportCsvStep) per
// stakeholder feedback — the download action, required columns, and the
// upload control belong in a single card, matching the reference
// internal-app pattern. Review and Confirm remain their own steps.
const BULK_STEPS = ["Import CSV", "Review", "Confirm"];

/**
 * BulkCsvWizard — creates MANY requests, one per uploaded row (per the
 * corrected data model). Ends by calling onRequestsCreated with the full
 * array of new placeholder Requests.
 */
export function BulkCsvWizard({ onRequestsCreated, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rows, setRows] = useState([]);
  const [batch, setBatch] = useState(null);

  const stepName = BULK_STEPS[currentStep];

  const handleUploadComplete = (uploadedRows) => {
    setRows(uploadedRows);
    // No batch-level requestType — rows carry their own. Kept here only as
    // a display convenience for "this batch contains: Viz ID, Innovation…".
    setBatch(
      createBulkBatch({
        rowCount: uploadedRows.length,
      })
    );
  };

  // "Upload another file" inside ImportCsvStep — clears rows/batch so the
  // step falls back to its dropzone state. rows/batch stay owned here (the
  // single source of truth), not duplicated in ImportCsvStep's own state.
  const handleReset = () => {
    setRows([]);
    setBatch(null);
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

  const canContinue = stepName !== "Import CSV" || rows.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <OpenQuestionsPanel />

      <WizardStepper steps={BULK_STEPS} currentStep={currentStep} furthestStep={BULK_STEPS.length - 1} />

      {stepName === "Import CSV" && (
        <ImportCsvStep rows={rows} onUploadComplete={handleUploadComplete} onReset={handleReset} />
      )}

      {stepName === "Review" && <BulkReviewStep rows={rows} />}

      {stepName === "Confirm" && <ConfirmRequestsStep rows={rows} onConfirm={handleConfirm} />}

      {stepName !== "Confirm" && (
        <div className="flex items-center justify-between border-t border-base-300 pt-4">
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
            Continue to {BULK_STEPS[currentStep + 1]}
          </Button>
        </div>
      )}
    </div>
  );
}
