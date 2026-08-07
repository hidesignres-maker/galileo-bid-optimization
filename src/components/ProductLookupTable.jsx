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

function matchesProductQuery(product, q, retailerFilter) {
  const matchesRetailer = retailerFilter === "all" || product.retailers.includes(retailerFilter);
  if (!matchesRetailer) return false;
  if (!q) return true;
  return (
    product.description.toLowerCase().includes(q) ||
    product.brand.toLowerCase().includes(q) ||
    product.upc.includes(q) ||
    product.ean.includes(q) ||
    product.retailers.some((r) => retailerLabel(r).toLowerCase().includes(q) || r.toLowerCase().includes(q))
  );
}

/**
 * ProductLookupTable — shared by VizID Change and Brand Request manual mode,
 * and (Aug 2026 Bulk Edit Ticket pass) the Bulk CSV Edit Ticket drawer.
 *
 * Product-first selection model: search (live, no Enter required) ->
 * optionally narrow by a single-select retailer filter -> check products ->
 * change search or retailer -> selection persists -> review the accumulated
 * selection via the "Selected Products" tab.
 *
 * `selectedProducts` is the caller's own products array, passed straight
 * through — this component holds no parallel copy of "which products are
 * selected." Checking a row (in either tab) calls `onToggleProduct(id)`,
 * which adds/removes that product directly in the caller's own state.
 *
 * Search fields: product description, brand, UPC, EAN, retailer (name or
 * code). Note: mockProducts has no `gtin` field (only `upc`/`ean`) — not
 * invented here; flagged separately as an open data-model question.
 *
 * The All Products / Selected Products view toggle renders via the shared
 * `Tab` primitive (ui/Tab.jsx) — the Figma-approved tab-item geometry
 * (40px height, 12px horizontal padding, transparent background in every
 * state, blue underline only when active).
 *
 * Opt-in extension props (Bulk Edit Ticket pass) — every one of these
 * defaults to this component's exact original behavior, so ManualRequestWizard
 * and ProductSelectionDemo render byte-identical to before this pass:
 *  - `showIntro` (default true) — the "Select products" heading/description.
 *  - `showSelectionSummary` (default true) — the "{N} products selected"
 *    line above the tabs. The Bulk drawer disables this: its Selected
 *    Products tab count is the only selection count shown, per the approved
 *    "no redundant N selected metadata" rule.
 *  - `showAllProductsCount` (default false) — shows the total catalog size
 *    next to "All Products", e.g. "All Products (1,230)". Deliberately the
 *    full catalog size, not the current filtered result count, so it keeps
 *    reading as "how big is this catalog" (the point of showing it at all)
 *    rather than jumping around as the user types.
 *  - `enableSelectedSearch` (default false) — when true, the search input
 *    and retailer filter are live (not disabled/dimmed) while on the
 *    Selected Products tab, and filter `selectedProducts` itself. Query and
 *    retailer-filter state is shared across tabs (same as the original
 *    single-input design) — switching tabs re-scopes the same query against
 *    whichever product list is active, rather than introducing a second,
 *    parallel set of search state.
 *  - `selectedSearchPlaceholder` / `allSearchPlaceholder` — per-tab search
 *    placeholder overrides. Both default to this component's original copy.
 *  - `maxVisibleRows` (default undefined = unbounded, original behavior) —
 *    caps the rendered table to this many rows (of the current
 *    search/filter/tab result set), with a small "Showing X of Y" note
 *    beneath the table when the result set exceeds the cap. Exists so a
 *    large catalog (1,000+ products) never renders an uncontrolled list;
 *    with today's 10-item mock catalog this rarely engages.
 *  - `defaultViewMode` (default `"all"`, original behavior) — which tab is
 *    active on mount. The Bulk Edit Ticket drawer passes `"selected"` so a
 *    ticket that already has products opens showing them, instead of
 *    landing on All Products first.
 *  - `selectedTabFirst` (default `false`, original order/behavior) — when
 *    true, renders "Selected Products (N)" before "All Products (N)"
 *    instead of after. The Bulk Edit Ticket drawer passes `true`;
 *    ManualRequestWizard/ProductSelectionDemo omit it and keep today's
 *    All-Products-first order.
 */
export function ProductLookupTable({
  selectedProducts,
  onToggleProduct,
  onClearAll,
  showIntro = true,
  showSelectionSummary = true,
  showAllProductsCount = false,
  enableSelectedSearch = false,
  selectedSearchPlaceholder = "Search selected products…",
  allSearchPlaceholder = "Search by description, brand, UPC, EAN, or retailer…",
  maxVisibleRows,
  defaultViewMode = "all",
  selectedTabFirst = false,
}) {
  const [query, setQuery] = useState("");
  const [retailerFilter, setRetailerFilter] = useState("all");
  const [viewMode, setViewMode] = useState(defaultViewMode); // "all" | "selected"

  const isSelectedView = viewMode === "selected";
  const searchIsActive = !isSelectedView || enableSelectedSearch;

  const selectedIds = useMemo(() => new Set(selectedProducts.map((p) => p.id)), [selectedProducts]);

  const q = query.trim().toLowerCase();

  const allResults = useMemo(
    () => mockProducts.filter((p) => matchesProductQuery(p, q, retailerFilter)),
    [q, retailerFilter]
  );

  // Selected Products only ever filters the caller's own selection array,
  // never the full catalog — searching/filtering here can narrow which
  // selected products are shown, but can never add to or remove from the
  // selection itself.
  const selectedResults = useMemo(
    () => (enableSelectedSearch ? selectedProducts.filter((p) => matchesProductQuery(p, q, retailerFilter)) : selectedProducts),
    [enableSelectedSearch, selectedProducts, q, retailerFilter]
  );

  const visibleResults = isSelectedView ? selectedResults : allResults;
  const boundedResults = maxVisibleRows ? visibleResults.slice(0, maxVisibleRows) : visibleResults;
  const isTruncated = Boolean(maxVisibleRows) && visibleResults.length > maxVisibleRows;

  const selectedCount = selectedProducts.length;

  return (
    <div className="flex flex-col gap-3">
      {showIntro && (
        <div>
          <h3 className="text-sm font-semibold text-base-content">Select products</h3>
          <p className="text-xs text-base-content/60 mt-0.5">
            Search across retailers and select the products this request covers.
          </p>
        </div>
      )}

      {showSelectionSummary && (
        <p className="text-sm font-semibold text-base-content">
          {selectedCount} product{selectedCount === 1 ? "" : "s"} selected
        </p>
      )}

      {/* Input/Select both hardcode `w-full` on their own root element, so
          passing a width via containerClassName competes with that same
          property instead of overriding it. Sizing each control from a
          dedicated wrapper div sidesteps that conflict, so search reliably
          dominates the row. In Selected Products (when search there isn't
          enabled), both controls are disabled + dimmed rather than
          unmounted — they don't apply to this view, but keeping them in
          place avoids a layout shift between tabs. */}
      <div className={`flex items-center gap-3 ${!searchIsActive ? "opacity-50" : ""}`}>
        <div className="flex-1">
          <Input
            icon={MagnifyingGlassIcon}
            placeholder={isSelectedView ? selectedSearchPlaceholder : allSearchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!searchIsActive}
          />
        </div>
        <div className="w-44 shrink-0">
          <Select
            value={retailerFilter}
            onChange={(e) => setRetailerFilter(e.target.value)}
            options={RETAILER_FILTER_OPTIONS}
            disabled={!searchIsActive}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-base-300">
        <div className="flex items-center gap-1">
          {selectedTabFirst ? (
            <>
              <Tab active={isSelectedView} onClick={() => setViewMode("selected")}>
                Selected Products ({selectedCount})
              </Tab>
              <Tab active={viewMode === "all"} onClick={() => setViewMode("all")}>
                All Products{showAllProductsCount ? ` (${mockProducts.length.toLocaleString()})` : ""}
              </Tab>
            </>
          ) : (
            <>
              <Tab active={viewMode === "all"} onClick={() => setViewMode("all")}>
                All Products{showAllProductsCount ? ` (${mockProducts.length.toLocaleString()})` : ""}
              </Tab>
              <Tab active={isSelectedView} onClick={() => setViewMode("selected")}>
                Selected Products ({selectedCount})
              </Tab>
            </>
          )}
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
        <>
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
              {boundedResults.map((p) => (
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
                    {isSelectedView ? "No selected products match this search." : `No products match "${query}".`}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          {isTruncated && (
            <p className="text-xs text-base-content/50">
              Showing {boundedResults.length} of {visibleResults.length.toLocaleString()} — refine your search to narrow results.
            </p>
          )}
        </>
      )}
    </div>
  );
}
