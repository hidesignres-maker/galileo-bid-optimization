import { Card } from "../ui/Card";
import { Table, ClampCell } from "../ui/Table";
import { ProductImageThumb } from "../ui/ProductImageThumb";
import { mockRetailers } from "../../data/mockRetailers";
import { getPlaceholderProductImage } from "../../data/productImages";
import { fmtDate } from "../../lib/format";
import { InnovationRequestSummary } from "./InnovationRequestSummary";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

/** Compact categorical pill for a retailer code — reuses the existing
 * badge-ghost treatment already used for retailer tags elsewhere in the
 * app (ContentRequestQueue's RetailerTags), not a new token or style. */
function RetailerPill({ code }) {
  return <span className="badge badge-sm badge-ghost whitespace-nowrap">{retailerLabel(code)}</span>;
}

/**
 * InnovationReviewBody — explicit Innovation review body (left column
 * content). Summary + one flat item table — no retailer accordions, since
 * Innovation has no separate Retailers step and retailer/dates are already
 * per-item.
 *
 * Columns are the 7 verified fields only (UPC, Retailer, Customer ID,
 * Product Description, Brand, On Sale Date, Start Date) — no EAN (not part
 * of the item-input shape), no unresolved eighth Figma column.
 *
 * `hideTitle`/`onAssigneeChange`/`variant` — passed straight through to
 * `InnovationRequestSummary` unchanged (see its own doc comment). Omitted
 * by every existing caller (wizard Review), so this body renders exactly
 * as before by default. Only the summary sub-component reacts to
 * `variant` — the item table below it is unaffected by `variant`.
 *
 * Product thumbnail column (Aug 2026 pass, scope-corrected) — leads each
 * row with a compact `ProductImageThumb`, mirroring `BrandVizReviewBody`'s
 * own retailer-group table (same component, same deterministic
 * `getPlaceholderProductImage` assignment keyed by UPC). Unlike
 * `BrandVizReviewBody`'s pre-existing thumbnail column (which really is
 * unconditional, an established precedent from before this pass), this
 * one is gated on `variant === "detail"` — the Request Detail READ view
 * only, per explicit scope correction. The wizard's live Review step
 * (`ManualReviewStep`, which never passes `variant`, so it stays on the
 * `"review"` default) renders its Item Inputs table exactly as it did
 * before thumbnails were introduced: no image column at all.
 */
export function InnovationReviewBody({ formData, itemInputs, hideTitle = false, onAssigneeChange, variant = "review" }) {
  const showThumbnails = variant === "detail";

  return (
    <>
      <InnovationRequestSummary
        formData={formData}
        hideTitle={hideTitle}
        onAssigneeChange={onAssigneeChange}
        variant={variant}
      />

      <Card title="Item Inputs" bodyClassName="p-0">
        <Table flush>
          <thead>
            <tr>
              {showThumbnails && <th className="w-14" aria-label="Product image" />}
              <th className="whitespace-nowrap">UPC</th>
              <th className="whitespace-nowrap">Retailer</th>
              <th className="whitespace-nowrap">Customer ID</th>
              <th className="whitespace-nowrap">Product Description</th>
              <th className="whitespace-nowrap">Brand</th>
              <th className="whitespace-nowrap">On Sale Date</th>
              <th className="whitespace-nowrap">Start Date</th>
            </tr>
          </thead>
          <tbody>
            {itemInputs.map((item) => (
              <tr key={item.id}>
                {showThumbnails && (
                  <td className="align-middle">
                    <ProductImageThumb
                      src={getPlaceholderProductImage(item.upc || item.id)}
                      alt={item.productTitle}
                    />
                  </td>
                )}
                <td className="text-base-content/70 whitespace-nowrap align-middle">{item.upc}</td>
                <td className="whitespace-nowrap align-middle">
                  <RetailerPill code={item.retailer} />
                </td>
                <td className="text-base-content/70 whitespace-nowrap align-middle">{item.customerId}</td>
                <ClampCell contentClassName="text-base-content">{item.productTitle}</ClampCell>
                <td className="text-base-content/70 whitespace-nowrap align-middle">{item.brand}</td>
                <td className="text-base-content/70 whitespace-nowrap align-middle">{fmtDate(item.onSaleDate)}</td>
                <td className="text-base-content/70 whitespace-nowrap align-middle">
                  {fmtDate(item.startShipDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
