import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Card } from "./ui/Card";
import { InfoBanner } from "./ui/InfoBanner";

// One combined template — a request_type column plus the union of fields
// across all three request types. Fields that don't apply to a given row's
// type are simply left blank (e.g. an Innovation row's upc/customer_id
// columns are blank on a Viz ID row, and vice versa for launch_date vs.
// due_date). This is what makes mixed-type uploads possible: one file, one
// column set, a type column per row telling the app how to read the rest.
const COMBINED_TEMPLATE_COLUMNS = [
  "request_type", // vizId | brandRequest | innovation — required, per row
  "title",
  "description",
  "retailer",
  "launch_date", // Viz ID, Innovation
  "due_date", // Brand Request
  "content_type",
  "upc", // Innovation only
  "customer_id", // Innovation only
  "product_title", // Innovation only
  "brand", // Innovation only
  "start_ship_date", // Innovation only, required when retailer is AMZ
  "on_sale_date", // Innovation only
  "ecomm_pack_details", // Innovation only, when applicable
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
 * gate here anymore — request_type is a column IN the template, decided per
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
          each row's own <code>request_type</code>, and only fill in the columns that apply to
          that row's type.
        </InfoBanner>

        <div className="rounded-box border border-base-300 p-4">
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">
            Template columns
          </p>
          <p className="text-sm text-base-content/70 font-mono">
            {COMBINED_TEMPLATE_COLUMNS.join(", ")}
          </p>
          <p className="text-xs text-base-content/50 mt-2">
            Viz ID / Brand Request rows use title, description, retailer, launch_date or
            due_date, content_type. Innovation rows also use upc, customer_id, product_title,
            brand, start_ship_date (required for Amazon), on_sale_date, ecomm_pack_details.
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
