/**
 * mockRetailers — retailer list used across Step 3 (RetailerDateGroups)
 * `code` drives conditional logic (e.g. AMZ requires Start Ship Date in Innovation).
 */
export const mockRetailers = [
  { code: "AMZ", name: "Amazon" },
  { code: "WMT", name: "Walmart" },
  { code: "TGT", name: "Target" },
  { code: "KR", name: "Kroger" },
  { code: "CSCO", name: "Costco" },
  { code: "SAMS", name: "Sam's Club" },
  { code: "ICART", name: "Instacart" },
];

export const getRetailerByCode = (code) => mockRetailers.find((r) => r.code === code);
