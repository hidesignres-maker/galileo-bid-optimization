import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Card } from "./ui/Card";
import { mockRetailers } from "../data/mockRetailers";
import { fmtDate } from "../lib/format";
import { ALWAYS_REQUIRED_ITEM_FIELDS, isItemRowValid, isStartShipDateRequired } from "../lib/businessRules";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

let rowSeq = 0;
export function makeBlankItem() {
  rowSeq += 1;
  return {
    id: `item-${Date.now()}-${rowSeq}`,
    upc: "",
    customerId: "",
    productTitle: "",
    brand: "",
    retailer: "",
    startShipDate: "",
    onSaleDate: "",
    ecommPackDetails: "",
  };
}

/** Count of missing required fields for a single item row, for the
 * collapsed "N missing required fields" summary. Mirrors isItemRowValid's
 * rules (businessRules.js) rather than just returning true/false. */
function missingFieldCount(item) {
  const missingAlways = ALWAYS_REQUIRED_ITEM_FIELDS.filter((field) => !item[field]).length;
  const missingShipDate = isStartShipDateRequired(item.retailer) && !item.startShipDate ? 1 : 0;
  return missingAlways + missingShipDate;
}

/**
 * InnovationItemInputForm — Innovation's item capture, as a 2-column form
 * per item (not a product lookup, not a dense spreadsheet table).
 *
 * Stakeholder feedback applied here:
 *  - No "ID Type" field.
 *  - Retailer moved to the second column (first field in that column).
 *  - Retailer is captured here, per item — so Innovation's manual flow
 *    never shows a separate Retailers step (see ManualRequestWizard).
 *
 * Column 1: UPC, Customer ID, Product Title, Brand
 * Column 2: Retailer, Start Ship Date (required only for AMZ), On Sale Date,
 *           eComm Pack Details
 *
 * Items collapse/expand: a new item starts expanded (so it can be filled in
 * right away); collapsing shows a one-line summary instead of the full
 * field grid, so a request with several items doesn't turn into a wall of
 * forms. The last remaining item can't be removed — the remove button is
 * simply not rendered when there's only one — so Innovation always has at
 * least one item input.
 */
export function InnovationItemInputForm({ items, onChangeItems }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set(items.map((it) => it.id)));

  const updateItem = (id, field, value) => {
    onChangeItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const addItem = () => {
    const newItem = makeBlankItem();
    onChangeItems([...items, newItem]);
    setExpandedIds((prev) => new Set(prev).add(newItem.id));
  };

  const removeItem = (id) => onChangeItems(items.filter((it) => it.id !== id));

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

      {items.length === 0 && (
        <div className="text-sm text-base-content/50 border border-dashed border-base-300 rounded-box py-8 text-center">
          No item inputs yet. Click "Add item" to start.
        </div>
      )}

      {items.map((item, index) => {
        const valid = isItemRowValid(item);
        const isExpanded = expandedIds.has(item.id);
        const missingCount = missingFieldCount(item);
        const summary = valid
          ? `Item ${index + 1} · UPC ${item.upc} · ${retailerLabel(item.retailer)} · On Sale ${fmtDate(item.onSaleDate)}`
          : `Item ${index + 1} · ${missingCount} missing required field${missingCount === 1 ? "" : "s"}`;

        return (
          <Card key={item.id} bodyClassName={isExpanded ? undefined : "py-3"}>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                className="flex items-center gap-2 text-left flex-1 min-w-0"
                onClick={() => toggleExpanded(item.id)}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4 text-base-content/40 shrink-0" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-base-content/40 shrink-0" />
                )}
                {isExpanded ? (
                  <span className="text-sm font-semibold text-base-content">Item {index + 1}</span>
                ) : (
                  <span className={`text-sm truncate ${valid ? "text-base-content/70" : "text-error"}`}>
                    {summary}
                  </span>
                )}
              </button>
              {items.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error shrink-0"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {isExpanded && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Column 1 */}
                  <div className="flex flex-col gap-4">
                    <Input
                      label="UPC"
                      required
                      value={item.upc}
                      onChange={(e) => updateItem(item.id, "upc", e.target.value)}
                    />
                    <Input
                      label="Customer ID"
                      required
                      value={item.customerId}
                      onChange={(e) => updateItem(item.id, "customerId", e.target.value)}
                    />
                    <Input
                      label="Product Title"
                      required
                      value={item.productTitle}
                      onChange={(e) => updateItem(item.id, "productTitle", e.target.value)}
                    />
                    <Input
                      label="Brand"
                      required
                      value={item.brand}
                      onChange={(e) => updateItem(item.id, "brand", e.target.value)}
                    />
                  </div>

                  {/* Column 2 — Retailer first, per stakeholder feedback */}
                  <div className="flex flex-col gap-4">
                    <Select
                      label="Retailer"
                      required
                      value={item.retailer}
                      options={mockRetailers.map((r) => ({ value: r.code, label: r.name }))}
                      onChange={(e) => updateItem(item.id, "retailer", e.target.value)}
                    />
                    <Input
                      type="date"
                      label="Start Ship Date"
                      required={isStartShipDateRequired(item.retailer)}
                      hint={isStartShipDateRequired(item.retailer) ? "Required for Amazon (AMZ)" : "Optional"}
                      value={item.startShipDate}
                      onChange={(e) => updateItem(item.id, "startShipDate", e.target.value)}
                    />
                    <Input
                      type="date"
                      label="On Sale Date"
                      required
                      value={item.onSaleDate}
                      onChange={(e) => updateItem(item.id, "onSaleDate", e.target.value)}
                    />
                    <Input
                      label="eComm Pack Details"
                      hint="Required when applicable"
                      value={item.ecommPackDetails}
                      onChange={(e) => updateItem(item.id, "ecommPackDetails", e.target.value)}
                    />
                  </div>
                </div>

                {!valid && (
                  <p className="text-xs text-error mt-3">
                    Missing required fields for this item.
                  </p>
                )}
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}
