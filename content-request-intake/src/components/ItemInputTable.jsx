import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Table } from "./ui/Table";
import { mockRetailers } from "../data/mockRetailers";
import { isItemRowValid, isStartShipDateRequired } from "../lib/businessRules";

let rowSeq = 0;
export function makeBlankItemRow() {
  rowSeq += 1;
  return {
    id: `row-${Date.now()}-${rowSeq}`,
    upc: "",
    retailer: "",
    customerId: "",
    productTitle: "",
    brand: "",
    startShipDate: "",
    onSaleDate: "",
    ecommPackDetails: "",
  };
}

/**
 * ItemInputTable — Innovation manual mode. Editable rows (not a product
 * lookup). Field requirements (including the AMZ-only Start Ship Date rule)
 * live in src/lib/businessRules.js — see Open Question #5 there.
 */
export function ItemInputTable({ rows, onChangeRows, onContinue }) {
  const updateRow = (id, field, value) => {
    onChangeRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addRow = () => onChangeRows([...rows, makeBlankItemRow()]);
  const deleteRow = (id) => onChangeRows(rows.filter((r) => r.id !== id));
  const clearAll = () => onChangeRows([]);

  const allValid = rows.length > 0 && rows.every(isItemRowValid);

  const cellInput = (row, field, opts = {}) => (
    <input
      type={opts.type ?? "text"}
      className={`input input-bordered input-xs w-full ${
        opts.required && !row[field] ? "input-error" : ""
      }`}
      value={row[field]}
      placeholder={opts.placeholder}
      onChange={(e) => updateRow(row.id, field, e.target.value)}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button type="button" className="btn btn-sm btn-outline" onClick={addRow}>
          <PlusIcon className="w-4 h-4" /> Add item
        </button>
        <button
          type="button"
          className="btn btn-sm btn-ghost text-error"
          disabled={rows.length === 0}
          onClick={clearAll}
        >
          Clear all
        </button>
        <span className="text-xs text-base-content/50 ml-auto">
          Fields marked * are required. Start Ship Date is required for Amazon (AMZ) rows.
        </span>
      </div>

      <Table>
        <thead>
          <tr>
            <th>UPC*</th>
            <th>Retailer*</th>
            <th>Customer ID*</th>
            <th>Product Title*</th>
            <th>Brand*</th>
            <th>Start Ship Date{`  `}<span className="text-base-content/40 font-normal">(AMZ)</span></th>
            <th>On Sale Date*</th>
            <th>eComm Pack Details</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="min-w-[9rem]">{cellInput(row, "upc", { required: true, placeholder: "UPC" })}</td>
              <td className="min-w-[8rem]">
                <select
                  className={`select select-bordered select-xs w-full ${
                    !row.retailer ? "select-error" : ""
                  }`}
                  value={row.retailer}
                  onChange={(e) => updateRow(row.id, "retailer", e.target.value)}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {mockRetailers.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="min-w-[8rem]">{cellInput(row, "customerId", { required: true })}</td>
              <td className="min-w-[12rem]">{cellInput(row, "productTitle", { required: true })}</td>
              <td className="min-w-[9rem]">{cellInput(row, "brand", { required: true })}</td>
              <td className="min-w-[9rem]">
                {cellInput(row, "startShipDate", {
                  type: "date",
                  required: isStartShipDateRequired(row.retailer),
                })}
              </td>
              <td className="min-w-[9rem]">{cellInput(row, "onSaleDate", { type: "date", required: true })}</td>
              <td className="min-w-[12rem]">{cellInput(row, "ecommPackDetails")}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => deleteRow(row.id)}
                  aria-label="Delete row"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center text-sm text-base-content/50 py-6">
                No item inputs yet. Click "+ Add item" to start.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-sm btn-primary"
          disabled={!allValid}
          onClick={onContinue}
        >
          Continue to Retailers
        </button>
      </div>
    </div>
  );
}
