import { PencilIcon, ArchiveBoxIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { QueueMetricCards } from "../components/QueueMetricCards";
import { Card } from "../components/ui/Card";
import { Table } from "../components/ui/Table";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { mockRetailers } from "../data/mockRetailers";
import { REQUEST_TYPE_LABELS, mockAssignees } from "../data/formOptions";
import { REQUEST_STATUS, getRequestDisplayDate } from "../lib/models";
import { fmtDate } from "../lib/format";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

// Soft pill treatment: "badge-soft" + the existing "badge-{status}" color
// modifiers is DaisyUI's own built-in composition (badge.css) — badge-soft
// consumes the --badge-color each modifier already sets, so this reuses the
// exact color-mix formula already verified in the codebase rather than
// reimplementing it. Each status keeps its own semantic hue (error/info/
// success/neutral); only the fill goes from solid to soft-tinted, and text
// becomes that same semantic color instead of white-on-solid.
const STATUS_BADGE = {
  [REQUEST_STATUS.NEEDS_ACTION]: "badge-soft badge-error",
  [REQUEST_STATUS.IN_PROGRESS]: "badge-soft badge-info",
  [REQUEST_STATUS.COMPLETED]: "badge-soft badge-success",
  [REQUEST_STATUS.DRAFT]: "badge-soft badge-neutral",
};

// badge's own base rule hardcodes border-radius: var(--radius-selector)
// (4px). Rather than stack a competing radius utility class — the same
// same-property cascade conflict already documented elsewhere in this file
// — the 8px target is applied via inline style referencing the existing,
// already-approved --radius-box token. Inline style always wins over a
// stylesheet rule regardless of compiled order, so this is a guaranteed
// override rather than an order-dependent one, and it introduces no new
// hardcoded value.
const STATUS_PILL_RADIUS = { borderRadius: "var(--radius-box)" };

const STATUS_LABEL = {
  [REQUEST_STATUS.NEEDS_ACTION]: "Needs Action",
  [REQUEST_STATUS.IN_PROGRESS]: "In Progress",
  [REQUEST_STATUS.COMPLETED]: "Completed",
  [REQUEST_STATUS.DRAFT]: "Draft",
};

// Status tabs use only real status values from lib/models.js. Figma's
// reference screen also showed "Shipped" / "On Hold" / "Archive" tabs, but
// those aren't values this prototype's data model defines — adding them
// would mean inventing status/business logic, out of scope for a
// presentation-only pass. "Draft" is defined in REQUEST_STATUS but isn't
// represented in the current mock data, so it's left out of the tab row
// for now rather than shown as an always-empty tab.
const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: REQUEST_STATUS.NEEDS_ACTION, label: STATUS_LABEL[REQUEST_STATUS.NEEDS_ACTION] },
  { key: REQUEST_STATUS.IN_PROGRESS, label: STATUS_LABEL[REQUEST_STATUS.IN_PROGRESS] },
  { key: REQUEST_STATUS.COMPLETED, label: STATUS_LABEL[REQUEST_STATUS.COMPLETED] },
];

const REQUEST_TYPE_FILTER_OPTIONS = Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const MAX_VISIBLE_RETAILERS = 2;

function RetailerTags({ codes }) {
  if (!codes || codes.length === 0) return <span className="text-base-content/40">—</span>;
  const visible = codes.slice(0, MAX_VISIBLE_RETAILERS);
  const overflow = codes.length - visible.length;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visible.map((code) => (
        <span key={code} className="badge badge-sm badge-ghost" title={retailerLabel(code)}>
          {code}
        </span>
      ))}
      {overflow > 0 && <span className="badge badge-sm badge-ghost">+{overflow}</span>}
    </div>
  );
}

/**
 * ContentRequestQueue — Galileo composition parity pass.
 * Data, counts, and status values are unchanged from the prototype; only
 * geometry/composition changed to match the approved Figma frame:
 *  - Summary cards (QueueMetricCards, 2 cards) render above this component's
 *    own Card surface, at their approved 194x84 size / 24px gap.
 *  - Status tabs: exactly 40px tall, 24px horizontal inset.
 *  - Toolbar: Search (dominant) + Request Type + Assignee (each 200px),
 *    8px gap, 24px/12px padding, all controls 40px tall. The Assignee
 *    filter replaces the prior Retailers filter — visual-only substitution,
 *    sourced entirely from existing `mockAssignees` data (see parity
 *    report), not a new data source. mockRetailers/retailerLabel stay
 *    imported — still used by the table's own Retailers column.
 *  - Table: no extra nested inset (flush with the Card), explicit 48px
 *    header/row height.
 *  - Footer: 24px horizontal inset, exactly 64px tall.
 *  - Search, filters, tabs, pagination, and rows-per-page remain
 *    presentation only — no filtering/pagination logic invented or
 *    changed. All rows always render.
 *  - Row actions (edit/archive icons) are decorative; no edit/archive
 *    callback exists anywhere in this prototype yet.
 */
export function ContentRequestQueue({ requests }) {
  const countFor = (key) =>
    key === "all" ? requests.length : requests.filter((r) => r.status === key).length;

  return (
    <div className="flex flex-col gap-6">
      <QueueMetricCards requests={requests} />

      <Card title="Content Request Queue" bodyClassName="p-0">
        {/* Status tabs — display only, 40px tall. Not wired to filtering:
            all rows always render below regardless of which tab reads as
            active. "All" is shown active by default since that's the only
            state that doesn't imply a filter decision we haven't built. */}
        <div className="h-10 flex items-end gap-5 px-6 border-b border-base-300">
          {STATUS_TABS.map((tab) => (
            <span
              key={tab.key}
              className={`flex items-center gap-1.5 pb-3 text-sm whitespace-nowrap border-b-2 -mb-px ${
                tab.key === "all"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-base-content/60"
              }`}
            >
              {tab.label}
              <span className="badge badge-sm badge-ghost">{countFor(tab.key)}</span>
            </span>
          ))}
        </div>

        {/* Toolbar — search + filters are presentation only (uncontrolled,
            no onChange wiring), reusing the existing Input/Select wrappers.
            Each control gets its own sized wrapper div rather than a width
            passed via containerClassName, since Input/Select hardcode
            w-full on their own root element and a competing width class
            there isn't guaranteed to win the cascade. */}
        <div className="flex items-center gap-2 px-6 py-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <Input placeholder="Search by request, brand, SKU, GTIN, UPC, or retailer" className="pl-9" />
          </div>
          <div className="w-[200px] shrink-0">
            <Select placeholder="All Request Types" options={REQUEST_TYPE_FILTER_OPTIONS} />
          </div>
          <div className="w-[200px] shrink-0">
            <Select placeholder="All Assignees" options={mockAssignees} />
          </div>
        </div>

        {/* Table — flush with the Card (no extra nested horizontal inset,
            no nested border/radius — see ui/Table's `flush` prop); explicit
            48px header/row height via h-12 on each <tr>. */}
        <Table flush>
          <thead>
            <tr className="h-12">
              <th className="whitespace-nowrap">Request title</th>
              <th className="whitespace-nowrap">Request type</th>
              <th className="whitespace-nowrap">Status</th>
              <th className="whitespace-nowrap">Retailers</th>
              <th className="whitespace-nowrap">Content type</th>
              <th className="whitespace-nowrap">Assignee</th>
              <th className="whitespace-nowrap">Due / Launch</th>
              <th className="whitespace-nowrap">Source</th>
              <th aria-label="Row actions" />
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="h-12">
                <td className="font-semibold text-base-content">
                  {req.title || <span className="italic font-normal text-base-content/40">Untitled</span>}
                </td>
                <td className="text-base-content/70 whitespace-nowrap">
                  {REQUEST_TYPE_LABELS[req.requestType] ?? req.requestType}
                </td>
                <td className="whitespace-nowrap">
                  <span
                    className={`badge badge-sm whitespace-nowrap ${STATUS_BADGE[req.status] ?? "badge-soft badge-neutral"}`}
                    style={STATUS_PILL_RADIUS}
                  >
                    {STATUS_LABEL[req.status] ?? req.status}
                  </span>
                </td>
                <td className="whitespace-nowrap">
                  <RetailerTags codes={req.retailers} />
                </td>
                <td className="text-base-content/70 whitespace-nowrap">
                  {(req.contentTypes ?? []).join(", ") || <span className="text-base-content/40">—</span>}
                </td>
                <td className="text-base-content/70 whitespace-nowrap">
                  {req.assignee || <span className="text-base-content/40">Unassigned</span>}
                </td>
                <td className="text-base-content/70 whitespace-nowrap">{fmtDate(getRequestDisplayDate(req))}</td>
                <td className="whitespace-nowrap text-xs text-base-content/40">
                  {req.isPlaceholder ? (
                    <span title={req.sourceBatchId ?? ""}>Bulk placeholder</span>
                  ) : (
                    <span>Manual</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center justify-end gap-2 text-base-content/55">
                    <PencilIcon className="w-4 h-4" aria-hidden="true" />
                    <ArchiveBoxIcon className="w-4 h-4" aria-hidden="true" />
                  </div>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-sm text-base-content/50 py-8">
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Footer — 64px tall, 24px horizontal inset. Pagination and
            rows-per-page are decorative; there is no pagination state
            anywhere in this prototype (all rows always render). */}
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
    </div>
  );
}
