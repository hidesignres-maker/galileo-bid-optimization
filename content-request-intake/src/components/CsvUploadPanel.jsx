import { useState } from "react";
import { UploadDropzone } from "./ui/UploadDropzone";
import { InfoBanner } from "./ui/InfoBanner";
import { Table } from "./ui/Table";
import { mockImportedProducts, mockImportSummary } from "../data/mockImportedProducts";
import { mockInnovationItems, mockInnovationImportSummary } from "../data/mockInnovationItems";
import { mockRetailers } from "../data/mockRetailers";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

const TEMPLATE_COLUMNS = {
  vizId: "Product Description, Brand, EAN, Retailers, Launch Date, Content Type",
  brandRequest: "Product Description, Brand, EAN, Retailers, Launch Date, Content Type",
  innovation:
    "UPC, Retailer, Customer_ID, Product_title, Brand, On_sale_date (Start_ship_date, eComm_pack_details conditional)",
};

function ImportedProductsPreview({ requestType }) {
  const showLaunchAndContentType = requestType === "brandRequest";
  return (
    <div className="flex flex-col gap-3">
      <InfoBanner variant="success" title="Import complete">
        {mockImportSummary.totalRows} rows uploaded · {mockImportSummary.matchedRows} matched ·{" "}
        {mockImportSummary.unmatchedRows} unmatched (shown below for review)
      </InfoBanner>

      <Table>
        <thead>
          <tr>
            <th>Product Description</th>
            <th>Brand</th>
            <th>EAN</th>
            <th>Retailers</th>
            {showLaunchAndContentType && (
              <>
                <th>Launch Date</th>
                <th>Content Type</th>
              </>
            )}
            <th>Match Status</th>
          </tr>
        </thead>
        <tbody>
          {mockImportedProducts.map((row) => (
            <tr key={row.id} className={!row.matched ? "bg-error/5" : ""}>
              <td className={row.matched ? "text-base-content" : "text-base-content/50 italic"}>
                {row.description}
              </td>
              <td className="text-base-content/70">{row.brand}</td>
              <td className="text-base-content/70">{row.ean}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {row.retailers.map((r) => (
                    <span key={r} className="badge badge-sm badge-ghost">
                      {retailerLabel(r)}
                    </span>
                  ))}
                </div>
              </td>
              {showLaunchAndContentType && (
                <>
                  <td className="text-base-content/70">{row.launchDate}</td>
                  <td className="text-base-content/70">{row.contentType}</td>
                </>
              )}
              <td>
                <span className={`badge badge-sm ${row.matched ? "badge-success" : "badge-error"}`}>
                  {row.matched ? "Matched" : "Unmatched"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <InfoBanner variant="warning" title="Open questions (not yet decided)">
        All-or-nothing vs. row-by-row validation, and whether imported rows are editable
        after upload, are still open — see Open Questions panel below. This preview is
        review-only until that's resolved.
      </InfoBanner>
    </div>
  );
}

function ImportedItemInputsPreview() {
  return (
    <div className="flex flex-col gap-3">
      <InfoBanner variant="success" title="Import complete">
        CSV import summary: {mockInnovationImportSummary.totalRows} rows uploaded ·{" "}
        {mockInnovationImportSummary.importedRows} item inputs imported
      </InfoBanner>

      <Table>
        <thead>
          <tr>
            <th>UPC</th>
            <th>Retailer</th>
            <th>Customer ID</th>
            <th>Product Title</th>
            <th>Brand</th>
            <th>Start Ship Date</th>
            <th>On Sale Date</th>
            <th>eComm Pack Details</th>
          </tr>
        </thead>
        <tbody>
          {mockInnovationItems.map((row) => (
            <tr key={row.id}>
              <td className="text-base-content/70">{row.upc}</td>
              <td className="text-base-content/70">{retailerLabel(row.retailer)}</td>
              <td className="text-base-content/70">{row.customerId}</td>
              <td className="text-base-content">{row.productTitle}</td>
              <td className="text-base-content/70">{row.brand}</td>
              <td className="text-base-content/70">
                {row.startShipDate || (row.retailer === "AMZ" ? "— missing" : "—")}
              </td>
              <td className="text-base-content/70">{row.onSaleDate}</td>
              <td className="text-base-content/70">{row.ecommPackDetails || "—"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

/**
 * CsvUploadPanel — shared CSV upload + import preview for all three flows.
 * No real parsing: selecting any file simulates the fixed mock import result
 * for the current requestType after a short delay.
 */
export function CsvUploadPanel({ requestType, onImportComplete }) {
  const [status, setStatus] = useState("idle"); // idle | processing | done

  const handleFileSelected = () => {
    setStatus("processing");
    setTimeout(() => setStatus("done"), 600);
  };

  const handleContinue = () => {
    if (requestType === "innovation") {
      onImportComplete(mockInnovationItems);
    } else {
      onImportComplete(mockImportedProducts.filter((r) => r.matched));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {status === "idle" && (
        <UploadDropzone
          label="Drag & drop a CSV, or click to browse"
          hint={`Expected columns: ${TEMPLATE_COLUMNS[requestType]}`}
          onFileSelected={handleFileSelected}
        />
      )}

      {status === "processing" && (
        <div className="flex items-center gap-2 text-sm text-base-content/60 py-6 justify-center">
          <span className="loading loading-spinner loading-sm" />
          Processing import…
        </div>
      )}

      {status === "done" && (
        <>
          {requestType === "innovation" ? (
            <ImportedItemInputsPreview />
          ) : (
            <ImportedProductsPreview requestType={requestType} />
          )}
          <div className="flex justify-end">
            <button type="button" className="btn btn-sm btn-primary" onClick={handleContinue}>
              Continue to Retailers
            </button>
          </div>
        </>
      )}
    </div>
  );
}
