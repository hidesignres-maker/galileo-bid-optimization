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

/**
 * CONTENT_TYPE_LABELS — value -> label lookup, derived from the same
 * CONTENT_TYPE_OPTIONS list above (no new values invented). Exists for
 * display-only contexts that have a stored value (or array of values) and
 * need the friendly label without importing an options array meant for a
 * <Select> (e.g. the Bulk Review table's Content type column).
 */
export const CONTENT_TYPE_LABELS = Object.fromEntries(CONTENT_TYPE_OPTIONS.map((o) => [o.value, o.label]));

export const mockAssignees = [
  { value: "priya.nair", label: "Priya Nair" },
  { value: "diego.alvarez", label: "Diego Alvarez" },
  { value: "mariana.perez", label: "Mariana Perez" },
  { value: "jordan.lee", label: "Jordan Lee" },
];

/**
 * getAssigneeLabel — the single shared "how do we display an assignee"
 * helper. A request's `assignee` field is always stored as the Select's
 * option *value* (e.g. "priya.nair") when written by the live wizard
 * (create or edit) — matching what ManualDetailsForm's Assignee <Select>
 * needs to pre-select correctly. This helper is for the opposite
 * direction: turning that stored value back into the friendly label
 * ("Priya Nair") everywhere a request's assignee is only ever *displayed*
 * (Queue, Request Detail, Review/Summary bodies) — never for the Select
 * control itself, which still reads/writes the raw value directly.
 *
 * Backward compatible on purpose: also accepts an already-friendly label
 * (in case any request still stores one) and an unrecognized name (in
 * case of a future assignee not yet in mockAssignees) — both are returned
 * as-is rather than blanked out. Nothing here mutates the request; it's a
 * pure display-time lookup, called fresh on every render.
 */
export function getAssigneeLabel(value) {
  if (!value) return "";
  const match = mockAssignees.find((a) => a.value === value || a.label === value);
  return match ? match.label : value;
}

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

/**
 * BULK_TYPE_LABELS — Bulk CSV's own type/template choice (Aug 2026 pass).
 * Presentation/simulation-only concept, NOT part of the `requestType`
 * enum: the model's `requestType` stays exactly `"vizId"|"brandRequest"|
 * "innovation"` everywhere (see lib/models.js). `bulkType` only decides
 * which CSV template downloads and which mock rows a simulated upload
 * returns — "Bulk Brand / Viz ID" intentionally covers both `vizId` and
 * `brandRequest` rows under one template/choice, matching the approved
 * conceptual options (two choices, not three, and no new request types).
 */
export const BULK_TYPE_LABELS = {
  innovation: "Bulk Innovation",
  brandViz: "Bulk Brand / Viz ID",
};
