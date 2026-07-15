import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Card } from "./ui/Card";
import { mockRetailers } from "../data/mockRetailers";
import { isItemRowValid, isStartShipDateRequired } from "../lib/businessRules";

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
 */
export function InnovationItemInputForm({ items, onChangeItems }) {
  const updateItem = (id, field, value) => {
    onChangeItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const addItem = () => onChangeItems([...items, makeBlankItem()]);
  const removeItem = (id) => onChangeItems(items.filter((it) => it.id !== id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-base-content">Item Inputs</h3>
        <button type="button" className="btn btn-sm btn-outline" onClick={addItem}>
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
        return (
          <Card
            key={item.id}
            title={`Item ${index + 1}`}
            actions={
              items.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </Card>
        );
      })}
    </div>
  );
}
