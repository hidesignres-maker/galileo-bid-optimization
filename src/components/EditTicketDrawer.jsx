import { useState } from "react";
import { MagnifyingGlassIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Drawer } from "./ui/Drawer";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { ProductImageThumb } from "./ui/ProductImageThumb";
import { mockRetailers } from "../data/mockRetailers";
import { mockProducts } from "../data/mockProducts";
import { CONTENT_TYPE_OPTIONS_BY_FLOW, REQUEST_TYPE_LABELS } from "../data/formOptions";
import { getPlaceholderProductImage } from "../data/productImages";
import { revalidateBulkRow } from "../lib/bulkRowValidation";

const RETAILER_OPTIONS = mockRetailers.map((r) => ({ value: r.code, label: r.name }));
const SEARCH_PAGE_SIZE = 5;
const SEARCH_MAX_RESULTS = 10;

function matchesQuery(product, q) {
  const haystack = [product.description, product.brand, product.upc, product.ean].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(q);
}

/** Field label/value pair for the compact metadata line under the drawer title. */
function MetaLine({ children }) {
  return <p className="text-xs text-base-content/50 mt-0.5">{children}</p>;
}

/**
 * EditTicketDrawer — replaces EditTicketModal (Aug 2026 drawer pass).
 * Right-side Drawer (ui/Drawer.jsx), not a modal — see BulkReviewStep's
 * doc comment / the pre-implementation report for the full rationale
 * (no existing drawer primitive, DaisyUI's own `.drawer` isn't an
 * accessible dialog, Modal's focus-trap logic is reused via the shared
 * `useDialogFocusTrap` hook rather than rebuilt).
 *
 * Three body sections, per the approved layout — never combined into one
 * dense block:
 *  A. Ticket details — Request type (read-only), Title, Description
 *     (full width), then a 2-column grid: Retailer / Content Type,
 *     Date / Customer ID. Request type is shown but not editable — it
 *     governs which CSV template/date field applies to this row, and
 *     changing it isn't a supported edit in this pass.
 *  B. Selected products — a compact list of everything currently on this
 *     ticket (thumbnail, description, brand, UPC, retailer, Remove).
 *     Empty state: "No products selected". This UI does NOT imply a
 *     permanent one-product limit — see `draft.products` below.
 *  C. Find and add products — bounded search (5 results initially, up to
 *     10 via "Show more", never more) over the existing product catalog.
 *     Adding never overwrites Selected products, it appends (with
 *     duplicate-by-id prevention) — a real change from the old modal's
 *     overwrite-only single slot. The search query is preserved after
 *     adding a result, so a user can add several matches from one search
 *     without retyping.
 *
 * Multi-product data shape: `draft.products` is seeded from `row.products`
 * (the new additive array field, lib/models.js) when present, else
 * migrated from the row's legacy flat `productTitle`/`brand`/`upc` fields
 * into the same one-item array shape, so a row that already had a single
 * product (e.g. an Innovation-track row) shows up correctly as "Selected
 * products (1)" rather than looking unmatched. On Save, `products` is
 * written back as a real array (multi-product now genuinely persists),
 * and the first entry is also mirrored into the legacy flat fields
 * (`productTitle`/`brand`/`upc`) purely for backward compatibility with
 * code that still reads those directly (BulkReviewStep's product-identity
 * fallback, and eventually `bulkRowToRequest`'s Innovation `itemInputs`
 * derivation) — nothing downstream needed to change to support this.
 *
 * Validation summary (drawer header): recomputed live from the current
 * draft via the same `revalidateBulkRow` adapter Save itself uses (a pure,
 * side-effect-free preview call) — so the "issue to resolve" line updates
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

  const [draft, setDraft] = useState({
    title: row.title ?? "",
    description: row.description ?? "",
    retailer: row.retailer ?? "",
    contentType: row.contentType ?? "",
    date: initialDate ?? "",
    customerId: row.customerId ?? "",
    products: initialProducts,
  });
  const [productQuery, setProductQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(SEARCH_PAGE_SIZE);

  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const isSelected = (id) => draft.products.some((p) => p.id === id);

  const handleAddProduct = (product) => {
    if (isSelected(product.id)) return;
    update({ products: [...draft.products, product] });
  };

  const handleRemoveProduct = (id) => {
    update({ products: draft.products.filter((p) => p.id !== id) });
  };

  const q = productQuery.trim().toLowerCase();
  const allResults = q ? mockProducts.filter((p) => matchesQuery(p, q)) : [];
  const visibleResults = allResults.slice(0, visibleCount);
  const canShowMore = visibleCount < Math.min(allResults.length, SEARCH_MAX_RESULTS);

  const previewRow = revalidateBulkRow({
    ...row,
    retailer: draft.retailer,
    productTitle: draft.products[0]?.description ?? null,
    products: draft.products,
  });

  const handleSave = () => {
    const dateKey = isBrandRequest ? "dueDate" : "launchDate";
    const primary = draft.products[0];
    onSave({
      title: draft.title,
      description: draft.description,
      retailer: draft.retailer || null,
      contentType: draft.contentType || null,
      [dateKey]: draft.date || null,
      customerId: draft.customerId || null,
      products: draft.products,
      productTitle: primary?.description ?? null,
      brand: primary?.brand ?? null,
      upc: primary?.upc ?? null,
    });
  };

  return (
    <Drawer
      title="Edit ticket"
      widthClass="w-[800px]"
      onCancel={onCancel}
      subtitle={
        <>
          <MetaLine>
            {REQUEST_TYPE_LABELS[row.requestType] ?? row.requestType}
            {row.id ? ` · ID ${row.id}` : ""}
          </MetaLine>
          {previewRow.status === "issue" ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-error">
              <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              1 issue to resolve — {previewRow.issueReason || "Needs attention"}
            </p>
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-success">
              <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Ready to create
            </p>
          )}
        </>
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
          <Input label="Title" value={draft.title} onChange={(e) => update({ title: e.target.value })} />
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text text-sm font-semibold text-base-content">Description</span>
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
              hint="A ticket with no retailer is flagged Needs attention."
            />
            <Select
              label="Content Type"
              value={draft.contentType}
              options={contentTypeOptions}
              onChange={(e) => update({ contentType: e.target.value })}
            />
            <Input label={dateLabel} type="date" value={draft.date} onChange={(e) => update({ date: e.target.value })} />
            <Input label="Customer ID" value={draft.customerId} onChange={(e) => update({ customerId: e.target.value })} />
          </div>
        </div>

        <div className="border-t border-base-300 pt-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
            Selected products ({draft.products.length})
          </p>
          {draft.products.length === 0 ? (
            <p className="text-sm text-base-content/50 italic">No products selected</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {draft.products.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-box border border-base-300 bg-base-100 p-3"
                >
                  <ProductImageThumb src={getPlaceholderProductImage(p.upc || p.id)} alt={p.description} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-base-content truncate">{p.description}</p>
                    <p className="text-xs text-base-content/50 truncate">
                      {[p.brand, p.upc].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <Button variant="ghost" size="small" onClick={() => handleRemoveProduct(p.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-base-300 pt-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Find and add products</p>
          <Input
            icon={MagnifyingGlassIcon}
            placeholder="Search by product name, brand, UPC, EAN, GTIN, or retailer"
            value={productQuery}
            onChange={(e) => {
              setProductQuery(e.target.value);
              setVisibleCount(SEARCH_PAGE_SIZE);
            }}
          />

          {q && (
            <>
              <ul className="border border-base-300 rounded-box divide-y divide-base-300">
                {visibleResults.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                    <ProductImageThumb src={getPlaceholderProductImage(p.upc)} alt={p.description} size="w-8 h-8" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-base-content truncate">{p.description}</p>
                      <p className="text-xs text-base-content/50">
                        {p.brand} · {p.upc}
                      </p>
                    </div>
                    <Button
                      variant={isSelected(p.id) ? "outline" : "outline"}
                      size="small"
                      disabled={isSelected(p.id)}
                      onClick={() => handleAddProduct(p)}
                    >
                      {isSelected(p.id) ? "Added" : "Add"}
                    </Button>
                  </li>
                ))}
                {allResults.length === 0 && (
                  <li className="px-3 py-2 text-sm text-base-content/50">No matches.</li>
                )}
              </ul>
              {canShowMore && (
                <button
                  type="button"
                  className="link text-sm self-start"
                  onClick={() => setVisibleCount((c) => Math.min(c + SEARCH_PAGE_SIZE, SEARCH_MAX_RESULTS))}
                >
                  Show more
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
}
