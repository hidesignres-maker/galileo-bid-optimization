/**
 * csvTemplate — shared source for Bulk CSV's combined column list + the
 * client-side template download. One combined file supports mixed request
 * types per row (see models.js / bulkRowToRequest): request_type is a
 * column IN the file, not a setting chosen before download.
 *
 * Used by ImportCsvStep (Bulk's merged Download + Upload step).
 *
 * Open assumption: this column list / which fields are actually required
 * per request type is NOT final — still pending product confirmation. Do
 * not treat this as a locked spec.
 *
 * Business rule — supporting content in Bulk: for Bulk CSV, supporting
 * content is captured per row as links/notes (reference_links, asset_links,
 * content_notes below). Global file upload is intentionally avoided because
 * each row creates a separate request — a single batch-level upload area
 * would be ambiguous (unclear whether a file applies to all rows, one row,
 * or several). Actual file attachments can be added later in the request
 * detail view, once each row's request already exists.
 */
export const COMBINED_TEMPLATE_COLUMNS = [
  "request_type", // vizId | brandRequest | innovation — required, per row
  "title",
  "description",
  "retailer",
  "launch_date", // VizID, Innovation
  "due_date", // Brand Request
  "content_type",
  "upc", // Innovation only
  "customer_id", // Innovation only
  "product_title", // Innovation only
  "brand", // Innovation only
  "start_ship_date", // Innovation only, required when retailer is AMZ
  "on_sale_date", // Innovation only
  "ecomm_pack_details", // Innovation only, when applicable
  "reference_links", // optional — links to reference material for this row
  "asset_links", // optional — links to already-hosted assets for this row
  "content_notes", // optional — free-text notes on supporting content
];

/**
 * Per-bulk-type template column subsets (Aug 2026 pass — Bulk type/
 * template selection). Derived entirely from COMBINED_TEMPLATE_COLUMNS'
 * own existing inline comments above (which columns are already marked
 * "Innovation only" vs "Brand Request") — no new columns invented, no
 * third template. "Bulk Brand / Viz ID" keeps both `launch_date` (VizID)
 * and `due_date` (Brand Request) since that one template still supports
 * either sub-type per row via `request_type`, exactly like the combined
 * template already does — only the Innovation-only product columns are
 * dropped for it. "Bulk Innovation" drops the one Brand-Request-only
 * column (`due_date`) it never uses.
 */
const INNOVATION_ONLY_COLUMNS = [
  "upc",
  "customer_id",
  "product_title",
  "brand",
  "start_ship_date",
  "on_sale_date",
  "ecomm_pack_details",
];
const BRAND_REQUEST_ONLY_COLUMNS = ["due_date"];

export const TEMPLATE_COLUMNS_BY_BULK_TYPE = {
  innovation: COMBINED_TEMPLATE_COLUMNS.filter((c) => !BRAND_REQUEST_ONLY_COLUMNS.includes(c)),
  brandViz: COMBINED_TEMPLATE_COLUMNS.filter((c) => !INNOVATION_ONLY_COLUMNS.includes(c)),
};

const TEMPLATE_FILENAME_BY_BULK_TYPE = {
  innovation: "bulk-innovation-template.csv",
  brandViz: "bulk-brand-vizid-template.csv",
};

/**
 * downloadCsvTemplate(bulkType) — `bulkType` optional for backward
 * compatibility: omitted (or unrecognized), falls back to the full
 * combined template exactly as before this pass.
 */
export function downloadCsvTemplate(bulkType) {
  const columns = TEMPLATE_COLUMNS_BY_BULK_TYPE[bulkType] ?? COMBINED_TEMPLATE_COLUMNS;
  const filename = TEMPLATE_FILENAME_BY_BULK_TYPE[bulkType] ?? "bulk-request-template.csv";
  const csv = columns.join(",") + "\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
