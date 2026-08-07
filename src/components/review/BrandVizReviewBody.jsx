import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Table, ClampCell } from "../ui/Table";
import { ProductImageThumb } from "../ui/ProductImageThumb";
import { CustomBadge } from "../ui/CustomBadge";
import { InfoBanner } from "../ui/InfoBanner";
import { mockRetailers } from "../../data/mockRetailers";
import { getPlaceholderProductImage } from "../../data/productImages";
import { fmtDate, fmtCount } from "../../lib/format";
import { BrandVizRequestSummary } from "./BrandVizRequestSummary";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

// Same date-column label mapping RetailerDatesStep used — carried over as
// this feature moved into Review, not a new/invented label.
const DATE_COLUMN_LABEL = {
  vizId: "Launch Date",
  brandRequest: "Due/Launch Date",
};

// Stable, visual-only categorical dot color per retailer — Review
// presentation only, not a shared/exported mapping and not a change to
// retailer data or identifiers (mockRetailers itself is untouched). Built
// entirely from existing theme tokens (primary/secondary/neutral, plus
// opacity variants of the same tokens) rather than status-semantic colors
// (error/warning/success/info), since those already carry a specific
// meaning elsewhere in this app (the Status column's soft pills) and
// reusing them here for an unrelated categorical purpose would risk false
// association. Assigned by each retailer's fixed position in
// mockRetailers, so the same retailer always gets the same dot across
// renders — not derived from anything that could change per-request.
const RETAILER_DOT_PALETTE = [
  "bg-primary",
  "bg-secondary",
  "bg-neutral",
  "bg-primary/50",
  "bg-secondary/50",
  "bg-neutral/50",
  "bg-primary/25",
];

function retailerDotClass(code) {
  const index = mockRetailers.findIndex((r) => r.code === code);
  if (index === -1) return "bg-base-content/30";
  return RETAILER_DOT_PALETTE[index % RETAILER_DOT_PALETTE.length];
}

/**
 * RetailerGroupPanel — one independent white card (retailer + date) inside
 * the Products by Retailer section. This is the only place retailer-date
 * editing lives — same `onUpdateGroupDate` handler, same `group.date`/
 * `group.retailer` values, no new state.
 *
 * The wrapper reproduces Card's exact visual recipe directly
 * (bg-base-100 border-base-300 shadow-sm) rather than using the Card
 * component itself — the header below is fully custom/interactive
 * (badge, date context, date input, chevron), which doesn't map onto
 * Card's plain string `title` slot, so this stays a hand-styled surface
 * that still looks identical to every other white card.
 *
 * Header regions, left to right: retailer pill (categorical dot + name +
 * item count, also the expand/collapse toggle) — "Launch date:
 * <formatted date>" for context (label semibold, value regular) — the
 * same editable date input (~140px wide, 40px tall, muted fill) — a
 * trailing chevron that also toggles. The header renders identically
 * whether the group is expanded or collapsed, so the date stays visible
 * and editable without requiring expansion.
 *
 * No remove/delete control anywhere in this header (or elsewhere in
 * Review) — removed per instruction; see BrandVizReviewBody's own comment
 * for what that means for the underlying removeGroup handler.
 *
 * `open` is local, presentation-only React state — it toggles which
 * group's rows are visible and does not read or write retailerGroups,
 * products, or any wizard state. Collapsing/expanding here can never
 * change what gets submitted on Create Request.
 *
 * `readOnly` (default false) — opt-in, backward-compatible: when true, the
 * editable date `<input>` is replaced by the exact same `fmtDate(group.date)`
 * plain-text treatment already shown as context next to it, and
 * `onUpdateGroupDate` is never called (not passed through as a handler to
 * anything). Every existing caller (the wizard's Review step) omits this
 * prop and renders exactly as before. Added for the READ Request Detail
 * page, which reuses this component for its retailer/product body but must
 * never expose a control that could mutate a persisted request.
 *
 * `isOverride` (optional boolean) — the Retailer Date-Source Indicator
 * (Corrected Approved Scope, Aug 2026). Only rendered when `readOnly` is
 * true, so the wizard's own live Review step (which never passes
 * `readOnly`) renders identically to before — this is a READ-only
 * addition, not a change to the shared editable header. When shown, it's
 * a small `CustomBadge` reading "Retailer override" (every product in
 * this group carries its own explicit `launchDate`) or "Inherited from
 * default" (at least one product in the group fell back to the request's
 * default date) — positioned beside the date context, before the
 * expand/collapse chevron. The boolean itself is computed one level up in
 * `BrandVizReviewBody`, by cross-referencing `products`' own `launchDate`
 * field per EAN — this component only renders whatever it's given, it
 * never re-derives the value itself.
 */
function RetailerGroupPanel({
  group,
  brandByEan,
  defaultOpen,
  dateLabel,
  onUpdateGroupDate,
  readOnly = false,
  isOverride,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => setOpen((o) => !o);
  const label = retailerLabel(group.retailer);

  return (
    <div className="bg-base-100 border border-base-300 shadow-sm rounded-[16px] overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={toggle}
          className="flex items-center min-w-0 text-left"
          aria-expanded={open}
        >
          <span className="badge badge-ghost gap-1.5 whitespace-nowrap">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${retailerDotClass(group.retailer)}`}
              aria-hidden="true"
            />
            <span className="truncate">{label}</span>
            <span className="text-base-content/40" aria-hidden="true">
              ·
            </span>
            <span>{fmtCount(group.rows.length, "item")}</span>
          </span>
        </button>

        <div className="flex items-center gap-4 shrink-0">
          {readOnly ? (
            // Single labeled value — no separate "context label" + input
            // pair needed here (the input's own context label exists in the
            // editable branch specifically because a native date input's
            // own displayed value isn't in the friendly fmtDate format;
            // there's nothing to disambiguate once it's already plain text).
            <>
              <span className="text-xs whitespace-nowrap" aria-label={`${dateLabel} for ${label}`}>
                <span className="font-semibold text-base-content/70">{dateLabel}:</span>{" "}
                <span className="text-base-content/70">{fmtDate(group.date)}</span>
              </span>
              <CustomBadge label={isOverride ? "Retailer override" : "Inherited from default"} />
            </>
          ) : (
            <>
              <span className="text-xs whitespace-nowrap">
                <span className="font-semibold text-base-content/70">Launch date:</span>{" "}
                <span className="text-base-content/60">{fmtDate(group.date)}</span>
              </span>
              <input
                type="date"
                aria-label={`${dateLabel} for ${label}`}
                className="input input-bordered w-[140px] bg-base-200/50 border-base-300 text-base-content/70 text-sm"
                value={group.date || ""}
                onChange={(e) => onUpdateGroupDate(group.retailer, group.date, e.target.value)}
              />
            </>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={open ? "Collapse" : "Expand"}
            className="text-base-content/50"
          >
            {open ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-base-300">
          <Table flush>
            <thead>
              <tr>
                {/* No header label for the thumbnail column — same
                    convention already used for icon-only columns elsewhere
                    (e.g. Queue's row-actions <th>), a narrow fixed width
                    keeps every other column's layout untouched. */}
                <th className="w-14" aria-label="Product image" />
                <th className="whitespace-nowrap">Product Description</th>
                <th className="whitespace-nowrap">Brand</th>
                <th className="whitespace-nowrap">EAN</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((r, i) => (
                <tr key={i}>
                  <td className="align-middle">
                    <ProductImageThumb
                      src={r.imageUrl ?? getPlaceholderProductImage(r.ean || r.upc)}
                      alt={r.productTitle}
                    />
                  </td>
                  <ClampCell contentClassName="text-base-content">{r.productTitle}</ClampCell>
                  <td className="text-base-content/70 whitespace-nowrap align-middle">
                    {brandByEan.get(r.ean) ?? "—"}
                  </td>
                  <td className="text-base-content/70 whitespace-nowrap align-middle">{r.ean}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

/**
 * BrandVizReviewBody — explicit VizID Change / Brand Request review body
 * (left column content). Summary + products grouped by retailer, using the
 * exact retailerGroups already derived by groupProductsByRetailer in
 * ManualRequestWizard — no grouping/persistence logic here, only display.
 *
 * The "Products by Retailer" heading + helper copy render directly on the
 * page canvas (plain text, styled to match Card's own title/subtitle
 * treatment) rather than inside a wrapping Card — each retailer group is
 * now its own independent white card instead of all of them sharing one
 * outer card surface.
 *
 * Each product row now leads with a compact ProductImageThumb (`r.imageUrl`,
 * carried through by groupProductsByRetailer — see its own comment). This
 * renders in both the wizard's Review step and Request Detail, since it's
 * the same shared table; it's purely additive/decorative and never gates
 * or changes any editing behavior. No product in this prototype's mock
 * data currently has a real `imageUrl`, so every row shows the neutral
 * placeholder today — the column exists so a real image can be dropped in
 * later without any further component changes.
 *
 * Brand isn't present on retailerGroups rows (groupProductsByRetailer only
 * carries productTitle/ean/upc/retailers/imageUrl per row) — it's joined
 * here for display only, by EAN, from the `products` array the wizard already
 * passes down. This does not touch groupByRetailer.js or products state.
 *
 * No `onRemoveGroup` prop — the visible remove control was removed from
 * every retailer header per instruction. The underlying `removeGroup`
 * handler still exists in ManualRequestWizard.jsx (kept intentionally,
 * not deleted, since deleting it wasn't explicitly requested) but is no
 * longer threaded down through here.
 *
 * `readOnly` (default false) — opt-in, backward-compatible: forwarded
 * straight through to every `RetailerGroupPanel`, which is the only place
 * this actually changes anything (see its own doc comment). The wizard's
 * Review step never passes this prop, so it keeps rendering live,
 * editable date inputs exactly as before. Request Detail (READ MVP) passes
 * `readOnly` and omits `onUpdateGroupDate` entirely, since there is
 * nothing here to call it.
 *
 * Retailer Date-Source Indicator — `hasOwnDateByEan` mirrors the exact
 * existing `brandByEan` pattern directly above it: a plain Map built from
 * `products` (never from `retailerGroups`, and never touching
 * lib/groupByRetailer.js), keyed by EAN, this time recording whether that
 * product carries its own explicit `launchDate` (override) or not
 * (inherits the request's default date). Each group's `isOverride` is
 * then computed the same way `brandByEan` is joined into each row below:
 * a presentational-only derivation, passed to `RetailerGroupPanel` as a
 * plain boolean, never stored or written back anywhere.
 *
 * `hideTitle`/`onAssigneeChange`/`variant` — passed straight through to
 * `BrandVizRequestSummary` unchanged (see its own doc comment). Omitted by
 * every existing caller (wizard Review), so this body renders exactly as
 * before by default. Only the summary sub-component reacts to `variant` —
 * the retailer-grouped product table below it (and its now-deterministic
 * placeholder thumbnails, see `getPlaceholderProductImage` above) is
 * unaffected by `variant` and renders identically in both.
 *
 * Retailer-launch-date-split helper copy — gated to `!readOnly`, so it
 * only appears in the live wizard Review step, never in Request Detail's
 * read-only reuse of this same component (READ must stay unchanged). A
 * compact `InfoBanner` explaining that retailers sharing a launch date
 * stay in one request while a different date creates a separate one —
 * evergreen guidance about how the section behaves, not conditional on
 * the current group count.
 */
export function BrandVizReviewBody({
  requestType,
  formData,
  products,
  retailerGroups,
  onUpdateGroupDate,
  readOnly = false,
  hideTitle = false,
  onAssigneeChange,
  variant = "review",
}) {
  const brandByEan = new Map(products.map((p) => [p.ean, p.brand]));
  const hasOwnDateByEan = new Map(products.map((p) => [p.ean, Boolean(p.launchDate)]));
  const dateLabel = DATE_COLUMN_LABEL[requestType] ?? "Date";

  return (
    <>
      <BrandVizRequestSummary
        requestType={requestType}
        formData={formData}
        hideTitle={hideTitle}
        onAssigneeChange={onAssigneeChange}
        variant={variant}
      />

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold text-base-content">Products by Retailer</h3>
          <p className="text-xs text-base-content/50 mt-0.5">
            Review the products assigned to each retailer and the launch date they will inherit.
          </p>
        </div>

        {!readOnly && retailerGroups.length > 0 && (
          <InfoBanner variant="info">
            <span className="font-semibold">Retailer launch dates may create separate requests.</span>
            <div className="mt-0.5 opacity-90">
              Retailers with the same launch date will stay together. A different launch date will create a
              separate request.
            </div>
          </InfoBanner>
        )}

        {retailerGroups.length === 0 ? (
          <p className="text-sm text-base-content/50 text-center py-6">No retailer groups yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {retailerGroups.map((g, i) => (
              <RetailerGroupPanel
                key={`${g.retailer}__${g.date}`}
                group={g}
                brandByEan={brandByEan}
                defaultOpen={i === 0}
                dateLabel={dateLabel}
                onUpdateGroupDate={onUpdateGroupDate}
                readOnly={readOnly}
                isOverride={g.rows.every((r) => hasOwnDateByEan.get(r.ean))}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
