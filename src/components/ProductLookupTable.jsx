import { useMemo, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "./ui/Input";
import { Table } from "./ui/Table";
import { Checkbox } from "./ui/Checkbox";
import { mockProducts } from "../data/mockProducts";
import { mockRetailers } from "../data/mockRetailers";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

/**
 * ProductLookupTable — shared by VizID Change and Brand Request manual mode.
 * Search by name / brand / UPC / EAN / retailer. Selected rows are added to
 * `products` in wizard state via onAddSelected.
 *
 * Columns: Checkbox, Product Description, Brand, EAN, Retailers
 * (identical for both flows per the "shared component" key rule).
 */
export function ProductLookupTable({ selectedProductIds, onToggleProduct, onAddSelected }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockProducts;
    return mockProducts.filter((p) => {
      return (
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.upc.includes(q) ||
        p.ean.includes(q) ||
        p.retailers.some((r) => retailerLabel(r).toLowerCase().includes(q) || r.toLowerCase().includes(q))
      );
    });
  }, [query]);

  const selectedCount = selectedProductIds.size;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Input
          containerClassName="max-w-md"
          placeholder="Search by name, brand, UPC, EAN, or retailer…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-sm btn-primary"
          disabled={selectedCount === 0}
          onClick={onAddSelected}
        >
          <PlusIcon className="w-4 h-4" /> Add {selectedCount > 0 ? selectedCount : ""} to request
        </button>
      </div>

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
          {results.map((p) => (
            <tr key={p.id} className="hover:bg-base-200/60">
              <td>
                <Checkbox
                  checked={selectedProductIds.has(p.id)}
                  onChange={() => onToggleProduct(p.id)}
                />
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
          {results.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-sm text-base-content/50 py-6">
                No products match "{query}".
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
