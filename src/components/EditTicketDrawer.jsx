import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Drawer } from "./ui/Drawer";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Checkbox } from "./ui/Checkbox";
import { FieldInfoTooltip } from "./ui/FieldInfoTooltip";
import { ProductLookupTable } from "./ProductLookupTable";
import { mockRetailers } from "../data/mockRetailers";
import { mockProducts } from "../data/mockProducts";
import { CONTENT_TYPE_OPTIONS_BY_FLOW, REQUEST_TYPE_LABELS, mockAssignees } from "../data/formOptions";
import { revalidateBulkRow } from "../lib/bulkRowValidation";

const RETAILER_OPTIONS = mockRetailers.map((r) => ({ value: r.code, label: r.name }));
const PRODUCT_TABLE_MAX_ROWS = 8;

/**
 * EditTicketDrawer — right-side Drawer (ui/Drawer.jsx), not a modal — see
 * BulkReviewStep's doc comment for the accessibility rationale (Modal's
 * focus-trap logic is reused via the shared `useDialogFocusTrap` hook
 * rather than rebuilt).
 *
 * Pre-creation completeness: this ticket is not yet a Content Request, so
 * its header shows Ready/Incomplete — the validation/completeness model
 * from `revalidateBulkRow` — never a request-workflow status
 * (needs_action/in_progress/completed/...). Those only apply after
 * `bulkRowToRequest` creates the real request.
 *
 * Body sections, per the approved layout — never combined into one dense
 * block:
 *  A. Ticket details — Request type (read-only), Title, Description (full
 *     width), then a compact grid: Retailer / Due-Launch Date, Assignee /
 *     Content type. Request type is shown but not editable — it governs
 *     which CSV template/date field applies to this row, and changing it
 *     isn't a supported edit in this pass. Retailer stays in this grid
 *     (not one of the three named compact-row fields, but it's the field
 *     "Missing retailer" validation is actually about — dropping it would
 *     make that issue unresolvable from this drawer), which is why the
 *     compact section is two 2-column rows rather than one 3-column row.
 *     Assignee replaces the prior Customer ID slot (explicit product
 *     decision) — see the `assignee` field note on `createBulkRow`
 *     (lib/models.js) for the minimal additive data-model scope this
 *     required. Content type renders as a Checkbox group (Images/Copy/
 *     Video), matching the exact pattern `ManualDetailsForm.jsx` already
 *     uses for real Requests, rather than the prior single-select Select.
 *
 *     Field-level required affordances (asterisk + inline red message) are
 *     shown for Title, Date, and Content type — the same visual treatment
 *     Retailer already used — but these are UI-only completeness cues. Per
 *     the approved scope, no new field feeds into the actual Ready/
 *     Incomplete determination beyond the two already-proven rules in
 *     `revalidateBulkRow` (retailer presence, product match); inventing a
 *     new backend validation rule for Title/Date/Content type/Assignee was
 *     explicitly out of scope for this pass.
 *  B. Product management — the shared `ProductLookupTable` (the same
 *     approved two-tab All Products / Selected Products component
 *     ManualRequestWizard and the standalone Product Selection demo use),
 *     reused via its opt-in extension props rather than forked. See that
 *     component's own doc comment for what each prop does.
 *
 * Multi-product data shape: `draft.products` is seeded from `row.products`
 * (the additive array field, lib/models.js) when present, else migrated
 * from the row's legacy flat `productTitle`/`brand`/`upc` fields into the
 * same one-item array shape. On Save, `products` is written back as a real
 * array, and the first entry is also mirrored into the legacy flat fields
 * purely for backward compatibility — the same convention this pass reuses
 * for `contentTypes`: the array is the real edited value, and
 * `contentTypes[0]` is mirrored into the legacy singular `contentType`
 * field so existing readers of that field (`bulkRowToRequest`) keep working
 * unchanged.
 *
 * Validation summary (drawer header): recomputed live from the current
 * draft via the same `revalidateBulkRow` adapter Save itself uses (a pure,
 * side-effect-free preview call) — so the header badge/issue line updates
 * as the user fixes retailer/products, without duplicating that logic.
 *
 * Save behavior: builds a plain field patch (never touches
 * `status`/`issueReason` itself) and hands it to `onSave(patch)` — the
 * caller (BulkReviewStep) merges it into the row and calls
 * `revalidateBulkRow`, the single source of truth for the actual
 * status/issueReason transition. Cancel discards the draft entirely;
 * `row` itself is never mutated until Save.
 */
export function EditTicketDrawer({ row, onCancel, onSave }) {
  const isBrandRequest = row.requestType === "brandRequest";
  const dateLabel = isBrandRequest ? "Due Date" : "Launch Date";
  const initialDate = isBrandRequest ? row.dueDate : row.launchDate;
  const contentTypeOptions = CONTENT_TYPE_OPTIONS_BY_FLOW[row.requestType] ?? [];

  const initialProducts =
    row.products && row.products.length > 0
      ? row.products
      : row.productTitle
        ? [{ id: row.upc || row.id, description: row.productTitle, brand: row.brand, upc: row.upc, ean: null, retailers: [] }]
        : [];

  const initialContentTypes =
    row.contentTypes && row.contentTypes.length > 0 ? row.contentTypes : row.contentType ? [row.contentType] : [];

  const [draft, setDraft] = useState({
    title: row.title ?? "",
    description: row.description ?? "",
    retailer: row.retailer ?? "",
    contentTypes: initialContentTypes,
    date: initialDate ?? "",
    assignee: row.assignee ?? "",
    products: initialProducts,
  });

  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const toggleContentType = (value) => {
    setDraft((d) => {
      const next = d.contentTypes.includes(value)
        ? d.contentTypes.filter((v) => v !== value)
        : [...d.contentTypes, value];
      return { ...d, contentTypes: next };
    });
  };

  const handleToggleProduct = (id) => {
    setDraft((d) => {
      if (d.products.some((p) => p.id === id)) {
        return { ...d, products: d.products.filter((p) => p.id !== id) };
      }
      const product = mockProducts.find((p) => p.id === id);
      return product ? { ...d, products: [...d.products, product] } : d;
    });
  };

  const handleClearAllProducts = () => update({ products: [] });

  const previewRow = revalidateBulkRow({
    ...row,
    retailer: draft.retailer,
    productTitle: draft.products[0]?.description ?? null,
    products: draft.products,
  });
  const isIncomplete = previewRow.status === "issue";

  const titleMissing = draft.title.trim() === "";
  const dateMissing = draft.date === "";
  const contentTypeMissing = draft.contentTypes.length === 0;

  const handleSave = () => {
    const dateKey = isBrandRequest ? "dueDate" : "launchDate";
    const primary = draft.products[0];
    onSave({
      title: draft.title,
      description: draft.description,
      retailer: draft.retailer || null,
      contentTypes: draft.contentTypes,
      contentType: draft.contentTypes[0] ?? null,
      [dateKey]: draft.date || null,
      assignee: draft.assignee || null,
      products: draft.products,
      productTitle: primary?.description ?? null,
      brand: primary?.brand ?? null,
      upc: primary?.upc ?? null,
    });
  };

  return (
    <Drawer
      title={`Edit: ${row.title || "Untitled ticket"}`}
      widthClass="w-[800px]"
      onCancel={onCancel}
      subtitle={
        <div className="mt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-base-content/50">
              {REQUEST_TYPE_LABELS[row.requestType] ?? row.requestType}
            </span>
            <span className={`badge badge-sm gap-1 ${isIncomplete ? "badge-soft badge-error" : "badge-soft badge-success"}`}>
              {isIncomplete ? "Incomplete" : "Ready"}
            </span>
          </div>
          {isIncomplete && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-error">
              <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {previewRow.issueReason || "Incomplete"}
            </p>
          )}
        </div>
      }
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Ticket details</p>

          <Input
            label="Request title"
            labelInfo="Name of the request that will appear in the queue."
            required
            value={draft.title}
            onChange={(e) => update({ title: e.target.value })}
            error={titleMissing ? "Request title is required." : undefined}
          />

          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text text-sm font-semibold text-base-content inline-flex items-center gap-1">
                Task description
                <FieldInfoTooltip text="Describe the requested content change or issue to be resolved." />
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Retailer"
              required
              value={draft.retailer}
              options={RETAILER_OPTIONS}
              onChange={(e) => update({ retailer: e.target.value })}
              hint="A ticket with no retailer is marked Incomplete."
            />
            <Input
              label={dateLabel}
              labelInfo="Date when this request should be completed or launched."
              type="date"
              required
              value={draft.date}
              onChange={(e) => update({ date: e.target.value })}
              error={dateMissing ? `${dateLabel} is required.` : undefined}
            />
            <Select
              label="Assignee"
              labelInfo="Team member responsible for working this request."
              value={draft.assignee}
              options={mockAssignees}
              onChange={(e) => update({ assignee: e.target.value })}
              hint="Optional"
            />
            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text text-sm font-semibold text-base-content inline-flex items-center gap-1">
                  Content type
                  <span className="text-error ml-0.5">*</span>
                  <FieldInfoTooltip text="Select the content assets needed for this request." />
                </span>
              </label>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                {contentTypeOptions.map((opt) => (
                  <Checkbox
                    key={opt.value}
                    label={opt.label}
                    checked={draft.contentTypes.includes(opt.value)}
                    onChange={() => toggleContentType(opt.value)}
                  />
                ))}
              </div>
              {contentTypeMissing && (
                <span className="text-xs text-error mt-1 block">Select at least one content type.</span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-base-300 pt-4">
          <ProductLookupTable
            selectedProducts={draft.products}
            onToggleProduct={handleToggleProduct}
            onClearAll={handleClearAllProducts}
            showIntro={false}
            showSelectionSummary={false}
            showAllProductsCount
            enableSelectedSearch
            selectedSearchPlaceholder="Search selected products"
            allSearchPlaceholder="Search by product name, brand, UPC, EAN, GTIN, or retailer"
            maxVisibleRows={PRODUCT_TABLE_MAX_ROWS}
            defaultViewMode="selected"
            selectedTabFirst
          />
        </div>
      </div>
    </Drawer>
  );
}
