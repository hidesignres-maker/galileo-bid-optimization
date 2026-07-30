import { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { AppShell } from "../components/AppShell";
import { ProductLookupTable } from "../components/ProductLookupTable";
import { Button } from "../components/ui/Button";
import { InfoBanner } from "../components/ui/InfoBanner";
import { mockProducts } from "../data/mockProducts";

/**
 * ProductSelectionDemo — isolated stakeholder-testing entry point for the
 * Product Selection experience, reachable at /product-selection.
 *
 * This page is a thin composition wrapper only. It does not reimplement
 * search, retailer filtering, tab switching, or selection persistence —
 * all of that lives in ProductLookupTable.jsx (the exact same component
 * VizID/Brand Request use inside ManualRequestWizard) and is reused here
 * unchanged, unforked.
 *
 * The only local state this page owns is `products` — the selected-products
 * array — because ProductLookupTable is intentionally "dumb" about
 * selection: it takes `selectedProducts` + `onToggleProduct`/`onClearAll`
 * and lets the parent own the array. ManualRequestWizard.jsx owns this same
 * shape of state for its Select Products step; this page owns an identical,
 * separate copy scoped to this demo only (nothing here reads or writes the
 * wizard's requests/products, mockRequests, or any request model).
 *
 * No Details step, no Review/Create step, no Queue — per this page's scope,
 * stakeholders test search/filter/persistence in isolation, then use
 * "View full request flow" to go build a real request via the existing
 * flow at "/".
 */
export function ProductSelectionDemo({ onNavigateHome }) {
  const [products, setProducts] = useState([]);
  const [justConfirmed, setJustConfirmed] = useState(false);

  // Same toggle/clear-all shape ManualRequestWizard.jsx uses for its own
  // `products` state — not imported from there (it isn't exported as a
  // standalone helper), but not a fork of any product-selection *logic*
  // either: this is just the small parent-side state glue every consumer
  // of ProductLookupTable is required to supply, since the component
  // itself holds no selection state of its own.
  const toggleProduct = (id) => {
    setJustConfirmed(false);
    setProducts((prev) => {
      if (prev.some((p) => p.id === id)) return prev.filter((p) => p.id !== id);
      const product = mockProducts.find((p) => p.id === id);
      return product ? [...prev, product] : prev;
    });
  };

  const clearAllProducts = () => {
    setJustConfirmed(false);
    setProducts([]);
  };

  const handleReviewSelection = () => setJustConfirmed(true);

  return (
    <AppShell showSectionTabs={false}>
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content mb-6"
          onClick={onNavigateHome}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          View full request flow
        </button>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-base-content">Product Selection (isolated demo)</h1>
          <p className="text-sm text-base-content/60 mt-1 max-w-2xl">
            This isolated view lets you test product search, retailer filtering, and persistent
            selection without completing the full request flow.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <ProductLookupTable
            selectedProducts={products}
            onToggleProduct={toggleProduct}
            onClearAll={clearAllProducts}
          />

          {justConfirmed && (
            <InfoBanner variant="success">
              Selection confirmed — {products.length} product{products.length === 1 ? "" : "s"}{" "}
              currently selected. Nothing was submitted; this is a search/filter/persistence test
              only.
            </InfoBanner>
          )}

          <div className="flex justify-end">
            <Button onClick={handleReviewSelection} disabled={products.length === 0}>
              Review selection
            </Button>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
