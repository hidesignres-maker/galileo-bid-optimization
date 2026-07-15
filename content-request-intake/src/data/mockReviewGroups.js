/**
 * mockReviewGroups — example retailer/date grouping shape for Step 4 review.
 * Real groups are derived at runtime from products/itemInputs + retailers
 * (see src/lib/groupByRetailer.js). This file documents the expected shape
 * and can seed a "load sample" demo.
 */
export const mockReviewGroups = [
  {
    retailer: "WMT",
    date: "2026-08-04",
    rows: [
      { productTitle: "GreenValley Organic Trail Mix, 12oz", ean: "8410045678231", upc: "041220012349" },
    ],
  },
  {
    retailer: "TGT",
    date: "2026-08-04",
    rows: [
      { productTitle: "Nordic Naturals Omega-3 Fish Oil, 60ct", ean: "7350053850019", upc: "768990123456" },
    ],
  },
  {
    retailer: "KR",
    date: "2026-08-11",
    rows: [
      { productTitle: "SunBrew Cold Brew Coffee Concentrate, 32oz", ean: "4006381333931", upc: "852001234567" },
    ],
  },
];
