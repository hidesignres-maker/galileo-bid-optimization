import { Fragment } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Table } from "../ui/Table";
import { mockRetailers } from "../../data/mockRetailers";
import {
  ALWAYS_REQUIRED_ITEM_FIELDS,
  isItemRowValid,
  isStartShipDateRequired,
} from "../../lib/businessRules";
import { makeBlankItem } from "../InnovationItemInputForm";

const RETAILER_OPTIONS = mockRetailers.map((r) => ({ value: r.code, label: r.name }));

/**
 * Field-level "is this one missing" check, for compact per-cell error
 * styling only — mirrors the exact same rules InnovationItemInputForm
 * already uses (ALWAYS_REQUIRED_ITEM_FIELDS + the AMZ Start Ship Date
 * rule from businessRules.js). Not a new validation rule: this never
 * decides whether Continue is blocked (isItemRowValid, called by the
 * wizard, still owns that) — it only decides which cell gets a red
 * border in this presentation.
 */
function isFieldMissing(item, field) {
  if (field === "startShipDate") {
    return isStartShipDateRequired(item.retailer) && !item.startShipDate;
  }
  return ALWAYS_REQUIRED_ITEM_FIELDS.includes(field) && !item[field];
}

/**
 * InnovationItemTable — Innovation Flow B's item capture: one compact,
 * directly-editable row per itemInputs record, in place of Flow A's
 * (InnovationItemInputForm.jsx) per-item card/accordion.
 *
 * Deliberately NOT a second item model: same itemInputs shape, same
 * `makeBlankItem` factory (imported from InnovationItemInputForm.jsx, not
 * duplicated), same validation rules (businessRules.js, untouched), same
 * review (InnovationReviewBody, untouched), same request payload. This
 * component only supplies an alternate presentation over `items` /
 * `onChangeItems` — identical contract to InnovationItemInputForm.
 *
 * Every edit writes straight into the wizard-owned itemInputs array via
 * onChangeItems — no local duplicate row data, no autosave, no
 * paste-from-spreadsheet, no import, no column resizing, no sorting or
 * pagination.
 *
 * Product Description (mapped to the existing `productTitle` property, no
 * new field name) gets the widest column; IDs, retailer, dates, and
 * eComm Pack Details stay compact/single-line. The shared `Table`
 * primitive's own `overflow-x-auto` wrapper is relied on for horizontal
 * overflow — no sticky columns, no alternate overflow behavior invented.
 *
 * Row-level invalid state shows a compact one-line message in its own
 * table row directly below the data row (not inside any cell), so a
 * row's own height stays a steady ~48px regardless of validity — per-cell
 * red borders (via isFieldMissing) point at which fields specifically are
 * missing, without expanding that cell's height.
 */
export function InnovationItemTable({ items, onChangeItems }) {
  const updateItem = (id, field, value) => {
    onChangeItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const addItem = () => {
    onChangeItems([...items, makeBlankItem()]);
  };

  // Last remaining item can't be removed — matches InnovationItemInputForm's
  // established behavior (the remove control simply isn't rendered when
  // there's only one item), so Innovation always keeps at least one row
  // regardless of which editor is active.
  const removeItem = (id) => onChangeItems(items.filter((it) => it.id !== id));
  const canRemove = items.length > 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-base-content">Item inputs</h3>
          <p className="text-xs text-base-content/50 mt-0.5">
            Enter the UPC, retailer, and launch details for each item in this Innovation request.
          </p>
        </div>
        <button type="button" className="btn btn-sm btn-outline shrink-0" onClick={addItem}>
          <PlusIcon className="w-4 h-4" /> Add item
        </button>
      </div>

      <Table>
        <thead>
          <tr>
            <th className="whitespace-nowrap w-28">UPC</th>
            <th className="whitespace-nowrap w-36">Retailer</th>
            <th className="whitespace-nowrap w-28">Customer ID</th>
            <th className="whitespace-nowrap min-w-[220px]">Product Description</th>
            <th className="whitespace-nowrap w-28">Brand</th>
            <th className="whitespace-nowrap w-36">On Sale Date</th>
            <th className="whitespace-nowrap w-36">Start Ship Date</th>
            <th className="whitespace-nowrap w-40">eComm Pack Details</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center text-sm text-base-content/50 py-6">
                No item inputs yet. Click "Add item" to start.
              </td>
            </tr>
          )}

          {items.map((item, index) => {
            const valid = isItemRowValid(item);
            return (
              <Fragment key={item.id}>
                <tr className={!valid ? "bg-error/5" : undefined}>
                  <td className="align-middle">
                    <Input
                      size="sm"
                      value={item.upc}
                      onChange={(e) => updateItem(item.id, "upc", e.target.value)}
                      className={isFieldMissing(item, "upc") ? "input-error" : ""}
                      aria-label={`UPC for item ${index + 1}`}
                    />
                  </td>
                  <td className="align-middle">
                    <Select
                      size="sm"
                      value={item.retailer}
                      options={RETAILER_OPTIONS}
                      onChange={(e) => updateItem(item.id, "retailer", e.target.value)}
                      className={isFieldMissing(item, "retailer") ? "select-error" : ""}
                      aria-label={`Retailer for item ${index + 1}`}
                    />
                  </td>
                  <td className="align-middle">
                    <Input
                      size="sm"
                      value={item.customerId}
                      onChange={(e) => updateItem(item.id, "customerId", e.target.value)}
                      className={isFieldMissing(item, "customerId") ? "input-error" : ""}
                      aria-label={`Customer ID for item ${index + 1}`}
                    />
                  </td>
                  <td className="align-middle">
                    <Input
                      size="sm"
                      value={item.productTitle}
                      onChange={(e) => updateItem(item.id, "productTitle", e.target.value)}
                      className={isFieldMissing(item, "productTitle") ? "input-error" : ""}
                      aria-label={`Product description for item ${index + 1}`}
                    />
                  </td>
                  <td className="align-middle">
                    <Input
                      size="sm"
                      value={item.brand}
                      onChange={(e) => updateItem(item.id, "brand", e.target.value)}
                      className={isFieldMissing(item, "brand") ? "input-error" : ""}
                      aria-label={`Brand for item ${index + 1}`}
                    />
                  </td>
                  <td className="align-middle">
                    <Input
                      type="date"
                      size="sm"
                      value={item.onSaleDate}
                      onChange={(e) => updateItem(item.id, "onSaleDate", e.target.value)}
                      className={isFieldMissing(item, "onSaleDate") ? "input-error" : ""}
                      aria-label={`On sale date for item ${index + 1}`}
                    />
                  </td>
                  <td className="align-middle">
                    <Input
                      type="date"
                      size="sm"
                      value={item.startShipDate}
                      onChange={(e) => updateItem(item.id, "startShipDate", e.target.value)}
                      className={isFieldMissing(item, "startShipDate") ? "input-error" : ""}
                      aria-label={`Start ship date for item ${index + 1}`}
                    />
                  </td>
                  <td className="align-middle">
                    <Input
                      size="sm"
                      value={item.ecommPackDetails}
                      onChange={(e) => updateItem(item.id, "ecommPackDetails", e.target.value)}
                      aria-label={`eComm pack details for item ${index + 1}`}
                    />
                  </td>
                  <td className="align-middle text-center">
                    {canRemove && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.upc ? `item with UPC ${item.upc}` : `item ${index + 1}`}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
                {!valid && (
                  <tr>
                    <td colSpan={9} className="text-xs text-error pb-2 pt-0">
                      Missing required fields for this item.
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </Table>

      <button type="button" className="btn btn-sm btn-outline self-start" onClick={addItem}>
        <PlusIcon className="w-4 h-4" /> Add item
      </button>
    </div>
  );
}
