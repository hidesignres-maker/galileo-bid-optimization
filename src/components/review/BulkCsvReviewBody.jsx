import { Card } from "../ui/Card";
import { ProductImageThumb } from "../ui/ProductImageThumb";
import { mockRetailers } from "../../data/mockRetailers";
import { getPlaceholderProductImage } from "../../data/productImages";
import { fmtDate } from "../../lib/format";
import { BrandVizRequestSummary } from "./BrandVizRequestSummary";
import { InnovationRequestSummary } from "./InnovationRequestSummary";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

/** Same label-above-value treatment used by the `"detail"` variant of both
 * request-type summaries — reused directly rather than re-exported, since
 * this is the only other place in Request Detail that needs it. */
function ItemField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-base-content/50">{label}</span>
      <span className="text-sm text-base-content">{children}</span>
    </div>
  );
}

/**
 * BulkCsvReviewBody — item-centered READ body for requests created through
 * Bulk CSV Import (`request.creationMethod === "bulkCsv"`), regardless of
 * the row's actual `requestType` (Viz ID Change, Brand Request, or
 * Innovation — Decision A, Aug 2026 pass). This is a presentation variant
 * keyed on creation *source*, not a new request type: Request Overview
 * above still renders the request's real `requestType` label via the
 * existing `BrandVizRequestSummary`/`InnovationRequestSummary`
 * (`variant="detail"`) — "Bulk CSV" is a source label shown separately, in
 * Request Detail's header ("Imported via Bulk CSV"), never as a Request
 * type value.
 *
 * Replaces the Products-by-Retailer / Item Inputs body with a single-item
 * "Item detail" card, since a bulk-imported row is provisional and
 * product/item-centered rather than already organized into retailer
 * groups (working hypothesis, pending stakeholder validation — see
 * GALILEO_QUEUE_PATTERN.md-style docs for the equivalent Brand/VizID and
 * Innovation bodies; no such doc exists yet for this one).
 *
 * `item` — the request's first `itemInputs` entry, or `null` when none
 * exists yet (e.g. a freshly-imported VizID/Brand Request row with no
 * enrichment — the real, current shape of `bulkRowToRequest`'s output for
 * non-Innovation rows). Never fabricated: a null item renders a plain,
 * honest empty state, not invented field values. Every field shown below
 * already exists on the `itemInputs` shape (see `lib/models.js`
 * `createBulkRow`/`bulkRowToRequest`) — no new model fields introduced.
 */
export function BulkCsvReviewBody({ requestType, formData, item, onAssigneeChange }) {
  const isInnovation = requestType === "innovation";
  const Summary = isInnovation ? InnovationRequestSummary : BrandVizRequestSummary;

  return (
    <>
      <Summary requestType={requestType} formData={formData} variant="detail" onAssigneeChange={onAssigneeChange} />

      <Card
        title="Item detail"
        subtitle="Review the product, retailer, customer ID, and dates associated with this request."
        bodyPadding="p-6"
      >
        {!item ? (
          <p className="text-sm text-base-content/50">No item details have been added to this request yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ProductImageThumb
                src={getPlaceholderProductImage(item.upc || item.id)}
                alt={item.productTitle}
                size="w-12 h-12"
              />
              <span className="text-sm font-medium text-base-content">{item.productTitle || "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <ItemField label="UPC">{item.upc || "—"}</ItemField>
              <ItemField label="Retailer">{item.retailer ? retailerLabel(item.retailer) : "—"}</ItemField>
              <ItemField label="Customer ID">{item.customerId || "—"}</ItemField>
              <ItemField label="Brand">{item.brand || "—"}</ItemField>
              <ItemField label="On Sale Date">{fmtDate(item.onSaleDate)}</ItemField>
              <ItemField label="Start Date">{fmtDate(item.startShipDate)}</ItemField>
            </div>
            {item.ecommPackDetails && <ItemField label="eComm Pack Details">{item.ecommPackDetails}</ItemField>}
          </div>
        )}
      </Card>
    </>
  );
}
