/**
 * models.js — corrected data model.
 *
 * Manual creates exactly ONE Request. Bulk CSV creates MANY Requests (one
 * per row) grouped under a BulkBatch. A Request never "contains" many
 * products/items as separate sub-requests — `products` / `itemInputs` are
 * just the request's own line-level detail (e.g. one Innovation request can
 * list several new SKUs; that's still one request/task).
 */

let seq = 1000;
export function nextId(prefix) {
  seq += 1;
  return `${prefix}-${seq}`;
}

export const REQUEST_STATUS = {
  NEEDS_ACTION: "needs_action",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  DRAFT: "draft",
};

export const BULK_BATCH_STATUS = {
  UPLOADED: "uploaded",
  CONFIRMED: "confirmed",
  FAILED: "failed",
};

/**
 * Request — the unit the queue/calendar works with. One row = one task,
 * whether it came from the manual wizard or a bulk CSV row.
 */
export function createRequest(partial = {}) {
  return {
    id: nextId("REQ"),
    requestType: "vizId", // "vizId" | "brandRequest" | "innovation"
    creationMethod: "manual", // "manual" | "bulkCsv"
    title: "",
    description: "",
    status: REQUEST_STATUS.NEEDS_ACTION,
    assignee: "",
    dueDate: null,
    launchDate: null,
    contentTypes: [],
    retailers: [],
    products: [],
    itemInputs: [],
    assets: [],
    isPlaceholder: false,
    sourceBatchId: null,
    createdAt: new Date().toISOString().slice(0, 10),
    ...partial,
  };
}

/**
 * BulkRow — one CSV row, reviewed as a future request/task (not a product).
 * `willCreateRequest` exists so a later "group rows into one request" option
 * (Open Question #1) can flip specific rows off without changing the shape.
 */
export function createBulkRow(partial = {}) {
  return {
    id: nextId("ROW"),
    title: "",
    description: "",
    requestType: "vizId",
    launchDate: null,
    contentType: null,
    retailer: null,
    status: "ready", // "ready" | "issue"
    willCreateRequest: true,
    ...partial,
  };
}

/**
 * BulkBatch — the upload event that produced a set of BulkRows / Requests.
 */
export function createBulkBatch(partial = {}) {
  return {
    id: nextId("BATCH"),
    requestType: "vizId",
    templateName: "",
    uploadedAt: new Date().toISOString().slice(0, 10),
    rowCount: 0,
    createdRequestCount: 0,
    status: BULK_BATCH_STATUS.UPLOADED,
    rows: [],
    ...partial,
  };
}

/** Very simple "due this period" check — current calendar month. */
export function isDueThisPeriod(dateStr, today = new Date()) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
}

/**
 * Convert one BulkRow + its batch into a real placeholder Request.
 * Placeholder because assignee/assets/etc. are expected to be filled in
 * later, closer to the work date (see Bulk purpose in the product spec).
 */
export function bulkRowToRequest(row, batchId) {
  return createRequest({
    requestType: row.requestType,
    creationMethod: "bulkCsv",
    title: row.title,
    description: row.description,
    launchDate: row.launchDate,
    dueDate: row.launchDate,
    contentTypes: row.contentType ? [row.contentType] : [],
    retailers: row.retailer ? [row.retailer] : [],
    status: REQUEST_STATUS.NEEDS_ACTION,
    isPlaceholder: true,
    sourceBatchId: batchId,
  });
}
