import { groupProductsByRetailer } from "./groupByRetailer";
import { todayIso } from "./format";
import { REQUEST_STATUS } from "./models";

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

/**
 * isRequestArchived — pure status check, split out on purpose so the
 * date-based `isRequestEditable` rule above never has to know about
 * lifecycle/status. Archive is a separate, orthogonal reason a request can
 * become read-only (see models.js REQUEST_STATUS.ARCHIVED).
 */
export function isRequestArchived(request) {
  return request?.status === REQUEST_STATUS.ARCHIVED;
}

/**
 * canEditRequest — the combined editability decision every call site (Queue
 * row action, Request Detail footer, the /request/:id/edit route guard)
 * should use going forward instead of calling `isRequestEditable` alone.
 * A request is only actually editable when BOTH the existing date rule
 * allows it AND it hasn't been archived — archiving a request that still
 * has a future effective date must still lock it, and this is the one place
 * that combination is decided, so it can't drift between call sites.
 */
export function canEditRequest(request, today = todayIso()) {
  return isRequestEditable(request, today) && !isRequestArchived(request);
}

/**
 * editUnavailableReason — the one shared, plain-English explanation for why
 * Edit is unavailable, used everywhere the Edit action needs an accessible
 * explanation (Queue row action's title/aria-label, Request Detail's
 * visible read-only text, RequestDetailFooter). Archived is checked first
 * since it's the more specific/recent reason when a request is both
 * archived and date-locked. Returns null when the request IS editable, so
 * callers can render nothing rather than an empty explanation.
 */
export function editUnavailableReason(request, today = todayIso()) {
  if (isRequestArchived(request)) {
    return "This request is read-only because it has been archived.";
  }
  if (!isRequestEditable(request, today)) {
    return "This request is read-only because all effective dates are in the past.";
  }
  return null;
}
