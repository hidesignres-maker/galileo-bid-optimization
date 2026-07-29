# Galileo Review Pattern v1

Status: **approved baseline**, reflecting the Manual wizard's Review & Create implementation as it stands on `experiment/content-request-review-pattern` (through commits `96a2d98` "Implement Galileo Review Pattern v1" and `9826689` "Align manual create flow shell with Figma"). This document describes only what is implemented and approved — it does not propose new patterns or treatments.

No implementation files were changed to produce this document.

---

## 1. Purpose

**What the Review Pattern is for:** a reusable description of how the Manual wizard's final "Review & Create" step is built — a shared, slot-based shell around two explicit, request-type-specific bodies — so the same shape (shell + summary + primary content + supporting-materials rail + footer) can be reasoned about consistently, and so a future request type would have a clear place to plug in rather than growing a third conditional branch inside a shared body component.

**What it is not:**
- Not a single universal review component — `BrandVizReviewBody` and `InnovationReviewBody` are deliberately separate, explicit components, not one heavily-conditional component branching on request type.
- Not a source of business logic — grouping, validation, and request-creation rules live in `ManualRequestWizard.jsx` and `src/lib/*`, never in the shell or the bodies.
- Not a finished feature — several pieces are visual-only or intentionally left as placeholders (Section 13).

---

## 2. Source-of-truth model

- **Figma is the visual source of truth** for the Review step's composition, geometry, and copy — including the verified guidance string, the "Request Summary" heading, the retailer-header layout, and the create-flow shell (hidden module tabs, simplified breadcrumb, request-type page title).
- **The React prototype is the functional source of truth** for data, state, validation, and request creation. `ManualRequestWizard.jsx` owns all state (`formData`, `products`, `itemInputs`, `retailerGroups`) and all handlers (`handleBack`, `handleCreateRequest`, `updateGroupDate`, `removeGroup`); Review only displays and edits through the handlers it's given.
- **Designer/product confirmation resolves conflicts** — e.g., the confirmed decision to fold the Retailers step into Review & Create (Section 6), and the explicit instruction to remove the visible retailer-removal control from Review (Section 8) even though the underlying handler remains available.

---

## 3. Shared Review shell

`src/components/ManualReviewStep.jsx` is a thin dispatcher: it owns no state, picks `BrandVizReviewBody` or `InnovationReviewBody` based on `requestType`, and assembles `src/components/review/ReviewShell.jsx` around it.

`ReviewShell` is slot-based and product-agnostic (`heading`, `guidance`, `left`, `right`, `footer` props only):
- 1180px content boundary, centered (`max-w-[1180px] mx-auto`).
- Heading + guidance line above a two-column grid.
- Grid: left column 779px, gap 24px, right column 377px (779 + 24 + 377 = 1180 — the grid exactly fills the boundary).
- `footer` renders below the grid, inside the same 1180px boundary — callers supply their own footer content.

Heading is the literal string **"Review and submit"** for both request-type branches (Section 6's instruction: don't repeat the request type inside the Review body, since the page-level title above the wizard already carries it). Guidance differs by type: Brand/VizID uses the verified Figma copy —

> "Review the request details, confirm retailer launch dates, and verify the selected products and supporting materials before creating the request."

— Innovation uses a neutral placeholder line (no verified Innovation guidance string exists yet; see Section 13).

---

## 4. Brand/VizID review configuration

`src/components/review/BrandVizReviewBody.jsx` renders, top to bottom:
1. `BrandVizRequestSummary` (Section 3's field set).
2. A "Products by Retailer" heading + helper copy on the page canvas (not wrapped in a Card).
3. One independent white card per retailer group (Section 8).

`src/components/review/BrandVizRequestSummary.jsx` — heading "Request Summary" (no request-type subtitle). Two-region composition:
- **Top row**: left = Request title, right = Description.
- **Bottom metadata row**, inside the same left column, directly under Request title: Launch date (or "Due/launch date" for Brand Request) / Content type / Assignee, laid out horizontally, each still label-above-value.
- Sentence-case labels (not uppercase), no dividers between fields, `Card` `bodyClassName="p-6"` (24px padding), no min-height — the card shrinks to its content.
- No retailer-specific dates or retailer controls in this card — those live exclusively in the retailer accordion (Section 8).

---

## 5. Innovation review configuration

`src/components/review/InnovationReviewBody.jsx` renders `InnovationRequestSummary` followed by one flat item table — no retailer accordion, since Innovation has no separate Retailers step (retailer and dates are already per-item).

`src/components/review/InnovationRequestSummary.jsx` — heading "Summary", subtitle "Innovation". Approved field list only: Title, Description, Content Type, Assignee. No general launch date (Innovation has no request-level date field — dates live per item), no retailer row, no aggregated Brand(s)/item-count rows — all of that is already visible per row in the item table below, not duplicated in the summary.

---

## 6. Three-step Brand/VizID flow

Confirmed product decision, implemented in `ManualRequestWizard.jsx`'s `STEPS_BY_TYPE`:

```
vizId:        ["Add Details", "Select Products", "Review & Create"]
brandRequest: ["Add Details", "Select Products", "Review & Create"]
innovation:   ["Details & Item Inputs", "Review & Create"]   (unchanged)
```

The separate "Retailers" step was removed from the visible Brand/VizID flow. `groupProductsByRetailer`, `updateGroupDate`, and `removeGroup` are unchanged functions, still owned by `ManualRequestWizard.jsx` — only *where* retailer dates are edited moved, into the Review step's retailer accordion (Section 8). `handleBack`/`handleNext` step-index math is unchanged; Continue-to-Review gating (`itemsValidCount === 0` on Select Products) is unchanged. Innovation's step list and gating are untouched.

---

## 7. Supporting Materials rail

`src/components/review/SupportingMaterialsReview.jsx` — shared right-rail card, used by both request types, built entirely from `formData.contentRequirements` (`{ files: [{id, name}], referenceLink }`), the only supporting-materials data the Manual flow actually collects.

- Shows the reference link's actual value as read-only text (not "Added" — an earlier draft used that convention; the current implementation shows the real value, truncated with `title` for the full string on hover, no `href`/click behavior added).
- Shows each file's name in a plain list.
- No thumbnails, file type, file size, delete affordance, or upload entry point — none of that is modeled anywhere in this prototype.
- Empty state ("No supporting materials added.") when neither files nor a link exist.

`ReviewNotesPanel` (same file) renders a separate "Notes" card with a fixed placeholder ("No notes added for this request.") — there is no notes field anywhere in the Manual flow's data model, so this is intentionally never populated. The two cards sit in the right column's `flex flex-col gap-6` (24px vertical gap), inherited from `ReviewShell`.

---

## 8. Retailer accordion behavior

Each retailer group (`RetailerGroupPanel`, inside `BrandVizReviewBody.jsx`) is its own independent white card: `bg-base-100 border border-base-300 shadow-sm rounded-[16px]` (Card's own visual recipe, applied directly since the header is fully custom/interactive and doesn't fit Card's plain-string `title` slot). Cards sit in a `gap-6` (24px) column.

Header regions, left to right:
- **Retailer pill** — categorical dot + retailer name + item count in one `badge-ghost` pill (e.g. "● Amazon · 3 items"); also the expand/collapse toggle.
- **"Launch date: <formatted date>"** for context — label semibold, value regular weight.
- **Editable date input** (~140px wide, default/40px tall, muted fill) — wired to the same `onUpdateGroupDate` handler as before; visible and editable whether the group is expanded or collapsed.
- **Chevron** (20px) — also toggles expand/collapse.

**No remove/delete control** — the trash icon that previously called `removeGroup` was explicitly removed from every retailer header (and from the summary card, where an earlier draft briefly showed one). `onRemoveGroup` was removed from `BrandVizReviewBody`, `ManualReviewStep`, and the `ManualReviewStep` call in `ManualRequestWizard.jsx`. The underlying `removeGroup` function is still defined in `ManualRequestWizard.jsx` — kept intentionally, not deleted, since deleting it was never explicitly requested (see Section 13).

Categorical dot color is a stable, local-to-this-file mapping keyed by each retailer's fixed index in `mockRetailers` (not exported, not a change to retailer data/identifiers), built from existing tokens (`primary`/`secondary`/`neutral` plus opacity variants) rather than status-semantic colors, since those already carry a specific meaning elsewhere (the Queue's Status pills).

Expanding a group renders the product table (Section on tables below). The first group is expanded by default (`defaultOpen={i === 0}`); the rest are collapsed. This is local, presentation-only React state — it never reads or writes `retailerGroups`/`products`.

---

## 9. Innovation flat-table behavior

`InnovationReviewBody.jsx` renders one table, columns exactly: **UPC, Retailer, Customer ID, Product Description, Brand, On Sale Date, Start Date** — the 7 verified fields on an item-input row. Retailer renders as a compact `badge-ghost` pill (reusing the same treatment as the Queue's retailer tags). No EAN (not part of the item-input shape), no eighth column (none was ever resolved/verified for this table).

---

## 10. Approved geometry and tokens

| Element | Value |
|---|---|
| Review content boundary | 1180px |
| Two-column grid | 779px / 24px gap / 377px |
| Request Summary card padding | 24px (`p-6`) |
| Retailer group card radius | 16px (`rounded-[16px]`, applied directly — no new global token) |
| Retailer group vertical spacing | 24px (`gap-6`) |
| Retailer date input | ~140px wide, default (40px) tall |
| Trash/chevron icon size | 20px (`w-5 h-5`) — trash icon is no longer rendered (Section 8), but the 20px sizing convention was the approved value while it existed and still applies to the chevron |
| Card radius (`--radius-box`) | 8px, existing token, unchanged |
| Field radius (`--radius-field`) | 4px, existing token, unchanged |
| Border width (`--border`) | 1px, existing token, unchanged |
| Left rail / navbar / page inset | 52px / 48px / 24px — unchanged, inherited from `AppShell` |

No new color, radius, or spacing tokens were added to `src/theme/corporate.css` for the Review pattern — the 16px retailer-card radius is a scoped arbitrary value on that one component, not a token.

---

## 11. Reusable components

- **`ReviewShell`** (`src/components/review/ReviewShell.jsx`) — slot-based layout shell (Section 3). Product-agnostic.
- **`ReviewFooter`** (`src/components/review/ReviewFooter.jsx`) — Back / Discard / Create Request action row, Create Request in primary blue (not the prior success/green). Handlers passed straight through, no state owned.
- **`ClampCell`** (`src/components/ui/Table.jsx`) — pre-existing shared table primitive (not introduced by this pattern), reused here for the Product Description column in both the retailer product table and the Innovation item table: 2-line clamp, `<td>` stays the real cell, `min-h-12` inner wrapper preserves the 48px row floor.
- **`AppShell`'s `showSectionTabs` prop** (`src/components/AppShell.jsx`) — opt-in, default `true`, backward-compatible. When `false`, the module tabs row (Scores/Changes/Content Request/Insights) is omitted entirely. Used only for the manual create/review flow (`showSectionTabs={view !== "manual"}` in `App.jsx`); Queue and Bulk CSV are unaffected.

---

## 12. Functional behavior preserved

Confirmed unchanged throughout every pass of this pattern's implementation:
- One `Request` created per manual flow; `vizId`/`brandRequest`/`innovation` identifiers unchanged.
- `ManualRequestWizard.jsx`'s state ownership (`formData`, `products`, `itemInputs`, `errors`, `currentStep`, `requestType`) and every handler (`handleNext`, `handleBack`, `handleCreateRequest`, `toggleProduct`, `clearAllProducts`, `updateGroupDate`, `removeGroup`).
- `groupProductsByRetailer`/`groupItemsByRetailer` (`src/lib/groupByRetailer.js`) — untouched.
- All validation rules (`getDetailsValidationErrors`, `isItemRowValid`, the AMZ Start Ship Date rule) — untouched.
- Queue, Bulk CSV, `models.js`, `businessRules.js` — untouched by any commit in this pattern.
- Brand/Viz selected-product persistence (`products` state, `ProductLookupTable`'s product-first selection) — untouched.

---

## 13. Known gaps and unresolved decisions

- **`removeGroup` is defined but has zero consumers.** The visible remove control was removed from Review per explicit instruction; the handler itself was deliberately kept rather than deleted, since deletion wasn't explicitly requested. If retailer removal is meant to be gone permanently, `removeGroup` (and `updateGroupDate`'s sibling logic, if ever similarly deprecated) should be revisited.
- **Innovation's Review guidance copy is not verified from Figma.** It's a neutral placeholder line, flagged as such since it was written, not sourced from an approved string.
- **Supporting Materials' populated state has not been visually validated against Figma directly** — there's no seeded/mock review data. The existing Add Details step's "Browse files" simulated upload and reference-link input are a real, already-built pathway to populate it for manual visual checking, but no fixture data was added.
- **Retailer categorical dot colors are an invented-but-token-based local mapping**, not a Figma-specified retailer-to-color table. No approved shared categorical mapping exists yet.
- **The Innovation item table's "unresolved eighth Figma column"** was never added — only the 7 verified fields are shown.
- **`initialManualRequestType` can theoretically be null** when `ManualRequestWizard` is used directly without going through `CreateRequestLauncher` (a documented fallback gate). In that edge case, `App.jsx`'s page title falls back to a generic "New Request" rather than a request-type-specific string, since no type is known yet.

---

## 14. Reuse checklist

1. **Verify repo** — confirm branch and a clean working tree before starting.
2. **Audit the Figma Review frame** — identify the approved heading/guidance copy, geometry, and any named tokens before writing code.
3. **Keep the shell slot-based, keep bodies explicit** — extend `ReviewShell`'s slots for new composition needs; write a new explicit `*ReviewBody`/`*RequestSummary` pair for a new request type rather than adding a branch to an existing one.
4. **Preserve handler ownership** — data and handlers stay owned by the wizard; Review components only receive and call them.
5. **Reuse existing primitives and tokens** — `Card`, `Table`/`ClampCell`, existing color/radius/spacing tokens — before reaching for a new arbitrary value or a new token.
6. **Implement in isolated commits** — one approved change per commit, exact commit message.
7. **Validate build** after each change (`npm install` + `npx vite build` in an isolated copy).
8. **Confirm scope with a diff** — check that no unrelated file (Queue, Bulk CSV, models, business rules, `AppShell`'s other consumers) drifted.
9. **Document exceptions** — record anything not verified from Figma or not fully resolved (Section 13), rather than silently deciding or omitting it.
