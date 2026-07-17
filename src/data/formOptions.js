/**
 * formOptions — static dropdown options for Step 1 Details.
 *
 * Content type options: previously differed by request type (e.g.
 * Innovation had "New Item Setup" / "Enhanced Content" / "A+ Content"),
 * which read like request categories or deliverable packages rather than
 * actual content types — confusing copy. Standardized to one simple,
 * flow-independent list: Images / Copy / Video. These are genuine content
 * formats, so the same three apply regardless of request type (VizID
 * Change, Brand Request, or Innovation). "Product data" was briefly
 * included as a fourth option and then removed per product feedback — not
 * a real content type for this list.
 *
 * Note: this required new option values (images/copy/video), not just
 * relabeled ones — the old values (enhanced_content, a_plus,
 * lifestyle_images, brand_store, new_item_setup) don't correspond 1:1 to
 * the new copy, so a label-only change wasn't possible here. Bulk CSV is
 * unaffected: its contentType is a free-text CSV column, never looked up
 * against this list (see BulkReviewStep / ImportCsvStep).
 */
const CONTENT_TYPE_OPTIONS = [
  { value: "images", label: "Images" },
  { value: "copy", label: "Copy" },
  { value: "video", label: "Video" },
];

export const CONTENT_TYPE_OPTIONS_BY_FLOW = {
  vizId: CONTENT_TYPE_OPTIONS,
  brandRequest: CONTENT_TYPE_OPTIONS,
  innovation: CONTENT_TYPE_OPTIONS,
};

export const mockAssignees = [
  { value: "priya.nair", label: "Priya Nair" },
  { value: "diego.alvarez", label: "Diego Alvarez" },
  { value: "mariana.perez", label: "Mariana Perez" },
  { value: "jordan.lee", label: "Jordan Lee" },
];

// Display label only — the enum value stays "vizId" everywhere in code
// (createRequest/createBulkRow/STEPS_BY_TYPE/etc.); only this label changed
// from "Viz ID Change" to "VizID Change" for copy consistency.
export const REQUEST_TYPE_LABELS = {
  vizId: "VizID Change",
  brandRequest: "Brand Request",
  innovation: "Innovation",
};

export const DATE_FIELD_LABEL_BY_FLOW = {
  vizId: "Default Launch Date",
  brandRequest: "Due/Launch Date",
  innovation: "Default On Sale Date",
};
