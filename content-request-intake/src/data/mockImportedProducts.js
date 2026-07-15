/**
 * mockImportedProducts — simulated CSV import result for Viz ID Change / Brand Request.
 * Represents what a parsed CSV would look like once matched against the catalog.
 * `matched: false` rows simulate the "80 of 100 matched" open question (#2).
 */
export const mockImportedProducts = [
  {
    id: "IMP-1",
    description: "GreenValley Organic Trail Mix, 12oz",
    brand: "GreenValley Snacks",
    ean: "8410045678231",
    retailers: ["WMT", "TGT", "KR"],
    launchDate: "2026-08-04",
    contentType: "Enhanced Content",
    matched: true,
  },
  {
    id: "IMP-2",
    description: "Nordic Naturals Omega-3 Fish Oil, 60ct",
    brand: "Nordic Naturals",
    ean: "7350053850019",
    retailers: ["AMZ", "TGT"],
    launchDate: "2026-08-04",
    contentType: "A+ Content",
    matched: true,
  },
  {
    id: "IMP-3",
    description: "SunBrew Cold Brew Coffee Concentrate, 32oz",
    brand: "SunBrew Coffee",
    ean: "4006381333931",
    retailers: ["KR", "ICART", "TGT"],
    launchDate: "2026-08-11",
    contentType: "Enhanced Content",
    matched: true,
  },
  {
    id: "IMP-4",
    description: "PureCare Sensitive Skin Body Wash, 16oz",
    brand: "PureCare",
    ean: "3017620422003",
    retailers: ["TGT", "AMZ", "KR"],
    launchDate: "2026-08-11",
    contentType: "A+ Content",
    matched: true,
  },
  {
    id: "IMP-5",
    description: "Unrecognized SKU — EAN not found in catalog",
    brand: "—",
    ean: "9999999999999",
    retailers: [],
    launchDate: "2026-08-11",
    contentType: "—",
    matched: false,
  },
];

export const mockImportSummary = {
  totalRows: 100,
  matchedRows: 80,
  unmatchedRows: 20,
};
