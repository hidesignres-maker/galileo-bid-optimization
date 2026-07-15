/**
 * csvTemplate — shared source for Bulk CSV's combined column list + the
 * client-side template download. One combined file supports mixed request
 * types per row (see models.js / bulkRowToRequest): request_type is a
 * column IN the file, not a setting chosen before download.
 *
 * Used by ImportCsvStep (Bulk's merged Download + Upload step).
 */
export const COMBINED_TEMPLATE_COLUMNS = [
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
