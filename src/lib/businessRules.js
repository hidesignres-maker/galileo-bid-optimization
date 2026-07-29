/**
 * businessRules — single home for scenario-specific requirements that are
 * NOT a component concern (i.e. "when is field X required, given flow Y and
 * retailer Z"). Keeping these as named, testable functions — rather than
 * inline `retailer === "AMZ"` checks scattered across components — means
 * any future scenario rule (a new retailer-specific requirement, a new
 * flow-specific default, etc.) has one place to be added and reviewed.
 *
 * Note: the AMZ Start Ship Date rule below is a resolved implementation
 * default, not an open question — but it's still worth a quick confirm
 * with product if it comes up again.
 */

/**
 * Innovation's Details & Item Inputs step (InnovationItemInputForm) +
 * Review step (RequestSummaryCard): Start Ship Date is only required when
 * the retailer is Amazon (AMZ). This is an implementation default, not a
 * confirmed product decision — flagged for review.
 */
export function isStartShipDateRequired(retailerCode) {
  return retailerCode === "AMZ";
}

/**
 * Innovation item-input row required fields (always required, regardless
 * of retailer). Start Ship Date is intentionally excluded here — see
 * isStartShipDateRequired above.
 */
export const ALWAYS_REQUIRED_ITEM_FIELDS = [
  "upc",
  "retailer",
  "customerId",
  "productTitle",
  "brand",
  "onSaleDate",
];

/**
 * Whether a single Innovation item-input row currently satisfies all
 * required fields (including the conditional Start Ship Date rule above).
 */
export function isItemRowValid(row) {
  const missingRequired = ALWAYS_REQUIRED_ITEM_FIELDS.some((field) => !row[field]);
  const missingShipDate = isStartShipDateRequired(row.retailer) && !row.startShipDate;
  return !missingRequired && !missingShipDate;
}

/**
 * Details step required fields — shared across all three manual flows.
 * Assignee is optional per the corrected spec (can be filled in later).
 * `requireDate` is false for Innovation, since its dates are captured per
 * item in InnovationItemInputForm instead of a request-level default.
 */
export function getDetailsValidationErrors(formData, { requireDate = true } = {}) {
  const errors = {};
  if (!formData.title?.trim()) errors.title = "Task title is required.";
  if (requireDate && !formData.defaultDate) errors.defaultDate = "A default date is required.";
  if (!formData.contentTypes?.length) errors.contentTypes = "Select at least one content type.";
  return errors;
}
