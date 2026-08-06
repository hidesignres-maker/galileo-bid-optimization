import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Table } from "./ui/Table";
import { Checkbox } from "./ui/Checkbox";
import { Button } from "./ui/Button";
import { Tab } from "./ui/Tab";
import { mockProducts } from "../data/mockProducts";
import { mockRetailers } from "../data/mockRetailers";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

// Retailer filter is single-select, per this pass's scope. Options are
// derived from the same mockRetailers list used elsewhere (Queue filter,
// RetailerDatesStep) — no invented retailer values.
const RETAILER_FILTER_OPTIONS = [
  { value: "all", label: "All retailers" },
  ...mockRetailers.map((r) => ({ value: r.code, label: r.name })),
];

/**
 * ProductLookupTable — shared by VizID Change and Brand Request manual mode.
 *
 * Product-first selection model: search (live, no Enter required) ->
 * optionally narrow by a single-select retailer filter -> check products ->
 * change search or retailer -> selection persists -> review the accumulated
 * selection via the "Selected Products" tab.
 *
 * `selectedProducts` is the wizard's own `products` array (owned by
 * ManualRequestWizard) passed straight through — this component holds no
 * parallel copy of "which products are selected." Checking a row (in either
 * tab) calls `onToggleProduct(id)`, which adds/removes that product
 * directly in wizard state.
 *
 * UI-only simplification history around that already-working persistence
 * logic: removed the redundant selection-summary action bar (the tabs
 * already provide "view selected"), removed "Select all N results" (out of
 * scope for validating persistence), moved "Clear all" so it only appears
 * inside the Selected Products tab, and (most recently) removed the
 * trailing "N results shown · N selected overall" / "N selected products"
 * line that used to render below the table — it duplicated the selected
 * count already shown above the tabs and in the "Selected Products (N)"
 * tab label, with no additional information of its own.
 *
 * Search fields: product description, brand, UPC, EAN, retailer (name or
 * code). Note: mockProducts has no `gtin` field (only `upc`/`ean`) — not
 * invented here; flagged separately as an open data-model question.
 *
 * The All Products / Selected Products view toggle renders via the shared
 * `Tab` primitive (ui/Tab.jsx) — the Figma-approved tab-item geometry
 * (40px height, 12px horizontal padding, transparent background in every
 * state, blue underline only when active). `viewMode` state and switching
 * behavior are unchanged; only the button markup moved to the shared
 * component.
 */
export function ProductLookupTable({ selectedProducts, onToggleProduct, onClearAll }) {
  const [query, setQuery] = useState("");
  const [retailerFilter, setRetailerFilter] = useState("all");
  const [viewMode, setViewMode] = useState("all"); // "all" | "selected"

  const isSelectedView = viewMode === "selected";

  const selectedIds = useMemo(() => new Set(selectedProducts.map((p) => p.id)), [selectedProducts]);

  const allResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockProducts.filter((p) => {
      const matchesRetailer = retailerFilter === "all" || p.retailers.includes(retailerFilter);
      if (!matchesRetailer) return false;
      if (!q) return true;
      return (
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.upc.includes(q) ||
        p.ean.includes(q) ||
        p.retailers.some((r) => retailerLabel(r).toLowerCase().includes(q) || r.toLowerCase().includes(q))
      );
    });
  }, [query, retailerFilter]);

  // Selected Products ignores the current search/retailer filter, so the
  // full accumulated selection is always reviewable in one place.
  const visibleResults = isSelectedView ? selectedProducts : allResults;

  const selectedCount = selectedProducts.length;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-base-content">Select products</h3>
        <p className="text-xs text-base-content/60 mt-0.5">
          Search across retailers and select the products this request covers.
        </p>
      </div>

      <p className="text-sm font-semibold text-base-content">
        {selectedCount} product{selectedCount === 1 ? "" : "s"} selected
      </p>

      {/* Input/Select both hardcode `w-full` on their own root element, so
          passing a width via containerClassName competes with that same
          property instead of overriding it. Sizing each control from a
          dedicated wrapper div sidesteps that conflict, so search reliably
          dominates the row. In Selected Products, both controls are
          disabled + dimmed rather than unmounted — they don't apply to this
          view, but keeping them in place avoids a layout shift between
          tabs. */}
      <div className={`flex items-center gap-3 ${isSelectedView ? "opacity-50" : ""}`}>
        <div className="flex-1">
          <Input
            icon={MagnifyingGlassIcon}
            placeholder="Search by description, brand, UPC, EAN, or retailer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSelectedView}
          />
        </div>
        <div className="w-44 shrink-0">
          <Select
            value={retailerFilter}
            onChange={(e) => setRetailerFilter(e.target.value)}
            options={RETAILER_FILTER_OPTIONS}
            disabled={isSelectedView}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-base-300">
        <div className="flex items-center gap-1">
          <Tab active={viewMode === "all"} onClick={() => setViewMode("all")}>
            All Products
          </Tab>
          <Tab active={isSelectedView} onClick={() => setViewMode("selected")}>
            Selected Products ({selectedCount})
          </Tab>
        </div>

        {isSelectedView && selectedCount > 0 && (
          <Button variant="text" size="sm" className="text-error mb-2" onClick={onClearAll}>
            Clear all
          </Button>
        )}
      </div>

      {isSelectedView && selectedCount === 0 ? (
        <div className="flex flex-col items-center text-center gap-2 py-10 px-4">
          <p className="text-sm font-semibold text-base-content">No products selected yet</p>
          <p className="text-xs text-base-content/60 max-w-sm">
            Select products from the All Products tab. Your selections will remain saved as you search
            or switch retailer filters.
          </p>
          <Button variant="outline" size="sm" className="mt-1" onClick={() => setViewMode("all")}>
            Browse all products
          </Button>
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th className="w-10" />
              <th>Product Description</th>
              <th>Brand</th>
              <th>EAN</th>
              <th>Retailers</th>
            </tr>
          </thead>
          <tbody>
            {visibleResults.map((p) => (
              <tr key={p.id} className="hover:bg-base-200/60">
                <td>
                  <Checkbox checked={selectedIds.has(p.id)} onChange={() => onToggleProduct(p.id)} />
                </td>
                <td className="text-base-content">{p.description}</td>
                <td className="text-base-content/70">{p.brand}</td>
                <td className="text-base-content/70">{p.ean}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {p.retailers.map((r) => (
                      <span key={r} className="badge badge-sm badge-ghost">
                        {retailerLabel(r)}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {visibleResults.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-sm text-base-content/50 py-6">
                  No products match "{query}".
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}
