/**
 * bulkRowValidation — display-only revalidation adapter for the Edit
 * Ticket drawer.
 *
 * There is no live validation function for BulkRow anywhere in this
 * prototype — `status`/`issueReason` on the seed rows (mockBulkRows.js)
 * are hand-authored, not computed. Saving an edit needs *some* way to
 * flip status/issueReason after a fix, or Save would be pointless. This
 * function is that minimal adapter — it recognizes exactly two issues
 * this prototype can actually PROVE resolved, nothing broader:
 *
 *   - "Missing retailer" — provable via `row.retailer` presence.
 *   - "No product match" — provable via `row.productTitle` or a non-empty
 *     `row.products` array (see lib/models.js's `products` field).
 *
 * `row` here is the caller's already-merged (original row + edit patch)
 * object — critically, the patch never touches `status`/`issueReason`
 * itself (see EditTicketDrawer's `onSave`), so `row.status`/
 * `row.issueReason` on entry are still the row's PRE-edit values, while
 * `row.retailer`/product fields reflect what the user just changed.
 * That's what lets this function tell "was this row's issue one of the
 * two known ones?" apart from "does it have some other, unmodeled
 * issue?", and what lets it re-derive status safely without guessing.
 *
 * Rules (per the approved provisional validation direction):
 *  - An unrelated/unmodeled `issueReason` is NEVER touched, regardless of
 *    what changed — this adapter has no way to prove an opaque problem is
 *    resolved, so it always preserves Incomplete as-is.
 *  - Retailer presence is always re-checked live (even for a row that
 *    started Ready) — clearing a previously-valid retailer during an edit
 *    is a real, freshly-detected problem, not a retroactive judgment.
 *  - Product presence is only ever re-checked for a row whose ORIGINAL
 *    issue was already "No product match" — a row that was Ready (or had
 *    the retailer issue) with no product data is never retroactively
 *    flagged just because it has none. "No product" is the normal,
 *    expected state for most non-Innovation bulk rows today (they never
 *    carried product data to begin with), not a defect this adapter
 *    should invent. This is the one place retailer and product checks are
 *    deliberately asymmetric, and it's why: retailer emptiness is always
 *    abnormal; product emptiness on a Ready row is not.
 *  - Selecting a product never affects a retailer-only issue (product
 *    fields aren't even read unless the row's original issue was the
 *    product one), and filling retailer never affects a product-only
 *    issue (retailer presence alone doesn't clear `productStillMissing`).
 *    Each known issue can only be resolved by fixing the thing it's
 *    actually about.
 *  - If a row somehow has both known problems at once, fixing only one
 *    leaves the row Incomplete with the other issue's reason — it
 *    does not clear to Ready until both are actually addressed. True
 *    *simultaneous* multi-issue tracking (more than one active
 *    `issueReason` at a time) isn't representable with today's
 *    single-string `issueReason` field — that would need an array-shaped
 *    field, an explicit model change not made in this pass.
 */
const RETAILER_ISSUE = "Missing retailer";
const PRODUCT_ISSUE = "No product match";

function hasProductMatch(row) {
  return Boolean(row.productTitle) || Boolean(row.products && row.products.length > 0);
}

export function revalidateBulkRow(row) {
  const wasKnownRetailerIssue = row.status === "issue" && row.issueReason === RETAILER_ISSUE;
  const wasKnownProductIssue = row.status === "issue" && row.issueReason === PRODUCT_ISSUE;
  const wasUnrelatedIssue = row.status === "issue" && !wasKnownRetailerIssue && !wasKnownProductIssue;

  if (wasUnrelatedIssue) {
    return row;
  }

  const retailerMissing = !row.retailer;
  const productStillMissing = wasKnownProductIssue && !hasProductMatch(row);

  if (retailerMissing || productStillMissing) {
    return { ...row, status: "issue", issueReason: retailerMissing ? RETAILER_ISSUE : PRODUCT_ISSUE };
  }

  return { ...row, status: "ready", issueReason: null };
}
