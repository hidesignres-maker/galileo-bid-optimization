/**
 * mockInnovationItems — sample Innovation item-input rows.
 * Used both as a "load sample" starting point for manual entry and as the
 * simulated preview for CSV import (ImportedItemInputsTable).
 * Start Ship Date is conditionally required when retailer === "AMZ".
 */
export const mockInnovationItems = [
  {
    id: "INN-1",
    upc: "610000112201",
    retailer: "AMZ",
    customerId: "CUST-88213",
    productTitle: "Fresh Fields Sparkling Yerba Mate, 12-pack",
    brand: "Fresh Fields",
    startShipDate: "2026-08-18",
    onSaleDate: "2026-08-25",
    ecommPackDetails: "New pack graphics, ingredient callout front panel",
  },
  {
    id: "INN-2",
    upc: "610000112218",
    retailer: "WMT",
    customerId: "CUST-88214",
    productTitle: "Fresh Fields Sparkling Yerba Mate, Single Can",
    brand: "Fresh Fields",
    startShipDate: "",
    onSaleDate: "2026-08-25",
    ecommPackDetails: "",
  },
  {
    id: "INN-3",
    upc: "610000112225",
    retailer: "ICART",
    customerId: "CUST-88215",
    productTitle: "GreenValley Protein Granola Clusters, 14oz",
    brand: "GreenValley Snacks",
    startShipDate: "",
    onSaleDate: "2026-09-01",
    ecommPackDetails: "Updated nutrition panel",
  },
];

export const mockInnovationImportSummary = {
  totalRows: 100,
  importedRows: 100,
};
