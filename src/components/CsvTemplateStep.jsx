import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Card } from "./ui/Card";
import { InfoBanner } from "./ui/InfoBanner";

// One combined template — a Request_Type column plus the union of fields
// across all three request types. Fields that don't apply to a given row's
// type are simply left blank (e.g. an Innovation row's UPC/Customer_ID
// columns are blank on a Viz ID row, and vice versa for Launch_Date vs.
// Due_Date). This is what makes mixed-type uploads possible: one file, one
// column set, a type column per row telling the app how to read the rest.
const COMBINED_TEMPLATE_COLUMNS = [
  "Request_Type", // vizId | brandRequest | innovation — required, per row
  "Title",
  "Description",
  "Content_Type",
  "Retailer",
  "Launch_Date", // Viz ID, Innovation
  "Due_Date", // Brand Request
  "UPC", // Innovation only
  "Customer_ID", // Innovation only
  "Product_Title", // Innovation only
  "Brand", // Innovation only
  "Start_Ship_Date (AMZ only)", // Innovation only
  "eComm_Pack_Details", // Innovation only, when applicable
];

function downloadTemplate() {
  const csv = COMBINED_TEMPLATE_COLUMNS.join(",") + "\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bulk-request-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * CsvTemplateStep — Bulk CSV's step 1.
 *
 * Confirmed product rule: a single upload can mix Viz ID Change, Brand
 * Request, and Innovation rows. There is no upfront "pick a request type"
 * gate here anymore — Request_Type is a column IN the template, decided per
 * row, not a setting for the whole batch. (Previously this step required
 * choosing one type before download; that was wrong and has been removed.)
 */
export function CsvTemplateStep() {
  return (
    <Card title="Download Template">
      <div className="flex flex-col gap-5">
        <InfoBanner variant="info">
          Each row becomes one request/task once confirmed — not one product inside a single
          request. A single file can mix Viz ID Change, Brand Request, and Innovation rows: set
          each row's own <code>Request_Type</code>, and only fill in the columns that apply to
          that row's type.
        </InfoBanner>

        <div className="rounded-box border border-base-300 p-4">
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">
            Template columns
          </p>
          <p className="text-sm text-base-content/70 font-mono">
            {COMBINED_TEMPLATE_COLUMNS.join(", ")}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm self-start"
          onClick={downloadTemplate}
        >
          <ArrowDownTrayIcon className="w-4 h-4" /> Download Template
        </button>
      </div>
    </Card>
  );
}
