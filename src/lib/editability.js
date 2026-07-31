import { groupProductsByRetailer } from "./groupByRetailer";
import { todayIso } from "./format";

/**
 * editability — pure, presentation-agnostic helpers for the READ Request
 * Detail MVP's informational "Editable / Read-only" state.
 *
 * This is deliberately request-level only (per the approved rule): a
 * request is Editable when at least one effective launch date is today or
 * in the future, and Read-only only once every known effective date is in
 * the past. No field-level (per retailer/per item) locking exists here or
 * anywhere else in this slice — RequestDetail only *displays* this state,
 * it never gates or disables anything based on it (there is no Edit mode
 * yet to gate).
 *
 * Both functions are pure: they only read the `request` object passed in
 * and never mutate it, and they introduce no new fields to the Request
 * model — every date they read already exists on `request.products`,
 * `request.itemInputs`, `request.launchDate`, or `request.dueDate`.
 */

/**
 * getEffectiveDates — the set of effective launch dates for a request,
 * derived without changing the existing data model.
 *
 * Innovation: each item input's own `onSaleDate` (the launch-facing date;
 * `startShipDate` is a shipping-readiness date, not a launch date, and is
 * intentionally excluded).
 *
 * VizID Change / Brand Request: the same per-retailer effective dates the
 * Review step already derives via `groupProductsByRetailer(products,
 * defaultDate)` — a product's own `launchDate` override when present,
 * otherwise the request's default `launchDate`. Reusing this function
 * (rather than re-deriving the same "product.launchDate || defaultDate"
 * rule separately here) keeps exactly one source of truth for that
 * derivation, shared by the wizard's Review step and Request Detail alike.
 *
 * Fallback: when a request has no products/items yet (e.g. a Bulk
 * placeholder awaiting detail), fall back to the request-level date
 * directly — the same `dueDate || launchDate` chain
 * `getRequestDisplayDate` (models.js) already uses for the Queue's Due/
 * Launch column — rather than treating a dateless request as having zero
 * effective dates.
 */
export function getEffectiveDates(request) {
  if (!request) return [];

  if (request.requestType === "innovation") {
    const itemDates = (request.itemInputs ?? []).map((item) => item.onSaleDate).filter(Boolean);
    if (itemDates.length > 0) return itemDates;
  } else {
    const products = request.products ?? [];
    if (products.length > 0) {
      const groups = groupProductsByRetailer(products, request.launchDate);
      const groupDates = groups.map((g) => g.date).filter(Boolean);
      if (groupDates.length > 0) return groupDates;
    }
  }

  const fallback = request.dueDate || request.launchDate;
  return fallback ? [fallback] : [];
}

/**
 * isRequestEditable — request-level editability decision.
 *
 * editable   = at least one effective date is >= today
 * read-only  = every known effective date is < today
 *
 * Zero-date behavior: when no effective date is known at all (no products/
 * items yet and no request-level date either — e.g. a bare Bulk
 * placeholder), the request is treated as Editable by default rather than
 * permanently read-only. This is a deliberate, isolated assumption (the
 * approved rule only defines the two states in terms of dates that
 * exist) — kept entirely inside this one function so it can be revisited
 * later without touching any caller.
 *
 * Dates are ISO strings (YYYY-MM-DD), so plain string comparison against
 * `today` (itself ISO) sorts correctly — the same approach already used by
 * models.js (`isDueThisPeriod`, `getRequestDisplayDate`'s date sort).
 */
export function isRequestEditable(request, today = todayIso()) {
  const dates = getEffectiveDates(request);
  if (dates.length === 0) return true;
  return dates.some((date) => date >= today);
}
