import { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { UploadDropzone } from "./ui/UploadDropzone";
import { Card } from "./ui/Card";
import { InfoBanner } from "./ui/InfoBanner";
import { mockBulkRows } from "../data/mockBulkRows";
import { COMBINED_TEMPLATE_COLUMNS } from "./CsvTemplateStep";

/**
 * CsvUploadStep — Bulk CSV's step 2. No real parsing: any file picked
 * simulates the fixed `mockBulkRows` result after a short delay, standing
 * in for "upload succeeded, N rows parsed." A mocked "empty upload" /
 * "upload failed" state is also available for demoing those cases.
 *
 * Layout matches the reference internal-app pattern: a "Required columns"
 * chip panel above an explicit drag-and-drop / Browse files control, with
 * the accepted file type called out below the box.
 */
export function CsvUploadStep({ onUploadComplete }) {
  const [status, setStatus] = useState("idle"); // idle | processing | success | failed | empty

  const simulate = (outcome) => {
    setStatus("processing");
    setTimeout(() => {
      setStatus(outcome);
      if (outcome === "success") onUploadComplete(mockBulkRows);
      if (outcome === "empty") onUploadComplete([]);
    }, 600);
  };

  return (
    <Card title="Upload Template" subtitle="Upload your completed CSV. Each row becomes one request/task.">
      <div className="flex flex-col gap-4">
        {status === "idle" && (
          <>
            <div className="rounded-box bg-base-200 border border-base-300 p-4 flex gap-3">
              <InformationCircleIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-base-content mb-1.5">Required columns</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMBINED_TEMPLATE_COLUMNS.map((col) => (
                    <span key={col} className="badge badge-sm badge-ghost font-mono">
                      {col}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-base-content/50 mt-2">
                  Only fill in the columns that apply to each row's <code>request_type</code> — see
                  Download Template for details.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <UploadDropzone onFileSelected={() => simulate("success")} />
              <p className="text-xs text-base-content/50">Accepted file type: .csv</p>
            </div>

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
          </>
        )}

        {status === "processing" && (
          <div className="flex items-center gap-2 text-sm text-base-content/60 py-6 justify-center">
            <span className="loading loading-spinner loading-sm" />
            Processing upload…
          </div>
        )}

        {status === "success" && (
          <InfoBanner variant="success" title="Upload complete">
            {mockBulkRows.length} rows uploaded.
          </InfoBanner>
        )}

        {status === "empty" && (
          <InfoBanner variant="warning" title="No rows found">
            The file uploaded but contained no data rows. Check the template and try again.
          </InfoBanner>
        )}

        {status === "failed" && (
          <InfoBanner variant="error" title="Upload failed">
            We couldn't read this file. Confirm it matches the downloaded template and try again.
          </InfoBanner>
        )}
      </div>
    </Card>
  );
}
