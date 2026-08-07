/**
 * groupByRetailer — derives retailerGroups (retailer + date combinations)
 * from the wizard's products/itemInputs + retailers state.
 * This is the single source of truth for the "Derived from retailer + date
 * combinations" rule — Step 3 and Step 4 both consume its output.
 */

// VizID / Brand Request: group by (retailer, launchDate) using each
// product's own retailers list and the request's default date (or the
// product's own launchDate when imported via CSV).
export function groupProductsByRetailer(products, defaultDate) {
  const groups = new Map();
  for (const product of products) {
    const date = product.launchDate || defaultDate || "";
    const retailers = product.retailers?.length ? product.retailers : ["UNASSIGNED"];
    for (const retailer of retailers) {
      const key = `${retailer}__${date}`;
      if (!groups.has(key)) groups.set(key, { retailer, date, rows: [] });
      groups.get(key).rows.push({
        productTitle: product.description,
        ean: product.ean,
        upc: product.upc,
        retailers: product.retailers ?? [],
        // Optional, backward-compatible — undefined on every product today
        // (no real image URLs added yet), so every existing consumer that
        // doesn't read this key is completely unaffected. Carried through
        // here so BrandVizReviewBody's product table can render
        // ProductImageThumb without a second lookup back into `products`.
        imageUrl: product.imageUrl,
      });
    }
  }
  return Array.from(groups.values()).sort((a, b) => a.retailer.localeCompare(b.retailer));
}

// Innovation: group by (retailer, onSaleDate) using each item input's own
// retailer + dates (already retailer-specific by nature of the row).
export function groupItemsByRetailer(itemInputs) {
  const groups = new Map();
  for (const item of itemInputs) {
    const key = `${item.retailer}__${item.onSaleDate}`;
    if (!groups.has(key)) {
      groups.set(key, { retailer: item.retailer, date: item.onSaleDate, rows: [] });
    }
    groups.get(key).rows.push({
      upc: item.upc,
      retailer: item.retailer,
      customerId: item.customerId,
      productTitle: item.productTitle,
      brand: item.brand,
      startShipDate: item.startShipDate,
      onSaleDate: item.onSaleDate,
    });
  }
  return Array.from(groups.values()).sort((a, b) => a.retailer.localeCompare(b.retailer));
}

// Distinct retailer codes present across current groups, for Step 3's
// retailer list + remove action.
export function distinctRetailers(groups) {
  return Array.from(new Set(groups.map((g) => g.retailer)));
}

/**
 * groupProductsByLaunchDate — derives the actual output Request(s) a Brand
 * Request / VizID Change draft will create (Manual Review & Create
 * retailer-date-split pass). Same effective-date rule
 * `groupProductsByRetailer` already uses per retailer
 * (`product.launchDate || defaultDate`), grouped by date instead of by
 * (retailer, date) — retailers sharing an effective date stay in one
 * group; a different effective date is a separate group.
 *
 * A product's `launchDate` is a single value applied uniformly across
 * every retailer it carries, so a product can never span two different
 * date groups — every product belongs to exactly one resulting group, and
 * that group's own `retailers` list is therefore already fully scoped
 * (no cross-group retailer leakage to reconcile). This is the same data,
 * just re-bucketed — not a new business rule.
 *
 * Not used for Innovation (no request-level launch date to split on —
 * callers gate this out entirely for that request type).
 */
export function groupProductsByLaunchDate(products, defaultDate) {
  const byDate = new Map();
  for (const product of products) {
    const date = product.launchDate || defaultDate || "";
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push(product);
  }
  return Array.from(byDate.entries())
    .map(([date, groupProducts]) => ({
      date,
      products: groupProducts,
      retailers: Array.from(
        new Set(groupProducts.flatMap((p) => (p.retailers?.length ? p.retailers : ["UNASSIGNED"])))
      ),
    }))
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
}
