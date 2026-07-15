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
 *
 * Confirmed product rule: each row carries its OWN requestType. A single
 * Bulk CSV upload can mix Viz ID Change, Brand Request, and Innovation rows
 * — do not assume one upload = one request type. `requestType` here is the
 * source of truth per row; there is no batch-level request type.
 *
 * `willCreateRequest` exists so a later "group rows into one request" option
 * (Open Question #1) can flip specific rows off without changing the shape.
 *
 * Both `launchDate` and `dueDate` exist because different request types use
 * different date semantics (Viz ID/Innovation lean on launchDate, Brand
 * Request on a due/launch date) — a row only needs to populate the one that
 * applies to its own requestType.
 *
 * upc/customerId/productTitle/brand/startShipDate/onSaleDate/ecommPackDetails
 * only apply to Innovation rows (mirrors the combined CSV template, where
 * these columns are simply left blank for Viz ID / Brand Request rows).
 *
 * `issueReason` is set when status is "issue", so Review can explain why a
 * row needs attention instead of just flagging it.
 */
export function createBulkRow(partial = {}) {
  return {
    id: nextId("ROW"),
    requestType: "vizId", // "vizId" | "brandRequest" | "innovation" — per row
    title: "",
    description: "",
    launchDate: null,
    dueDate: null,
    contentType: null,
    retailer: null,
    // Innovation-only fields (blank for Viz ID / Brand Request rows):
    upc: null,
    customerId: null,
    productTitle: null,
    brand: null,
    startShipDate: null,
    onSaleDate: null,
    ecommPackDetails: null,
    status: "ready", // "ready" | "issue"
    issueReason: null,
    willCreateRequest: true,
    ...partial,
  };
}

/**
 * BulkBatch — the upload event that produced a set of BulkRows / Requests.
 * No single `requestType` here on purpose — a batch can (and typically
 * will) contain mixed request types across its rows. Use
 * `distinctRequestTypes(rows)` below when a summary is needed.
 */
export function createBulkBatch(partial = {}) {
  return {
    id: nextId("BATCH"),
    templateName: "bulk-request-template.csv",
    uploadedAt: new Date().toISOString().slice(0, 10),
    rowCount: 0,
    createdRequestCount: 0,
    status: BULK_BATCH_STATUS.UPLOADED,
    rows: [],
    ...partial,
  };
}

/** Distinct request types present across a set of rows, for summary copy. */
export function distinctRequestTypes(rows) {
  return Array.from(new Set(rows.map((r) => r.requestType).filter(Boolean)));
}

/** Very simple "due this period" check — current calendar month. */
export function isDueThisPeriod(dateStr, today = new Date()) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
}

/**
 * Best available "Due / Launch" date for a Request, for display in the
 * Queue table. Manually-created Innovation requests never populate
 * dueDate/launchDate at the request level (those dates live per item, in
 * itemInputs[].onSaleDate — see ManualRequestWizard.handleCreateRequest),
 * which previously left the Queue's Due/Launch column blank for them.
 *
 * Order: request.dueDate → request.launchDate → earliest
 * itemInputs[].onSaleDate → null. ISO date strings (YYYY-MM-DD) sort
 * correctly as plain strings, so no Date parsing is needed to find the
 * earliest one.
 */
export function getRequestDisplayDate(request) {
  if (request.dueDate) return request.dueDate;
  if (request.launchDate) return request.launchDate;
  const onSaleDates = (request.itemInputs ?? [])
    .map((item) => item.onSaleDate)
    .filter(Boolean)
    .sort();
  return onSaleDates[0] ?? null;
}

/**
 * Convert one BulkRow + its batch into a real placeholder Request.
 * Placeholder because assignee/assets/etc. are expected to be filled in
 * later, closer to the work date (see Bulk purpose in the product spec).
 *
 * Viz ID rows create Viz ID requests, Brand Request rows create Brand
 * Request requests, Innovation rows create Innovation requests — driven
 * entirely by row.requestType, never assumed from the batch.
 */
export function bulkRowToRequest(row, batchId) {
  const isInnovation = row.requestType === "innovation";
  const displayTitle = row.title || row.productTitle || "Untitled request";

  return createRequest({
    requestType: row.requestType,
    creationMethod: "bulkCsv",
    title: displayTitle,
    description: row.description,
    launchDate: row.launchDate,
    dueDate: row.dueDate ?? row.launchDate,
    contentTypes: row.contentType ? [row.contentType] : [],
    retailers: row.retailer ? [row.retailer] : [],
    itemInputs:
      isInnovation && row.upc
        ? [
            {
              upc: row.upc,
              retailer: row.retailer,
              customerId: row.customerId ?? "",
              productTitle: row.productTitle || displayTitle,
              brand: row.brand ?? "",
              startShipDate: row.startShipDate ?? "",
              onSaleDate: row.onSaleDate ?? row.launchDate ?? "",
              ecommPackDetails: row.ecommPackDetails ?? "",
            },
          ]
        : [],
    status: REQUEST_STATUS.NEEDS_ACTION,
    isPlaceholder: true,
    sourceBatchId: batchId,
  });
}
