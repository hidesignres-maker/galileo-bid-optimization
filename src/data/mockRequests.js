import { createRequest, REQUEST_STATUS } from "../lib/models";
import { mockProducts } from "./mockProducts";

/**
 * mockRequests — seed data for the Content Request Queue and Request
 * Detail (READ MVP). Entirely prototype/mock data — nothing here
 * represents a real PepsiCo record, retailer submission, or actual
 * product; brand/product names are the same fictional stand-ins already
 * used across this prototype (GreenValley Snacks, SunBrew Coffee, Nordic
 * Naturals, Fresh Fields, PureCare), styled after a CPG snacks/beverage
 * portfolio so Request Detail has something realistic-looking to render.
 *
 * Products: Brand/VizID entries below reference the *actual* catalog
 * objects in mockProducts.js (by id) instead of hand-written one-off
 * stubs, so every product already carries the same
 * retailers/ean/upc/brand fields a live wizard selection would produce.
 * This is what removes the Request-Detail-only "UNASSIGNED" retailer
 * fallback — that fallback only ever triggered because these seed
 * products used to omit `retailers` entirely, not because of any bug in
 * groupProductsByRetailer itself.
 *
 * Innovation entries carry a full itemInputs shape (stable `id` per item,
 * plus every field InnovationReviewBody/InnovationItemTable/businessRules
 * already expect) instead of a single sparse row — this also removes a
 * real (if harmless) React key warning that a missing `id` used to cause.
 *
 * Dates are deliberately coherent with both `status` and this prototype's
 * request-level editability rule (lib/editability.js), against a "today"
 * of 2026-07-31:
 *  - REQ-2031 / REQ-2030 / REQ-2101 / REQ-2102 / REQ-2040: future dates,
 *    Editable.
 *  - REQ-2015: dated exactly today — Editable (the rule is inclusive of
 *    today).
 *  - REQ-2028 / REQ-2020: fully in the past, status Completed — Read-only,
 *    the straightforward case (one Innovation, one VizID, so both review
 *    bodies get a real read-only-by-date example).
 *  - REQ-2007: in the past but status is still "Needs Action" — Read-only
 *    despite not being complete. Included deliberately: editability is a
 *    date rule, independent of status, and this is the realistic case
 *    (an overdue request) where that independence actually matters and is
 *    worth being able to demonstrate.
 *
 * Wizard-created requests are untouched by any of this — `createRequest`,
 * `bulkRowToRequest`, and every create/review/queue behavior are exactly
 * as before; only this seed array's own data got richer.
 *
 * `assignee` values are stored as the Assignee <Select>'s option *value*
 * (e.g. "priya.nair"), matching exactly what the live wizard (create or
 * edit) writes — not the friendly label. Every display site (Queue,
 * Request Detail, Review/Summary bodies) turns this back into a friendly
 * label via `getAssigneeLabel` (data/formOptions.js); nothing here stores
 * a display string directly anymore, so an edited request looks identical
 * before and after Save regardless of which form it started in.
 *
 * `contentTypes` values are restricted to the three currently supported
 * values (images/copy/video, see CONTENT_TYPE_OPTIONS_BY_FLOW) — no
 * request here uses the old, pre-standardization values (e.g.
 * "new_item_setup") anymore, so every seed request's Content Type
 * checkboxes show correctly pre-checked in Edit.
 */
const productById = (id) => mockProducts.find((p) => p.id === id);

export const mockRequests = [
  createRequest({
    id: "REQ-2031",
    requestType: "vizId",
    creationMethod: "manual",
    title: "Q3 VizID refresh — GreenValley Snacks",
    description:
      "Remove the outdated 'new item' burst callout from front-of-pack imagery ahead of the Walmart planogram reset.",
    status: REQUEST_STATUS.IN_PROGRESS,
    assignee: "priya.nair",
    dueDate: "2026-08-14",
    launchDate: "2026-08-14",
    contentTypes: ["images"],
    retailers: ["WMT", "TGT", "KR"],
    products: [productById("P-1001"), productById("P-1002")],
    contentRequirements: {
      files: [
        { id: "file-2031-1", name: "GreenValley_TrailMix_FOP_current.png", mimeType: "image/png", sizeLabel: "1.4 MB" },
        { id: "file-2031-2", name: "GreenValley_TrailMix_FOP_updated.png", mimeType: "image/png", sizeLabel: "1.6 MB" },
      ],
      referenceLink: "https://brandhub.example.com/greenvalley/vizid-2031-brief",
      notes: "Retailer reset date is firm — please prioritize the Walmart-facing crop first, Target/Kroger can follow.",
      referenceLinks: "",
      assetLinks: "",
      contentNotes: "",
    },
  }),
  createRequest({
    id: "REQ-2030",
    requestType: "brandRequest",
    creationMethod: "manual",
    title: "PureCare relaunch — enhanced content",
    description: "Full enhanced content refresh ahead of the Target relaunch, including new lifestyle imagery.",
    status: REQUEST_STATUS.NEEDS_ACTION,
    assignee: "diego.alvarez",
    dueDate: "2026-08-25",
    launchDate: "2026-08-25",
    contentTypes: ["images", "copy"],
    retailers: ["TGT", "AMZ", "KR"],
    products: [productById("P-1008"), productById("P-1009")],
    contentRequirements: {
      files: [],
      referenceLink: "https://brandhub.example.com/purecare/relaunch-2030",
      notes: "",
      referenceLinks: "",
      assetLinks: "",
      contentNotes: "",
    },
  }),
  createRequest({
    id: "REQ-2028",
    requestType: "innovation",
    creationMethod: "manual",
    title: "Fresh Fields Sparkling Yerba Mate launch",
    description: "New item setup for the Sparkling Yerba Mate 12-pack across launch retailers.",
    status: REQUEST_STATUS.COMPLETED,
    assignee: "mariana.perez",
    dueDate: "2026-06-15",
    launchDate: "2026-06-15",
    contentTypes: ["images"],
    retailers: ["AMZ", "WMT", "ICART"],
    itemInputs: [
      {
        id: "ITEM-2028-1",
        upc: "610000112201",
        retailer: "AMZ",
        customerId: "CID-30441",
        productTitle: "Fresh Fields Sparkling Yerba Mate, 12-pack",
        brand: "Fresh Fields",
        startShipDate: "2026-06-01",
        onSaleDate: "2026-06-15",
        ecommPackDetails: "Case pack of 12, enhanced A+ content ready.",
      },
      {
        id: "ITEM-2028-2",
        upc: "610000112218",
        retailer: "WMT",
        customerId: "CID-30442",
        productTitle: "Fresh Fields Sparkling Yerba Mate, 12-pack",
        brand: "Fresh Fields",
        startShipDate: "",
        onSaleDate: "2026-06-15",
        ecommPackDetails: "",
      },
      {
        id: "ITEM-2028-3",
        upc: "610000112225",
        retailer: "ICART",
        customerId: "CID-30443",
        productTitle: "Fresh Fields Sparkling Yerba Mate, 12-pack",
        brand: "Fresh Fields",
        startShipDate: "",
        onSaleDate: "2026-06-18",
        ecommPackDetails: "",
      },
    ],
    contentRequirements: {
      files: [],
      referenceLink: "",
      notes: "Launch completed on schedule across all three retailers. No further action needed.",
      referenceLinks: "",
      assetLinks: "",
      contentNotes: "",
    },
  }),
  createRequest({
    id: "REQ-2101",
    requestType: "vizId",
    creationMethod: "bulkCsv",
    title: "SunBrew Coffee — Q4 VizID batch (Kroger)",
    description: "",
    status: REQUEST_STATUS.NEEDS_ACTION,
    assignee: "",
    dueDate: "2026-10-05",
    launchDate: "2026-10-05",
    contentTypes: ["images"],
    retailers: ["KR"],
    products: [],
    // Bulk CSV READ-view fixture (Decision B, Aug 2026 pass): a small,
    // clearly fictional item, added so the item-centered Bulk CSV Request
    // Detail (BulkCsvReviewBody) has real data to demonstrate — every field
    // here already exists on the itemInputs shape (see
    // createBulkRow/bulkRowToRequest in lib/models.js), nothing new was
    // added to the model. REQ-2102 below is deliberately left without an
    // item, to also exercise the empty-state path.
    itemInputs: [
      {
        id: "ITEM-2101-1",
        upc: "611234455667",
        retailer: "KR",
        customerId: "CID-30601",
        productTitle: "SunBrew Coffee Cold Brew Concentrate, Kroger Exclusive 32oz",
        brand: "SunBrew Coffee",
        startShipDate: "2026-09-20",
        onSaleDate: "2026-10-05",
        ecommPackDetails: "Single unit, front-of-pack VizID update pending Kroger creative review.",
      },
    ],
    isPlaceholder: true,
    sourceBatchId: "BATCH-9001",
  }),
  createRequest({
    id: "REQ-2102",
    requestType: "vizId",
    creationMethod: "bulkCsv",
    title: "SunBrew Coffee — Q4 VizID batch (Target)",
    description: "",
    status: REQUEST_STATUS.NEEDS_ACTION,
    assignee: "",
    dueDate: "2026-10-12",
    launchDate: "2026-10-12",
    contentTypes: ["images"],
    retailers: ["TGT"],
    products: [],
    isPlaceholder: true,
    sourceBatchId: "BATCH-9001",
  }),
  createRequest({
    id: "REQ-2015",
    requestType: "brandRequest",
    creationMethod: "manual",
    title: "Nordic Naturals — A+ content update",
    description: "Refresh A+ content module 3 with new lifestyle imagery.",
    status: REQUEST_STATUS.NEEDS_ACTION,
    assignee: "jordan.lee",
    dueDate: "2026-07-31",
    launchDate: "2026-07-31",
    contentTypes: ["images", "video"],
    retailers: ["AMZ"],
    products: [productById("P-1003")],
  }),
  createRequest({
    id: "REQ-2020",
    requestType: "vizId",
    creationMethod: "manual",
    title: "Nordic Naturals Kids DHA Gummies — VizID refresh",
    description: "Swap front-of-pack callout to reflect the new allergen statement.",
    status: REQUEST_STATUS.COMPLETED,
    assignee: "diego.alvarez",
    dueDate: "2026-05-10",
    launchDate: "2026-05-10",
    contentTypes: ["images"],
    retailers: ["AMZ", "WMT", "ICART"],
    products: [productById("P-1004")],
    contentRequirements: {
      files: [
        { id: "file-2020-1", name: "NordicNaturals_KidsDHA_FOP_final.png", mimeType: "image/png", sizeLabel: "980 KB" },
      ],
      referenceLink: "",
      notes: "Completed and live across all three retailers as of May.",
      referenceLinks: "",
      assetLinks: "",
      contentNotes: "",
    },
  }),
  createRequest({
    id: "REQ-2007",
    requestType: "vizId",
    creationMethod: "manual",
    title: "GreenValley Sea Salt Almonds — planogram VizID",
    description: "Update pack callouts ahead of the Sam's Club / Costco planogram reset. Overdue — reset already ran.",
    status: REQUEST_STATUS.NEEDS_ACTION,
    assignee: "priya.nair",
    dueDate: "2026-06-30",
    launchDate: "2026-06-30",
    contentTypes: ["images"],
    retailers: ["SAMS", "CSCO", "WMT"],
    products: [productById("P-1010")],
    contentRequirements: {
      files: [],
      referenceLink: "",
      notes: "Reset date has passed — flagging for reassignment or closure.",
      referenceLinks: "",
      assetLinks: "",
      contentNotes: "",
    },
  }),
  createRequest({
    id: "REQ-2040",
    requestType: "innovation",
    creationMethod: "manual",
    title: "SunBrew Espresso Roast — multi-retailer new item setup",
    description: "New item setup for SunBrew Espresso Roast Whole Bean ahead of the fall cold-brew season launch.",
    status: REQUEST_STATUS.IN_PROGRESS,
    assignee: "jordan.lee",
    dueDate: "2026-09-05",
    launchDate: "2026-09-05",
    contentTypes: ["images"],
    retailers: ["AMZ", "WMT", "CSCO"],
    itemInputs: [
      {
        id: "ITEM-2040-1",
        upc: "852001234574",
        retailer: "AMZ",
        customerId: "CID-30501",
        productTitle: "SunBrew Espresso Roast Whole Bean, 2lb",
        brand: "SunBrew Coffee",
        startShipDate: "2026-08-20",
        onSaleDate: "2026-09-05",
        ecommPackDetails: "Single unit, enhanced A+ imagery in progress.",
      },
      {
        id: "ITEM-2040-2",
        upc: "852001234581",
        retailer: "WMT",
        customerId: "CID-30502",
        productTitle: "SunBrew Espresso Roast Whole Bean, 2lb, Club Pack",
        brand: "SunBrew Coffee",
        startShipDate: "",
        onSaleDate: "2026-09-08",
        ecommPackDetails: "2-count club pack.",
      },
      {
        id: "ITEM-2040-3",
        upc: "852001234598",
        retailer: "CSCO",
        customerId: "CID-30503",
        productTitle: "SunBrew Espresso Roast Whole Bean, 2lb, Warehouse Pack",
        brand: "SunBrew Coffee",
        startShipDate: "",
        onSaleDate: "2026-09-10",
        ecommPackDetails: "",
      },
    ],
    contentRequirements: {
      files: [],
      referenceLink: "https://brandhub.example.com/sunbrew/espresso-launch-2040",
      notes: "AMZ start ship date is the critical path — confirm with logistics before finalizing the other two retailers.",
      referenceLinks: "",
      assetLinks: "",
      contentNotes: "",
    },
  }),
];
