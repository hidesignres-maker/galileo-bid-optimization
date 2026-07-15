import { useState } from "react";
import { UploadDropzone } from "./ui/UploadDropzone";
import { Card } from "./ui/Card";
import { InfoBanner } from "./ui/InfoBanner";
import { mockBulkRows } from "../data/mockBulkRows";

/**
 * CsvUploadStep — Bulk CSV's step 2. No real parsing: any file picked
 * simulates the fixed `mockBulkRows` result after a short delay, standing
 * in for "upload succeeded, N rows parsed." A mocked "empty upload" /
 * "upload failed" state is also available for demoing those cases.
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
    <Card title="Upload Template">
      <div className="flex flex-col gap-4">
        {status === "idle" && (
          <>
            <UploadDropzone
              label="Drag & drop your filled-in CSV, or click to browse"
              hint="No real parsing in this prototype — any file simulates a successful upload."
              onFileSelected={() => simulate("success")}
            />
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
