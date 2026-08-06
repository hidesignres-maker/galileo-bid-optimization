import { useState } from "react";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { InfoBanner } from "./ui/InfoBanner";
import { UploadDropzone } from "./ui/UploadDropzone";
import { mockBulkRows } from "../data/mockBulkRows";
import { COMBINED_TEMPLATE_COLUMNS, TEMPLATE_COLUMNS_BY_BULK_TYPE, downloadCsvTemplate } from "../lib/csvTemplate";

/**
 * ImportCsvStep — Bulk CSV's merged "Import CSV" step. Replaces what used
 * to be two separate stepper steps (Download Template, Upload Template) —
 * per stakeholder feedback, they belong in one card, matching the
 * reference internal-app pattern: download action + required columns +
 * upload control all together.
 *
 * Flow simplification (Aug 2026 pass): this step no longer grows its own
 * full "Imported requests" table/search after a successful upload — that
 * duplicated the exact same `rows` the Review step (BulkReviewStep) already
 * shows, with richer, product-centered, validated detail. A successful
 * upload now auto-advances the wizard straight to Review
 * (BulkCsvWizard.handleUploadComplete), so this step's own post-upload
 * state is only actually seen if the user navigates Back from Review —
 * in that case it shows compact source metadata only (filename, row
 * count, Replace file), sourced from `batch` (the parent-owned record that
 * survives this component unmounting/remounting across step navigation —
 * this component's own local state does not).
 *
 * `rows`/`batch` are owned by the parent (BulkCsvWizard), passed in as
 * props, so this component stays in sync with the single source of truth
 * rather than tracking its own copy. `onUploadComplete(rows, fileName)` —
 * `fileName` is the real picked/dropped file's name from
 * UploadDropzone's browser File API callback (previously captured and then
 * discarded); threaded up so the parent can carry it into `batch`.
 *
 * `bulkType` (Aug 2026 pass, `"innovation"|"brandViz"`, from
 * CreateRequestLauncher's new Bulk type choice) — picks the matching
 * column subset for the required-columns guidance and template download
 * (`TEMPLATE_COLUMNS_BY_BULK_TYPE`, lib/csvTemplate.js), and, for the
 * simulated upload only, filters `mockBulkRows` down to the rows whose
 * `requestType` actually belongs to that bulk type — so choosing "Bulk
 * Innovation" doesn't hand back unrelated VizID/Brand Request rows in the
 * demo. This is a simulation-consistency choice, not new parsing/matching
 * logic: a real upload would only ever contain rows from the template the
 * user actually downloaded.
 */
export function ImportCsvStep({ rows, batch, bulkType, onUploadComplete, onReset }) {
  const [status, setStatus] = useState("idle"); // idle | processing | empty | failed

  const templateColumns = TEMPLATE_COLUMNS_BY_BULK_TYPE[bulkType] ?? COMBINED_TEMPLATE_COLUMNS;

  const simulate = (outcome, fileName) => {
    setStatus("processing");
    setTimeout(() => {
      if (outcome === "success") {
        setStatus("idle");
        const rowsForType =
          bulkType === "innovation"
            ? mockBulkRows.filter((r) => r.requestType === "innovation")
            : bulkType === "brandViz"
              ? mockBulkRows.filter((r) => r.requestType !== "innovation")
              : mockBulkRows;
        onUploadComplete(rowsForType, fileName);
      } else if (outcome === "empty") {
        setStatus("empty");
        onUploadComplete([]);
      } else {
        setStatus("failed");
      }
    }, 600);
  };

  const handleReset = () => {
    setStatus("idle");
    onReset();
  };

  const showUploaded = status !== "processing" && rows.length > 0;
  const showDropzone = status === "idle" && rows.length === 0;

  return (
    <Card
      title="Import CSV"
      subtitle="Upload a completed CSV file to create requests. Each row becomes one request/task."
      actions={
        <Button
          variant="outline"
          size="sm"
          icon={ArrowDownTrayIcon}
          iconPosition="leading"
          onClick={() => downloadCsvTemplate(bulkType)}
        >
          Download CSV template
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-box bg-base-200 border border-base-300 p-4 flex gap-3">
          <InformationCircleIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-base-content mb-1.5">Required columns</p>
            <div className="flex flex-wrap gap-1.5">
              {templateColumns.map((col) => (
                <span key={col} className="badge badge-sm badge-ghost font-mono">
                  {col}
                </span>
              ))}
            </div>
            <p className="text-xs text-base-content/50 mt-2">
              Use one row per request. Fill only the fields that apply to each row's request type.
              Add links or notes per row when supporting content is available.
            </p>
          </div>
        </div>

        {/* Business rule: for Bulk CSV, supporting content is captured per
            row as links/notes. Global file upload is intentionally avoided
            because each row creates a separate request. Actual file
            attachments can be added later in the request detail view. */}
        <InfoBanner variant="info">
          Files can be attached later in the request detail view. For Bulk, use links/notes in the
          CSV to avoid ambiguous batch-level uploads.
        </InfoBanner>

        {status === "processing" && (
          <div className="flex items-center gap-2 text-sm text-base-content/60 py-6 justify-center">
            <span className="loading loading-spinner loading-sm" />
            Processing upload…
          </div>
        )}

        {showDropzone && (
          <div className="flex flex-col gap-3">
            <UploadDropzone onFileSelected={(fileName) => simulate("success", fileName)} />
            <p className="text-xs text-base-content/50 -mt-1">Accepted file type: .csv</p>
            <div className="flex items-center gap-2 text-xs text-base-content/50">
              <span>Simulate:</span>
              <button type="button" className="link" onClick={() => simulate("empty")}>
                empty upload
              </button>
              <span>·</span>
              <button type="button" className="link" onClick={() => simulate("failed")}>
                upload failed
              </button>
            </div>
          </div>
        )}

        {status === "empty" && (
          <InfoBanner variant="warning" title="No rows found">
            The file uploaded but contained no data rows. Check the template and try again.
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Try again
              </Button>
            </div>
          </InfoBanner>
        )}

        {status === "failed" && (
          <InfoBanner variant="error" title="Upload failed">
            We couldn't read this file. Confirm it matches the downloaded template and try again.
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Try again
              </Button>
            </div>
          </InfoBanner>
        )}

        {showUploaded && (
          <div className="flex items-center justify-between gap-4 flex-wrap border-t border-base-300 pt-5">
            <p className="text-sm text-base-content/70">
              <span className="font-semibold text-base-content">{batch?.templateName || "Uploaded file"}</span>
              {" · "}
              {rows.length} row{rows.length === 1 ? "" : "s"} uploaded
            </p>
            <Button variant="outline" size="sm" icon={ArrowUpTrayIcon} iconPosition="leading" onClick={handleReset}>
              Replace file
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
