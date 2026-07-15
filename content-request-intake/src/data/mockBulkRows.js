import { createBulkRow } from "../lib/models";

/**
 * mockBulkRows — simulates what a "Viz ID Q4 planning calendar" CSV upload
 * would look like once parsed. No real CSV parsing happens anywhere — this
 * fixed array stands in for the parsed result after CsvUploadStep.
 *
 * Each row becomes ONE future request/task (per the corrected model), shown
 * in BulkReviewStep as a request preview, not a product row.
 */
export const mockBulkRows = [
  createBulkRow({
    title: "SunBrew Coffee — Viz ID refresh (Kroger)",
    description: "Planned Q4 packaging callout removal.",
    requestType: "vizId",
    launchDate: "2026-10-05",
    contentType: "images",
    retailer: "KR",
    status: "ready",
  }),
  createBulkRow({
    title: "SunBrew Coffee — Viz ID refresh (Target)",
    description: "Planned Q4 packaging callout removal.",
    requestType: "vizId",
    launchDate: "2026-10-12",
    contentType: "images",
    retailer: "TGT",
    status: "ready",
  }),
  createBulkRow({
    title: "GreenValley Snacks — Viz ID refresh (Walmart)",
    description: "New nutrition panel callout.",
    requestType: "vizId",
    launchDate: "2026-10-19",
    contentType: "images",
    retailer: "WMT",
    status: "ready",
  }),
  createBulkRow({
    title: "GreenValley Snacks — Viz ID refresh (Costco)",
    description: "New nutrition panel callout.",
    requestType: "vizId",
    launchDate: "2026-10-19",
    contentType: "images",
    retailer: "CSCO",
    status: "ready",
  }),
  createBulkRow({
    title: "PureCare — Viz ID refresh (missing retailer)",
    description: "Row missing a recognized retailer code.",
    requestType: "vizId",
    launchDate: "2026-10-26",
    contentType: "images",
    retailer: null,
    status: "issue",
  }),
  createBulkRow({
    title: "Fresh Fields — Viz ID refresh (Instacart)",
    description: "Cold-pressed juice line callout update.",
    requestType: "vizId",
    launchDate: "2026-11-02",
    contentType: "copy",
    retailer: "ICART",
    status: "ready",
  }),
];
