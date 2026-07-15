import { createBulkRow } from "../lib/models";

/**
 * mockBulkRows — simulates what a mixed-type "Q4 planning calendar" CSV
 * upload would look like once parsed. No real CSV parsing happens anywhere
 * — this fixed array stands in for the parsed result after CsvUploadStep.
 *
 * Confirmed product rule: a single upload can mix Viz ID Change, Brand
 * Request, and Innovation rows — each row carries its own requestType.
 * This mock deliberately includes all three so Review/Confirm demonstrate
 * mixed-type handling, not a single-type batch.
 *
 * Each row becomes ONE future request/task, shown in BulkReviewStep as a
 * request preview, not a product row.
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
    title: "PureCare — Brand Request enhanced content (Amazon)",
    description: "A+ content refresh ahead of Q4 relaunch.",
    requestType: "brandRequest",
    dueDate: "2026-10-15",
    contentType: "copy",
    retailer: "AMZ",
    status: "ready",
  }),
  createBulkRow({
    title: "Nordic Naturals — Brand Request content update",
    description: "Row missing a recognized retailer code.",
    requestType: "brandRequest",
    dueDate: "2026-10-22",
    contentType: "images",
    retailer: null,
    status: "issue",
    issueReason: "Missing retailer code",
  }),
  createBulkRow({
    title: "Fresh Fields — new eComm pack setup (Instacart)",
    description: "New SKU placeholder for Q4 launch calendar.",
    requestType: "innovation",
    launchDate: "2026-11-02",
    contentType: "new_item_setup",
    retailer: "ICART",
    upc: "610000114402",
    customerId: "CUST-88301",
    productTitle: "Sparkling Yerba Mate, 12-pack",
    brand: "Fresh Fields",
    onSaleDate: "2026-11-02",
    ecommPackDetails: "New pack graphics, ingredient callout front panel",
    status: "ready",
  }),
  createBulkRow({
    title: "GreenValley Snacks — new eComm pack setup (Amazon)",
    description: "New SKU placeholder for Q4 launch calendar. Amazon requires Start Ship Date.",
    requestType: "innovation",
    launchDate: "2026-11-09",
    contentType: "new_item_setup",
    retailer: "AMZ",
    upc: "041220013001",
    customerId: "CUST-88302",
    productTitle: "Protein Granola Clusters, 14oz",
    brand: "GreenValley Snacks",
    startShipDate: "2026-11-02",
    onSaleDate: "2026-11-09",
    ecommPackDetails: "Updated nutrition panel",
    status: "ready",
  }),
];
