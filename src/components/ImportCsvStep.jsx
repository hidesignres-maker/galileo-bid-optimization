import { useMemo, useState } from "react";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { InfoBanner } from "./ui/InfoBanner";
import { UploadDropzone } from "./ui/UploadDropzone";
import { Table } from "./ui/Table";
import { mockBulkRows } from "../data/mockBulkRows";
import { mockRetailers } from "../data/mockRetailers";
import { REQUEST_TYPE_LABELS } from "../data/formOptions";
import { fmtDate } from "../lib/format";
import { COMBINED_TEMPLATE_COLUMNS, downloadCsvTemplate } from "../lib/csvTemplate";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

/**
 * ImportCsvStep — Bulk CSV's merged "Import CSV" step. Replaces what used
 * to be two separate stepper steps (Download Template, Upload Template) —
 * per stakeholder feedback, they belong in one card, matching the
 * reference internal-app pattern: download action + required columns +
 * upload control all together, and once upload succeeds, the SAME card
 * grows an "Imported requests" section in place (summary banner, search,
 * "Upload another file", and a row table) rather than navigating away.
 *
 * A separate Review step still follows (kept per product decision) for a
 * fuller checkpoint before Confirm — this inline table is a quick,
 * immediate confirmation right after upload, not a replacement for Review.
 *
 * `rows` is owned by the parent (BulkCsvWizard), passed in as a prop, so
 * this component stays in sync with the single source of truth rather than
 * tracking its own copy.
 */
export function ImportCsvStep({ rows, onUploadComplete, onReset }) {
  const [status, setStatus] = useState("idle"); // idle | processing | empty | failed
  const [query, setQuery] = useState("");

  const simulate = (outcome) => {
    setStatus("processing");
    setTimeout(() => {
      if (outcome === "success") {
        setStatus("idle");
        onUploadComplete(mockBulkRows);
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
    setQuery("");
    onReset();
  };

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const haystack = [
        row.title,
        row.productTitle,
        row.brand,
        row.upc,
        row.retailer,
        retailerLabel(row.retailer),
        REQUEST_TYPE_LABELS[row.requestType],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  const readyCount = rows.filter((r) => r.willCreateRequest && r.status !== "issue").length;
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
          onClick={downloadCsvTemplate}
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
              {COMBINED_TEMPLATE_COLUMNS.map((col) => (
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
            <UploadDropzone onFileSelected={() => simulate("success")} />
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
          <div className="flex flex-col gap-4 border-t border-base-300 pt-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-sm font-bold text-base-content">Imported requests</h3>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Rows imported from CSV. Review and fix any rows that need attention.
                </p>
              </div>
              <div className="rounded-box bg-success/10 border border-success/30 px-4 py-2.5 flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-success shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-success">CSV import summary</p>
                  <p className="text-xs text-success/80">
                    {rows.length} row{rows.length === 1 ? "" : "s"} uploaded · {readyCount} ready to
                    create
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <MagnifyingGlassIcon className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className="input input-bordered input-sm w-full pl-9"
                  placeholder="Search by title, brand, UPC, or retailer"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={ArrowUpTrayIcon}
                iconPosition="leading"
                onClick={handleReset}
              >
                Upload another file
              </Button>
            </div>

            <Table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Request Type</th>
                  <th>Title</th>
                  <th>Retailer</th>
                  <th>Date</th>
                  <th>Content Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const displayTitle = row.title || row.productTitle || "Untitled request";
                  return (
                    <tr key={row.id} className={row.status === "issue" ? "bg-error/5" : ""}>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            row.status === "issue" ? "badge-error" : "badge-success"
                          }`}
                        >
                          {row.status === "issue" ? "Issue" : "Ready"}
                        </span>
                      </td>
                      <td className="text-base-content/70">
                        {REQUEST_TYPE_LABELS[row.requestType] ?? row.requestType}
                      </td>
                      <td className="text-base-content">{displayTitle}</td>
                      <td className="text-base-content/70">
                        {row.retailer ? retailerLabel(row.retailer) : "—"}
                      </td>
                      <td className="text-base-content/70">
                        {fmtDate(row.requestType === "brandRequest" ? row.dueDate : row.launchDate)}
                      </td>
                      <td className="text-base-content/70">{row.contentType ?? "—"}</td>
                    </tr>
                  );
                })}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-sm text-base-content/50 py-6">
                      No rows match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            <p className="text-xs text-base-content/40">Last updated: Now</p>
          </div>
        )}
      </div>
    </Card>
  );
}
