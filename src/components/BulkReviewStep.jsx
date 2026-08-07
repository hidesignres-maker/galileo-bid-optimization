import { useState } from "react";
import { ArrowUpTrayIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Card } from "./ui/Card";
import { Table, ClampCell } from "./ui/Table";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ProductImageThumb } from "./ui/ProductImageThumb";
import { CustomBadge } from "./ui/CustomBadge";
import { EditTicketDrawer } from "./EditTicketDrawer";
import { mockRetailers } from "../data/mockRetailers";
import { REQUEST_TYPE_LABELS, CONTENT_TYPE_LABELS } from "../data/formOptions";
import { getPlaceholderProductImage } from "../data/productImages";
import { revalidateBulkRow } from "../lib/bulkRowValidation";
import { fmtDate } from "../lib/format";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "issue", label: "Incomplete" },
  { value: "ready", label: "Ready" },
];

/** Ticket identity for the Title cell — deliberately never falls back to
 * product data, per the approved model: a row's product description is
 * not its ticket identity. */
function ticketIdentity(row) {
  return row.title || row.description || "Untitled ticket";
}

/** Number of products currently on a ticket — reads the new `products`
 * array first, falling back to the legacy single flat `productTitle`
 * field (1 or 0) for rows that haven't gone through Edit yet. */
function productCountFor(row) {
  if (row.products && row.products.length > 0) return row.products.length;
  return row.productTitle ? 1 : 0;
}

/** Single-product identity/UPC, used only when a ticket has exactly 1
 * product (0 gets its own empty state, 2+ shows a count — see the
 * Products cell below). Prefers the new `products[0]`, then legacy flat
 * fields. Deliberately does NOT fall back to the ticket's own
 * description/title — that fallback used to make a 0-product row render
 * as if it had one (a fake product identity built from the ticket's own
 * title), which is exactly the bug this fixes: Review's displayed product
 * state must match what EditTicketDrawer will actually hydrate. */
function productIdentity(row) {
  return row.products?.[0]?.description || row.productTitle || null;
}
function productUpc(row) {
  return row.products?.[0]?.upc || row.upc || null;
}

/** Content type label(s) for the Content type cell — reads the new
 * `contentTypes` array first, falling back to the legacy singular
 * `contentType` field for rows that haven't gone through Edit yet. */
function contentTypeLabelsFor(row) {
  const values = row.contentTypes && row.contentTypes.length > 0 ? row.contentTypes : row.contentType ? [row.contentType] : [];
  if (values.length === 0) return "—";
  return values.map((v) => CONTENT_TYPE_LABELS[v] ?? v).join(", ");
}

function matchesSearch(row, query) {
  if (!query) return true;
  const haystack = [
    row.title,
    row.description,
    row.id,
    row.productTitle,
    ...(row.products ?? []).map((p) => p.description),
    row.upc,
    ...(row.products ?? []).map((p) => p.upc),
    row.retailer,
    retailerLabel(row.retailer),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

/** Best-available "on sale" date for the row — VizID/Brand rows carry
 * their date in launchDate/dueDate instead of the Innovation-only
 * onSaleDate field. Same "best available date" fallback pattern already
 * used by `getRequestDisplayDate` (lib/models.js). */
function onSaleDateFor(row) {
  return row.onSaleDate || row.launchDate || row.dueDate;
}

/**
 * BulkReviewStep — ticket-centered Bulk CSV review table, refined to the
 * Galileo enterprise-table visual direction: one white Card/Table surface,
 * compact toolbar (search + status filter + count), restrained borders,
 * compact badges, subtle row hover — no oversized banners, no per-ticket
 * cards, no accordions, no status tabs.
 *
 * Approved conceptual model unchanged: each row is one future Content
 * Request/ticket, not a standalone catalog product. Terminology: "Ticket"/
 * "Request" for the row, "Product" only for the product data it contains,
 * "Ready"/"Incomplete" for pre-creation completeness — never a
 * request-workflow status ("Needs action", "In progress", etc.), since
 * these rows are not Content Requests yet.
 *
 * Columns (product-selection/checkbox-content-type refinement pass): the
 * prior combined "Request" cell (type + title + ID) splits into separate
 * Request type / Title columns, a new Description column is added
 * (ClampCell — the existing shared 2-line-clamp cell, reused unchanged from
 * ui/Table.jsx rather than a new wrap/truncate treatment), and a new
 * Content type column is added. The prior standalone "Validation" column is
 * folded into the Status cell as a second line under the badge, matching
 * the same badge-plus-reason-line pattern EditTicketDrawer's header already
 * uses — not a new pattern, just the same one applied here too.
 *
 * Edit opens `EditTicketDrawer` (right-side Drawer) — see that component's
 * own doc comment for the full contract. `editingRowId`/`statusFilter`/
 * `searchQuery` all live here, in local state untouched by the drawer
 * opening/closing (it's a sibling overlay, not a route change), so table
 * scroll/filter/search context survives automatically across an edit.
 *
 * Products cell: a ticket with 2+ products shows a compact count
 * ("3 products / View and manage in Edit") instead of the large product
 * list the table itself must never render — full detail (add/remove/
 * search) lives exclusively in the drawer. Unchanged from before this pass.
 */
export function BulkReviewStep({ rows, batch, onReplaceFile, onUpdateRow }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRowId, setEditingRowId] = useState(null);

  const readyRows = rows.filter((r) => r.willCreateRequest && r.status !== "issue");
  const issueRows = rows.filter((r) => r.status === "issue");
  const types = Array.from(new Set(rows.map((r) => r.requestType).filter(Boolean)));

  // Incomplete first, Ready after — stable sort preserves original
  // CSV order within each group. Status filter + search narrow the same
  // sorted list further; never a second table.
  const sortedRows = [...rows].sort((a, b) => {
    const aWeight = a.status === "issue" ? 0 : 1;
    const bWeight = b.status === "issue" ? 0 : 1;
    return aWeight - bWeight;
  });
  const q = searchQuery.trim().toLowerCase();
  const visibleRows = sortedRows
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .filter((r) => matchesSearch(r, q));

  const editingRow = editingRowId ? rows.find((r) => r.id === editingRowId) : null;

  const handleSaveTicket = (patch) => {
    const revalidated = revalidateBulkRow({ ...editingRow, ...patch });
    onUpdateRow?.(editingRow.id, revalidated);
    setEditingRowId(null);
  };

  return (
    <Card title="Review Tickets" subtitle="Review imported tickets and resolve issues before creating requests.">
      <div className="flex flex-col gap-4">
        {(batch || onReplaceFile) && (
          <div className="flex items-center justify-between gap-4 flex-wrap text-sm text-base-content/70">
            <p>
              <span className="font-semibold text-base-content">{batch?.templateName || "Uploaded file"}</span>
            </p>
            {onReplaceFile && (
              <Button variant="outline" size="sm" icon={ArrowUpTrayIcon} iconPosition="leading" onClick={onReplaceFile}>
                Replace file
              </Button>
            )}
          </div>
        )}

        {rows.length === 0 ? (
          <p className="text-sm text-base-content/50 text-center py-8">No tickets to review.</p>
        ) : (
          <>
            <p className="text-sm text-base-content/60">
              {rows.length} tickets · {readyRows.length} ready · {issueRows.length} incomplete
              {types.length > 1 && (
                <span className="text-base-content/40">
                  {" "}
                  · mixes {types.map((t) => REQUEST_TYPE_LABELS[t] ?? t).join(", ")}
                </span>
              )}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <Input
                  icon={MagnifyingGlassIcon}
                  placeholder="Search by request, product, retailer, UPC, or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <label className="inline-flex items-center gap-1.5 h-10 px-3 bg-base-100 border border-base-300 rounded-field text-sm">
                <span className="text-base-content/60">Status:</span>
                <select
                  className="bg-transparent border-none outline-none text-base-content"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter tickets by status"
                >
                  {STATUS_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <span className="text-xs text-base-content/50 whitespace-nowrap">
                {visibleRows.length} of {rows.length}
              </span>
            </div>

            <Table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Request type</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Retailers</th>
                  <th>On Sale Date</th>
                  <th>Content type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const isIssue = row.status === "issue";
                  const retailerMissing = isIssue && !row.retailer;
                  const productCount = productCountFor(row);
                  return (
                    <tr key={row.id} className="hover:bg-base-200/50">
                      <td>
                        <div className="min-w-0">
                          <span
                            className={`badge badge-sm gap-1 ${isIssue ? "badge-soft badge-error" : "badge-soft badge-success"}`}
                          >
                            {isIssue && <ExclamationTriangleIcon className="w-3 h-3" aria-hidden="true" />}
                            {isIssue ? "Incomplete" : "Ready"}
                          </span>
                          {isIssue && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-error whitespace-nowrap">
                              {row.issueReason || "Incomplete"}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-base-content/70 whitespace-nowrap">
                        {REQUEST_TYPE_LABELS[row.requestType] ?? row.requestType}
                      </td>
                      <td>
                        <p className="text-base-content font-medium truncate max-w-[200px]">
                          {ticketIdentity(row)}
                        </p>
                      </td>
                      <ClampCell contentClassName="text-sm text-base-content/70 max-w-[220px]">
                        {row.description || "—"}
                      </ClampCell>
                      <td>
                        {productCount > 1 ? (
                          <div className="min-w-0">
                            <p className="text-base-content font-medium">{productCount} products</p>
                            <p className="text-xs text-base-content/40">View and manage in Edit</p>
                          </div>
                        ) : productCount === 1 ? (
                          <div className="flex items-center gap-2">
                            <ProductImageThumb
                              src={getPlaceholderProductImage(productUpc(row) || row.id)}
                              alt={productIdentity(row)}
                            />
                            <div className="min-w-0">
                              <p className="text-base-content truncate max-w-[180px]">{productIdentity(row)}</p>
                              <p className="text-xs text-base-content/40 truncate max-w-[180px]">
                                {productUpc(row) ? `UPC: ${productUpc(row)}` : "—"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-base-content/40 italic">No product selected</p>
                        )}
                      </td>
                      <td
                        className={`whitespace-nowrap ${
                          retailerMissing ? "bg-error/10 border-l-2 border-error" : "text-base-content/70"
                        }`}
                      >
                        {retailerMissing ? (
                          <span className="flex items-center gap-1 text-error">
                            <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            Missing
                          </span>
                        ) : row.retailer ? (
                          <CustomBadge label={row.retailer} title={retailerLabel(row.retailer)} />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="text-base-content/70 whitespace-nowrap">{fmtDate(onSaleDateFor(row))}</td>
                      <td className="text-base-content/70 whitespace-nowrap">{contentTypeLabelsFor(row)}</td>
                      <td className="whitespace-nowrap">
                        <Button variant="ghost" size="small" onClick={() => setEditingRowId(row.id)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center text-sm text-base-content/50 py-6">
                      No tickets match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </div>

      {editingRow && (
        <EditTicketDrawer row={editingRow} onCancel={() => setEditingRowId(null)} onSave={handleSaveTicket} />
      )}
    </Card>
  );
}
