import { TrashIcon } from "@heroicons/react/24/outline";
import { InfoBanner } from "./ui/InfoBanner";
import { Table } from "./ui/Table";
import { mockRetailers } from "../data/mockRetailers";
import { fmtCount } from "../lib/format";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

const COPY_BY_FLOW = {
  vizId: "Review the retailer list and launch dates per retailer. Remove a retailer group if it shouldn't be included.",
  brandRequest:
    "Review retailer dates. Confirm retailer-specific due or launch dates before continuing.",
};

const DATE_COLUMN_LABEL = {
  vizId: "Launch Date",
  brandRequest: "Due/Launch Date",
};

/**
 * RetailerDatesStep — Viz ID Change / Brand Request only. Innovation never
 * reaches this step: it captures retailer per item in
 * InnovationItemInputForm, so re-reviewing retailers here would be
 * redundant (and was the previous prototype's bug).
 */
export function RetailerDatesStep({ requestType, groups, onUpdateGroupDate, onRemoveGroup }) {
  const dateLabel = DATE_COLUMN_LABEL[requestType] ?? "Date";

  return (
    <div className="flex flex-col gap-4">
      <InfoBanner variant="info">{COPY_BY_FLOW[requestType]}</InfoBanner>

      {groups.length === 0 ? (
        <div className="text-sm text-base-content/50 border border-dashed border-base-300 rounded-box py-8 text-center">
          No retailer groups yet — add products in the Products step first.
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Retailer</th>
              <th>{dateLabel}</th>
              <th>Products</th>
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={`${g.retailer}__${g.date}`}>
                <td className="font-semibold text-base-content">{retailerLabel(g.retailer)}</td>
                <td>
                  <input
                    type="date"
                    className="input input-bordered input-xs"
                    value={g.date || ""}
                    onChange={(e) => onUpdateGroupDate(g.retailer, g.date, e.target.value)}
                  />
                </td>
                <td className="text-base-content/70">{fmtCount(g.rows.length, "product")}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => onRemoveGroup(g.retailer, g.date)}
                  >
                    <TrashIcon className="w-3.5 h-3.5" /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
