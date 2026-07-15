import { Table } from "./ui/Table";
import { Card } from "./ui/Card";
import { mockRetailers } from "../data/mockRetailers";
import { fmtDate } from "../lib/format";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

/**
 * ReviewGroups — Step 4 final retailer/date grouping table.
 * Column shape differs by flow:
 *   vizId / brandRequest → Product Title, EAN, Retailers
 *   innovation           → UPC, Retailer, Customer ID, Product Title, Brand,
 *                           Start Ship Date, On Sale Date
 */
export function ReviewGroups({ requestType, groups }) {
  const title = requestType === "innovation" ? "Retailer Date Groups" : "Retailer Launch Groups";

  if (groups.length === 0) {
    return (
      <Card title={title}>
        <p className="text-sm text-base-content/50 text-center py-6">No retailer groups yet.</p>
      </Card>
    );
  }

  return (
    <Card title={title} bodyClassName="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={`${g.retailer}__${g.date}`} className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-base-content">
            {retailerLabel(g.retailer)}{" "}
            <span className="text-base-content/50 font-normal">— {fmtDate(g.date)}</span>
          </div>

          <Table>
            {requestType === "innovation" ? (
              <>
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
                  {g.rows.map((r, i) => (
                    <tr key={i}>
                      <td className="text-base-content/70">{r.upc}</td>
                      <td className="text-base-content/70">{retailerLabel(r.retailer)}</td>
                      <td className="text-base-content/70">{r.customerId}</td>
                      <td className="text-base-content">{r.productTitle}</td>
                      <td className="text-base-content/70">{r.brand}</td>
                      <td className="text-base-content/70">{fmtDate(r.startShipDate)}</td>
                      <td className="text-base-content/70">{fmtDate(r.onSaleDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th>Product Title</th>
                    <th>EAN</th>
                    <th>Retailers</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r, i) => (
                    <tr key={i}>
                      <td className="text-base-content">{r.productTitle}</td>
                      <td className="text-base-content/70">{r.ean}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {(r.retailers ?? []).map((code) => (
                            <span key={code} className="badge badge-sm badge-ghost">
                              {retailerLabel(code)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </Table>
        </div>
      ))}
    </Card>
  );
}
