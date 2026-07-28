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

export function downloadCsvTemplate() {
  const csv = COMBINED_TEMPLATE_COLUMNS.join(",") + "\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bulk-request-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
