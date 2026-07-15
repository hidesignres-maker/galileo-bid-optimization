import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { RequestTypeSelector } from "./RequestTypeSelector";
import { Card } from "./ui/Card";
import { InfoBanner } from "./ui/InfoBanner";

const TEMPLATE_COLUMNS = {
  vizId: ["Title", "Description", "Launch_Date", "Content_Type", "Retailer"],
  brandRequest: ["Title", "Description", "Due_Launch_Date", "Content_Type", "Retailer"],
  innovation: [
    "Title",
    "Description",
    "UPC",
    "Retailer",
    "Customer_ID",
    "Product_Title",
    "Brand",
    "Start_Ship_Date (AMZ only)",
    "On_Sale_Date",
    "eComm_Pack_Details",
  ],
};

function downloadTemplate(requestType) {
  const columns = TEMPLATE_COLUMNS[requestType] ?? TEMPLATE_COLUMNS.vizId;
  const csv = columns.join(",") + "\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${requestType}-request-template.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * CsvTemplateStep — Bulk CSV's step 1. Request type is chosen here, once,
 * up front (see Open Question #2 — not yet confirmed whether type should
 * instead be included per-row). The downloaded file is a real CSV blob
 * (header row only) — no backend, just a client-side Blob download.
 */
export function CsvTemplateStep({ requestType, onRequestTypeChange }) {
  const columns = TEMPLATE_COLUMNS[requestType] ?? TEMPLATE_COLUMNS.vizId;

  return (
    <Card title="Download Template">
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-sm font-semibold text-base-content mb-2">Request Type</h3>
          <RequestTypeSelector value={requestType} onChange={onRequestTypeChange} />
        </div>

        <InfoBanner variant="info">
          Each row in this template becomes one request/task once confirmed — not one product
          inside a single request.
        </InfoBanner>

        <div className="rounded-box border border-base-300 p-4">
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">
            Columns for {requestType}
          </p>
          <p className="text-sm text-base-content/70 font-mono">{columns.join(", ")}</p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm self-start"
          onClick={() => downloadTemplate(requestType)}
        >
          <ArrowDownTrayIcon className="w-4 h-4" /> Download Template
        </button>
      </div>
    </Card>
  );
}
