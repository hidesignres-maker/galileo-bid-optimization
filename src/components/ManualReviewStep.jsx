import { RequestSummaryCard } from "./RequestSummaryCard";
import { Card } from "./ui/Card";
import { Table } from "./ui/Table";
import { mockRetailers } from "../data/mockRetailers";
import { fmtDate } from "../lib/format";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

/**
 * ManualReviewStep — final review before "Create Request" (always exactly
 * one request in the manual flow).
 *
 * Viz ID / Brand Request: summary + retailer launch groups (from Products +
 * Retailers steps).
 * Innovation: summary + a flat item-input list — no retailer grouping table,
 * since retailer/dates are already visible per item and there's no separate
 * Retailers step to review here.
 */
export function ManualReviewStep({ requestType, formData, products, itemInputs, retailerGroups }) {
  return (
    <div className="flex flex-col gap-4">
      <RequestSummaryCard
        requestType={requestType}
        formData={formData}
        products={products}
        itemInputs={itemInputs}
        retailerGroups={retailerGroups}
      />

      {requestType === "innovation" ? (
        <Card title="Item Inputs">
          <Table>
            <thead>
              <tr>
                <th>UPC</th>
                <th>Retailer</th>
                <th>Customer ID</th>
                <th>Product Title</th>
                <th>Brand</th>
                <th>Start Ship Date</th>
                <th>On Sale Date</th>
              </tr>
            </thead>
            <tbody>
              {itemInputs.map((item) => (
                <tr key={item.id}>
                  <td className="text-base-content/70">{item.upc}</td>
                  <td className="text-base-content/70">{retailerLabel(item.retailer)}</td>
                  <td className="text-base-content/70">{item.customerId}</td>
                  <td className="text-base-content">{item.productTitle}</td>
                  <td className="text-base-content/70">{item.brand}</td>
                  <td className="text-base-content/70">{fmtDate(item.startShipDate)}</td>
                  <td className="text-base-content/70">{fmtDate(item.onSaleDate)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <Card title="Retailer Launch Groups" bodyClassName="flex flex-col gap-4">
          {retailerGroups.length === 0 ? (
            <p className="text-sm text-base-content/50 text-center py-6">No retailer groups yet.</p>
          ) : (
            retailerGroups.map((g) => (
              <div key={`${g.retailer}__${g.date}`} className="flex flex-col gap-2">
                <div className="text-sm font-semibold text-base-content">
                  {retailerLabel(g.retailer)}{" "}
                  <span className="text-base-content/50 font-normal">— {fmtDate(g.date)}</span>
                </div>
                <Table>
                  <thead>
                    <tr>
                      <th>Product Title</th>
                      <th>EAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r, i) => (
                      <tr key={i}>
                        <td className="text-base-content">{r.productTitle}</td>
                        <td className="text-base-content/70">{r.ean}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
