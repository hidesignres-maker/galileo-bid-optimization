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
