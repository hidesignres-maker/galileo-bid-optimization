import { Card } from "../ui/Card";
import { Table, ClampCell } from "../ui/Table";
import { mockRetailers } from "../../data/mockRetailers";
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
 */
export function InnovationReviewBody({ formData, itemInputs }) {
  return (
    <>
      <InnovationRequestSummary formData={formData} />

      <Card title="Item Inputs" bodyClassName="p-0">
        <Table flush>
          <thead>
            <tr>
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
