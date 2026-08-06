import { useMemo, useState } from "react";
import { PencilIcon, ArchiveBoxIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { QueueMetricCards } from "../components/QueueMetricCards";
import { Card } from "../components/ui/Card";
import { Table, ClampCell, NUMERIC_CELL_CLASS } from "../components/ui/Table";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { SelectField } from "../components/ui/SelectField";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Tab } from "../components/ui/Tab";
import { CountBadge } from "../components/ui/CountBadge";
import { CustomBadge } from "../components/ui/CustomBadge";
import { mockRetailers } from "../data/mockRetailers";
import { REQUEST_TYPE_LABELS, mockAssignees, getAssigneeLabel } from "../data/formOptions";
import { REQUEST_STATUS, getRequestDisplayDate } from "../lib/models";
import { fmtDate } from "../lib/format";
import { handleInternalNavClick } from "../lib/clientNav";
import { canEditRequest, isRequestArchived, editUnavailableReason } from "../lib/editability";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

// Soft pill treatment: "badge-soft" + the existing "badge-{status}" color
// modifiers is DaisyUI's own built-in composition (badge.css) — badge-soft
// consumes the --badge-color each modifier already sets, so this reuses the
// exact color-mix formula already verified in the codebase rather than
// reimplementing it. Each status keeps its own semantic hue (error/info/
// success/neutral); only the fill goes from solid to soft-tinted, and text
// becomes that same semantic color instead of white-on-solid.
//
// Exported (along with STATUS_LABEL / STATUS_PILL_RADIUS below) so
// RequestDetailHeader/RequestDetailsCard can render the exact same status
// pill treatment instead of re-deriving their own color mapping.
export const STATUS_BADGE = {
  [REQUEST_STATUS.NEEDS_ACTION]: "badge-soft badge-error",
  [REQUEST_STATUS.IN_PROGRESS]: "badge-soft badge-info",
  [REQUEST_STATUS.COMPLETED]: "badge-soft badge-success",
  [REQUEST_STATUS.DRAFT]: "badge-soft badge-neutral",
  // ARCHIVED — same neutral treatment as Draft (a "quiet"/inactive status),
  // added alongside the new REQUEST_STATUS.ARCHIVED value (see models.js).
  [REQUEST_STATUS.ARCHIVED]: "badge-soft badge-neutral",
  // ON_HOLD — same neutral/"paused" treatment as Draft/Archived, added
  // alongside the new REQUEST_STATUS.ON_HOLD value (see models.js). No
  // mock request currently has this status; this entry exists so the
  // row-level status pill has a defined style the moment one does.
  [REQUEST_STATUS.ON_HOLD]: "badge-soft badge-neutral",
};

// badge's own base rule hardcodes border-radius: var(--radius-selector)
// (4px). Rather than stack a competing radius utility class — the same
// same-property cascade conflict already documented elsewhere in this file
// — the 8px target is applied via inline style referencing the existing,
// already-approved --radius-box token. Inline style always wins over a
// stylesheet rule regardless of compiled order, so this is a guaranteed
// override rather than an order-dependent one, and it introduces no new
// hardcoded value.
export const STATUS_PILL_RADIUS = { borderRadius: "var(--radius-box)" };

export const STATUS_LABEL = {
  [REQUEST_STATUS.NEEDS_ACTION]: "Needs Action",
  [REQUEST_STATUS.IN_PROGRESS]: "In Progress",
  [REQUEST_STATUS.COMPLETED]: "Completed",
  [REQUEST_STATUS.DRAFT]: "Draft",
  [REQUEST_STATUS.ARCHIVED]: "Archived",
  [REQUEST_STATUS.ON_HOLD]: "On Hold",
};

// Status tabs use only real status values from lib/models.js. "On Hold"
// maps to REQUEST_STATUS.ON_HOLD (additive, see models.js) — no duplicate
// status semantics were created; it uses the exact same behavior model as
// every other status tab below (exact status match, no special casing).
// No mock request currently has this status, so — same as "Draft"
// already was — it will show a 0 count until a request actually carries
// it; nothing is backfilled or invented to populate it.
//
// Order (approved Figma parity pass): All, Needs Action, In Progress,
// Completed, On Hold, Archived.
//
// Tab -> status mapping (explicit, since Part A requires documenting it):
//   "all"                    -> every request EXCEPT archived ones (the
//                               default/active view — archived requests are
//                               deliberately excluded from "All" per the
//                               Archive spec: "archived requests disappear
//                               from the default active view").
//   REQUEST_STATUS.NEEDS_ACTION / IN_PROGRESS / COMPLETED / ON_HOLD ->
//                               exact status match, unchanged.
//   REQUEST_STATUS.ARCHIVED  -> exact status match — the one place archived
//                               requests remain reachable from this page.
const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: REQUEST_STATUS.NEEDS_ACTION, label: STATUS_LABEL[REQUEST_STATUS.NEEDS_ACTION] },
  { key: REQUEST_STATUS.IN_PROGRESS, label: STATUS_LABEL[REQUEST_STATUS.IN_PROGRESS] },
  { key: REQUEST_STATUS.COMPLETED, label: STATUS_LABEL[REQUEST_STATUS.COMPLETED] },
  { key: REQUEST_STATUS.ON_HOLD, label: STATUS_LABEL[REQUEST_STATUS.ON_HOLD] },
  { key: REQUEST_STATUS.ARCHIVED, label: STATUS_LABEL[REQUEST_STATUS.ARCHIVED] },
];

function matchesTab(request, tabKey) {
  if (tabKey === "all") return request.status !== REQUEST_STATUS.ARCHIVED;
  return request.status === tabKey;
}

const REQUEST_TYPE_FILTER_OPTIONS = Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/** Everything the free-text search box should match against — request
 * title, request type label, retailer codes/names, assignee label, content
 * types, and request id. Client-side, case-insensitive substring match;
 * every field already exists on the request (or is derived from an
 * existing display helper already used elsewhere in this file) — nothing
 * new is invented for search. */
function matchesSearch(request, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    request.title,
    request.id,
    REQUEST_TYPE_LABELS[request.requestType],
    getAssigneeLabel(request.assignee),
    ...(request.contentTypes ?? []),
    ...(request.retailers ?? []).flatMap((code) => [code, retailerLabel(code)]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

const MAX_VISIBLE_RETAILERS = 2;

// Same categorical-dot convention BrandVizReviewBody's Products-by-Retailer
// section already uses (built entirely from existing primary/secondary/
// neutral tokens + opacity variants, not status-semantic colors, and
// assigned by each retailer's fixed position in mockRetailers so the same
// retailer always gets the same dot). Kept as its own local copy here
// rather than importing from that file — it's a small, presentation-only
// constant, and BrandVizReviewBody is part of the protected Creation/Read
// review surface this pass doesn't touch.
const RETAILER_DOT_PALETTE = ["bg-primary", "bg-secondary", "bg-neutral", "bg-primary/50", "bg-secondary/50", "bg-neutral/50", "bg-primary/25"];

function retailerDotClass(code) {
  const index = mockRetailers.findIndex((r) => r.code === code);
  if (index === -1) return "bg-base-content/30";
  return RETAILER_DOT_PALETTE[index % RETAILER_DOT_PALETTE.length];
}

/** Retailer cell — CustomBadge-based tags with the same categorical dot +
 * overflow-count behavior the prior hand-built badge-ghost chips had.
 * `req.retailers` (the request's own retailer codes) is the only data
 * source; nothing new is read or invented. Full retailer name stays
 * available via CustomBadge's `title` tooltip even though the visible
 * label is the short code, so no information is lost versus the codes
 * shown before. */
function RetailerTags({ codes }) {
  if (!codes || codes.length === 0) return <span className="text-base-content/40">—</span>;
  const visible = codes.slice(0, MAX_VISIBLE_RETAILERS);
  const overflow = codes.length - visible.length;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map((code) => (
        <CustomBadge key={code} label={code} dotColor={retailerDotClass(code)} title={retailerLabel(code)} />
      ))}
      {overflow > 0 && <CustomBadge label={`+${overflow}`} />}
    </div>
  );
}

/**
 * ContentRequestQueue — functional Queue tabs/filters/row actions (Parts A,
 * B, C of the Content Request Intake functional expansion).
 *
 * All filtering is client-side and derived, never stored redundantly:
 * `activeTab` + `searchQuery` + `typeFilter` + `assigneeFilter` are the only
 * pieces of state this component owns. Table columns, density, and visual
 * structure are unchanged from the prior presentation-only version; there
 * was no real pagination before this pass (the footer was fully decorative,
 * no page-size/page-index state existed anywhere), so there is none to
 * preserve here either — every row matching the current tab+filters still
 * renders in one page, exactly like before.
 */
export function ContentRequestQueue({ requests, onNavigate, onArchiveRequest }) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null); // request being confirmed for archive, or null

  const hasActiveFilters = Boolean(searchQuery || typeFilter || assigneeFilter);

  // Filters (search/type/assignee) apply independently of the active tab —
  // computed once so both the visible rows and each tab's count are driven
  // by the exact same filtered set, just sliced by a different tab key.
  const filteredByControls = useMemo(() => {
    return requests.filter(
      (r) =>
        matchesSearch(r, searchQuery) &&
        (!typeFilter || r.requestType === typeFilter) &&
        (!assigneeFilter || r.assignee === assigneeFilter)
    );
  }, [requests, searchQuery, typeFilter, assigneeFilter]);

  const countFor = (tabKey) => filteredByControls.filter((r) => matchesTab(r, tabKey)).length;

  const visibleRequests = useMemo(
    () => filteredByControls.filter((r) => matchesTab(r, activeTab)),
    [filteredByControls, activeTab]
  );

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setAssigneeFilter("");
  };

  const confirmArchive = () => {
    if (!archiveTarget) return;
    onArchiveRequest?.(archiveTarget.id);
    setArchiveTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <QueueMetricCards requests={requests} />

      <Card title="Content Request Queue" bodyClassName="p-0">
        {/* Status tabs — real tab semantics (role="tablist"/"tab",
            aria-selected), wired to `activeTab` state. Clicking a tab
            filters the table below (combined with search/type/assignee);
            counts reflect the current search/type/assignee filters, so a
            tab's badge always matches how many rows selecting it would
            show. */}
        {/* gap-3 (was gap-5) — compact spacing correction; each Tab still
            carries its own 12px horizontal padding, so this only tightens
            the space between adjacent tabs, not their own internal
            geometry. */}
        <div role="tablist" aria-label="Filter by status" className="h-10 flex items-center gap-3 px-6 border-b border-base-300">
          {STATUS_TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Tab
                key={tab.key}
                active={isActive}
                role="tab"
                id={`queue-tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls="queue-table"
                onClick={() => setActiveTab(tab.key)}
                className="whitespace-nowrap"
              >
                {tab.label}
                <CountBadge count={countFor(tab.key)} active={isActive} />
              </Tab>
            );
          })}
        </div>

        {/* Toolbar — controlled search + Request Type + Assignee filters,
            each combining with the active tab. Search stays the
            dominant-width field (flex-1 vs the two fixed-width selects).
            Request Type / Assignee render through SelectField
            (ui/SelectField.jsx), the shared label-inside-control primitive
            — field name and current value sit together inside one 40px
            control ("Request Type   All"), matching the approved Figma
            toolbar treatment, instead of a label row above the control.
            aria-label is still set explicitly (defaulting to the same
            text as the visible label) for a stable accessible name. All
            three controls are the same 40px height, so items-center keeps
            them aligned (no longer items-end — SelectField has no
            separate label row above it to account for). */}
        <div className="flex items-center gap-3 px-6 py-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <Input
              placeholder="Search by request, brand, SKU, GTIN, UPC, or retailer"
              className="pl-9"
              aria-label="Search requests"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-[200px] shrink-0">
            <SelectField
              label="Request Type"
              placeholder="All"
              aria-label="Filter by request type"
              options={REQUEST_TYPE_FILTER_OPTIONS}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
          <div className="w-[200px] shrink-0">
            <SelectField
              label="Assignee"
              placeholder="All"
              aria-label="Filter by assignee"
              options={mockAssignees}
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset filters
            </Button>
          )}
        </div>

        {/* Table — flush with the Card (no extra nested horizontal inset,
            no nested border/radius — see ui/Table's `flush` prop); explicit
            48px header/row height via h-12 on each <tr>.
            Column model (approved Figma parity pass): Brand/Request,
            Request type, Status, Retailers, YTD RSV, Content type,
            Assignee, Launch Date, Actions. "Source" and the old "Due /
            Launch" label are removed from this presentation — the
            underlying request data/model is unchanged, this is a column
            visibility/labeling change only. No sort state exists on this
            table (there wasn't one before this pass either), so Launch
            Date has no interactive sort indicator to preserve — nothing
            new is introduced here. */}
        <Table id="queue-table" role="tabpanel" aria-labelledby={`queue-tab-${activeTab}`} flush>
          <thead>
            <tr className="h-12">
              <th className="whitespace-nowrap font-medium text-base-content/60">Brand/Request</th>
              <th className="whitespace-nowrap font-medium text-base-content/60">Request type</th>
              <th className="whitespace-nowrap font-medium text-base-content/60">Status</th>
              <th className="whitespace-nowrap font-medium text-base-content/60">Retailers</th>
              <th className="whitespace-nowrap font-medium text-base-content/60 text-right">YTD RSV</th>
              <th className="whitespace-nowrap font-medium text-base-content/60">Content type</th>
              <th className="whitespace-nowrap font-medium text-base-content/60">Assignee</th>
              <th className="whitespace-nowrap font-medium text-base-content/60">Launch Date</th>
              <th aria-label="Row actions" />
            </tr>
          </thead>
          <tbody>
            {visibleRequests.map((req) => {
              const editable = canEditRequest(req);
              const archived = isRequestArchived(req);
              return (
                <tr key={req.id}>
                  {/* Brand/Request — approved Figma treatment renders only
                      the request title as the semantic link; no muted
                      brand/heading line above it (removed per the Figma-
                      parity pass — a prior pass had added a derived brand
                      eyebrow line that Figma does not show). This is a
                      presentation-only change: the underlying brand data
                      on the request/product/item model is untouched and
                      not read here at all. Link is primary blue + medium
                      weight (not heavy bold), matching the approved
                      Brand/Request title treatment. Real link with a real
                      href — keyboard focus, hover, right-click "copy
                      link"/"open in new tab", and Cmd/Ctrl/Shift/middle-
                      click all work natively. A plain, unmodified left-
                      click is intercepted by handleInternalNavClick and
                      routed through onNavigate (pushState, see App.jsx)
                      instead of a full page reload, so in-memory
                      `requests` state survives the trip to Request Detail
                      — archived requests still open here too (Detail must
                      remain reachable). */}
                  <ClampCell>
                    <a
                      href={`/request/${req.id}`}
                      onClick={(e) => handleInternalNavClick(e, `/request/${req.id}`, onNavigate)}
                      className="text-primary font-medium hover:underline focus-visible:underline"
                      aria-label={`View request details: ${req.title || "Untitled"}`}
                    >
                      {req.title || <span className="italic font-normal text-base-content/40">Untitled</span>}
                    </a>
                  </ClampCell>
                  <td className="text-base-content/70 whitespace-nowrap align-middle">
                    {REQUEST_TYPE_LABELS[req.requestType] ?? req.requestType}
                  </td>
                  <td className="whitespace-nowrap align-middle">
                    <span
                      className={`badge badge-sm whitespace-nowrap ${STATUS_BADGE[req.status] ?? "badge-soft badge-neutral"}`}
                      style={STATUS_PILL_RADIUS}
                    >
                      {STATUS_LABEL[req.status] ?? req.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap align-middle">
                    <RetailerTags codes={req.retailers} />
                  </td>
                  {/* YTD RSV — no such field exists anywhere in the Request
                      data model (checked models.js/mockProducts/
                      mockRequests) — nothing to display, so every row
                      renders a dash rather than a fabricated number. Uses
                      the shared NUMERIC_CELL_CLASS (Table.jsx) — Roboto
                      Mono, 12px, right-aligned — per the global table
                      numeric/monetary-cell rule, so the dash sits exactly
                      where a real value would once this field exists. */}
                  <td className={`text-base-content/40 whitespace-nowrap align-middle ${NUMERIC_CELL_CLASS}`}>—</td>
                  <td className="text-base-content/70 whitespace-nowrap align-middle">
                    {(req.contentTypes ?? []).join(", ") || <span className="text-base-content/40">—</span>}
                  </td>
                  <td className="text-base-content/70 whitespace-nowrap align-middle">
                    {getAssigneeLabel(req.assignee) || <span className="text-base-content/40">Unassigned</span>}
                  </td>
                  {/* Launch Date — same getRequestDisplayDate derivation as
                      before (dueDate -> launchDate -> earliest item
                      onSaleDate), only the visible column label changed. */}
                  <td className="text-base-content/70 whitespace-nowrap align-middle">{fmtDate(getRequestDisplayDate(req))}</td>
                  <td className="align-middle">
                    <div className="flex items-center justify-end gap-3 text-base-content/55">
                      {editable ? (
                        <a
                          href={`/request/${req.id}/edit`}
                          onClick={(e) => handleInternalNavClick(e, `/request/${req.id}/edit`, onNavigate)}
                          aria-label={`Edit request: ${req.title || "Untitled"}`}
                          className="hover:text-base-content"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </a>
                      ) : (
                        <span
                          className="text-base-content/25 cursor-not-allowed"
                          role="img"
                          aria-label={`Edit unavailable: ${editUnavailableReason(req)}`}
                          title={editUnavailableReason(req)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </span>
                      )}
                      {archived ? (
                        <span
                          className="text-base-content/25 cursor-not-allowed"
                          role="img"
                          aria-label={`${req.title || "Untitled"} is already archived`}
                          title="Already archived"
                        >
                          <ArchiveBoxIcon className="w-4 h-4" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setArchiveTarget(req)}
                          aria-label={`Archive request: ${req.title || "Untitled"}`}
                          className="hover:text-base-content"
                        >
                          <ArchiveBoxIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {visibleRequests.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-sm text-base-content/50 py-8">
                  {requests.length === 0 ? (
                    "No requests yet."
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span>No requests match the current tab and filters.</span>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={resetFilters}>
                          Reset filters
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Footer — 64px tall, 24px horizontal inset. Pagination and
            rows-per-page remain decorative; there was no pagination state
            in the prior version either (all matching rows always render on
            one page), so none is introduced here. */}
        <div className="h-16 grid grid-cols-3 items-center px-6 border-t border-base-300 text-sm text-base-content/50">
          <span className="whitespace-nowrap">Last updated: Now</span>
          <div className="flex items-center justify-center gap-1">
            <span className="w-7 h-7 flex items-center justify-center rounded-field text-base-content/30">
              <ChevronLeftIcon className="w-4 h-4" />
            </span>
            <span className="w-7 h-7 flex items-center justify-center rounded-field bg-base-200 font-semibold text-base-content">
              1
            </span>
            <span className="w-7 h-7 flex items-center justify-center">2</span>
            <span className="w-7 h-7 flex items-center justify-center">…</span>
            <span className="w-7 h-7 flex items-center justify-center">99</span>
            <span className="w-7 h-7 flex items-center justify-center rounded-field text-base-content/30">
              <ChevronRightIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="w-28 ml-auto">
            <Select placeholder="50 Rows" options={[]} />
          </div>
        </div>
      </Card>

      {archiveTarget && (
        <ConfirmDialog
          title="Archive request?"
          body="This request will be moved out of the active queue. You can still view it from Archived requests."
          confirmLabel="Archive request"
          confirmVariant="destructive"
          onCancel={() => setArchiveTarget(null)}
          onConfirm={confirmArchive}
        />
      )}
    </div>
  );
}
