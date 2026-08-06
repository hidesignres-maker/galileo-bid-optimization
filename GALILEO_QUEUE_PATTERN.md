# Galileo Queue Pattern v1

Status: **approved baseline.** This document reflects the Content Request Queue implementation as it stands today, after the composition, theme, geometry, soft-pill, and two-line table-cell passes. It documents only what is already implemented and approved — it does not propose new patterns or new visual treatments.

**Updated** following three Queue Figma-parity passes. Pass 1: status-tab order/count-badge parity, search/filter control labeling, table column model, request-title link treatment, retailer CustomBadge. Pass 2: Brand/Request eyebrow line removed, filter controls moved from label-above to the combined label-inside-control `SelectField` treatment, `MetricCard` content corrected from centered to left-aligned, New Request / Calendar View buttons mapped onto the Default/Primary and Light/Neutral button groups, and a global numeric/monetary table-cell rule applied to YTD RSV. Pass 3 (this update, Section 13, new): the Create Request modal and the Archive confirmation modal both rebuilt on a new shared `Modal` foundation, with corrected copy/hierarchy/default-state, a new generic `SelectionCard` primitive, and the Button taxonomy extended with a Default/Destructive variant. Sections 3, 4, 5, 6, 7, 9, 10, 11, and the new Section 13 below reflect the current implementation; nothing in Sections 1, 2, 8, or 12 changed. Cross-cutting component/token detail (Tab, CountBadge, CustomBadge, Card, MetricCard, SelectField, SelectionCard, Modal, Button, the table numeric-cell rule — all shared beyond just the Queue) lives in `GALILEO_LAYER_AUDIT.md`, Section H, rather than being duplicated here; this document only covers how the Queue (and the modals it launches) specifically compose them.

No implementation files were changed to produce this document.

---

## 1. Purpose

**What the Queue Pattern is for:** a reusable description of how a Galileo "queue-style" screen is built from shell chrome, generic UI primitives, and a screen-specific composition — so a future prototype (Scores, Changes, Insights, or any other list/queue screen) can be assembled the same way without re-deriving the geometry, tokens, or component contracts from scratch.

**What it is not:**
- Not a component library or a shared "QueueScreen" component — there is no generic queue component to import. Each screen still writes its own composition file, following the anatomy in Section 6.
- Not a source of business logic — statuses, columns, filters, and mock data are Content Request-specific configuration (Section 10), not part of the reusable pattern.
- Not a finished/complete feature — several controls are visual-only (Section 11); the pattern documents the current approved visual state, not a claim that filtering, pagination, or row actions work.

---

## 2. Source-of-truth model

- **Figma is the visual source of truth.** Layout, spacing, density, color, radius, and composition trace back to an approved Figma reference, not to intuition or convenience.
- **The React prototype is the functional source of truth.** Request data, status values, validation, and business rules live in the prototype's own model/data files and are never adjusted to match a screenshot.
- **Designer confirmation resolves conflicts.** When a Figma detail and the prototype's existing behavior appear to disagree (e.g., a token that doesn't exist yet, a filter shown as functional in Figma but not wired in code), the designer's explicit confirmation decides — not a unilateral implementation choice made to force agreement between the two.

---

## 3. Layer model

The pattern is organized in four layers, each with a different owner and a different reason to change:

1. **Foundations / tokens** — `src/theme/corporate.css`, `src/index.css`. Color, font, radius, and border values. Changes only with an approved design-token update.
2. **UI primitives** — `src/components/ui/*.jsx` (`Card`, `Table`, `Input`, `Select`, `Button`, `Checkbox`, `InfoBanner`, `UploadDropzone`, plus `Tab`, `CountBadge`, `CustomBadge`, `MetricCard`, `SelectField`, `Modal`, `SelectionCard`, and `ConfirmDialog` added since the original audit). Generic, product-agnostic wrappers around DaisyUI. Changes only to add a genuinely reusable, backward-compatible capability — never to add product-specific behavior. Full designer-rule detail for each (use-when/do-not-use-when/anatomy/variants/accessibility/common mistakes) lives in `GALILEO_LAYER_AUDIT.md`, Section H — not duplicated here.
3. **Composition pattern** — `src/components/AppShell.jsx` plus the structural shape of `src/pages/ContentRequestQueue.jsx` (shell → summary cards → tabs → toolbar → table → footer). Reusable arrangement of primitives; still requires a new composition file per screen.
4. **Content Request-specific configuration** — everything else in `ContentRequestQueue.jsx` and its imports: status maps, column list, filter options, mock data. Owned entirely by this one screen; never migrates into layers 1–3 "just in case."

---

## 4. Approved foundations

Defined in `src/theme/corporate.css`, registered as the single `"corporate"` DaisyUI theme:

| Token | Value |
|---|---|
| `--color-primary` | `#0066FF` |
| `--color-base-content` | `#13181B` |
| `--color-base-100` | `#FFFFFF` |
| `--color-base-200` | `#F5F5F7` (Figma `main/color/base/200` — corrected from a prior `#E8E8E8`; the Queue's page canvas, via `bg-base-200`) |
| `--color-base-300` | `#E4E6EA` |
| `--color-neutral` | `#21272C` |
| `--color-count-badge` | `#EFEFEF` (Queue status-tab count-pill fill) |
| `--color-count-badge-outline` | `#D5D6D6` (Queue status-tab count-pill border) |
| `--font-code` (registered in an `@theme` block so Tailwind v4 generates the `font-code` utility, same mechanism as the count-badge colors) | `"Roboto Mono", ui-monospace, monospace` — used by the global table numeric/monetary-cell rule (`NUMERIC_CELL_CLASS`, `GALILEO_LAYER_AUDIT.md` H.12) |
| `--radius-modal` (component contract, applied inline by `Modal.jsx`) | `1rem` (16px) — the Create Request / Archive modal pattern's approved radius (`GALILEO_LAYER_AUDIT.md` H.13) |
| `--color-destructive` / `--color-destructive-content` | `#DC2626` / `#FFFFFF` (Figma `main/color/error/error`) — the Button system's Default/Destructive variant (Archive confirm), deliberately distinct from `--color-error` below (`GALILEO_LAYER_AUDIT.md` H.11) |
| `--radius-selector` (checkboxes/radios, and the compact radius `CountBadge`/`CustomBadge` reuse) | `0.25rem` (4px) |
| `--radius-field` (inputs/buttons) | `0.25rem` (4px) |
| `--radius-box` (cards/surfaces) | `0.5rem` (8px) |
| `--border` | `1px` |
| Font | Inter (`--font-primary: "Inter", ui-sans-serif, system-ui, sans-serif`, applied on `body`) |

**Single Corporate theme owner:** `src/index.css` sets `@plugin "daisyui" { themes: false; }`, disabling every DaisyUI bundled preset theme — including DaisyUI's own built-in theme also named `"corporate"`. `corporate.css`'s `@plugin "daisyui/theme"` block is therefore the only definition of `[data-theme="corporate"]`; there is no duplicate/colliding registration.

Not reassigned (left at DaisyUI defaults, not part of the approved set above): all `-content` pairing colors other than base/primary, `--color-secondary/success/warning/error/info` (these carry meaning elsewhere — status pills, form validation — and are documented where they're used, not here).

---

## 5. Reusable primitives and variants

Each of these is an optional, backward-compatible addition to an existing primitive — every prior call site keeps its exact previous behavior unless it explicitly opts in.

- **`Button` — `iconClassName`** (default `"w-4 h-4"`): overrides the icon's size only. Use when a specific button's icon must render at a non-default size for Figma parity (e.g., the Queue's "Calendar View" button, whose icon renders at 20px) without resizing icons on any other button.
- **`Card` — `flat`** (default `false`): omits `shadow-sm` for a lighter, flatter surface. Use for a compact tile that sits inside another surface and shouldn't read as a separately elevated card. (The Queue's own summary cards no longer use `flat` — see `MetricCard` below, which keeps the default shadow per the approved Figma metric-card treatment; `flat` remains available for any future case that does want the flatter look.)
- **`Card` — `bodyPadding`** (default `"p-4"`): replaces the body's own padding utility outright instead of appending alongside it, so a caller needing different body padding (e.g. `MetricCard`'s 12px) never ends up with two conflicting padding classes on one element. Every caller that doesn't pass this keeps the exact same `"p-4"` output as before.
- **`Table` — `flush`** (default `false`): drops the wrapper's own border/`rounded-box` so the table sits flush with whatever bordered surface already contains it, instead of reading as a nested card-within-a-card. Use when a table is the direct content of a `Card` (as in the Queue) rather than a standalone table on a page.
- **`ClampCell`** (new export alongside `Table`): opt-in table cell for text-heavy columns. `<td>` stays the real outer table-cell element (no display override, no reliance on `min-height` on `<tr>`/`<td>`); an inner wrapper (`min-h-12 flex items-center`) preserves the 48px row floor and vertical centering, and an innermost wrapper (`line-clamp-2 break-words`) does the actual 2-line clamp. `className` styles the `<td>` itself; `contentClassName` styles only the clamped text. Use for any single column whose content can meaningfully run to a second line (e.g., a title/description column) where truncating to one line would lose information — not for short, structured values. The Queue's Brand/Request column uses this for the title link only (a prior pass had also put a derived brand eyebrow line above the title here — removed, see Section 10).
- **`Table` — `NUMERIC_CELL_CLASS`** (new export alongside `Table`/`ClampCell`): shared class string (`font-code text-xs text-right tabular-nums`) for a table cell whose primary content is a bare numeric/monetary value. Applies to the data cell only, not the header. The Queue's YTD RSV column uses this (see Section 10). Full contract in `GALILEO_LAYER_AUDIT.md` Section H.12.
- **`Tab`** (`src/components/ui/Tab.jsx`): shared underline-style tab item (40px tall, 12px horizontal padding, 8px internal gap, transparent background in every state, primary-blue text + underline when active). The Queue's status tabs, the module top nav, and Product Selection's view toggle all render through this one primitive. Full contract in `GALILEO_LAYER_AUDIT.md` Section H.2.
- **`CountBadge`** (`src/components/ui/CountBadge.jsx`): the numeric pill riding inside each status Tab. Neutral (`#EFEFEF` fill / `#D5D6D6` border) when its tab is inactive, blue (`text-primary`) when active. Full contract in `GALILEO_LAYER_AUDIT.md` Section H.3.
- **`CustomBadge`** (`src/components/ui/CustomBadge.jsx`): compact metadata tag, built on DaisyUI's `badge` foundation. The Queue's Retailer column renders through this (see Section 10). Full contract in `GALILEO_LAYER_AUDIT.md` Section H.4.
- **`MetricCard`** (`src/components/ui/MetricCard.jsx`): the Queue's two summary cards ("Due this Period" / "Completed This Period") render through this shared primitive instead of hand-built `Card` markup — 194×(auto)px, 12px padding, 8px gap, label above value, **left-aligned** (corrected this pass from centered), neutral by default. Full contract in `GALILEO_LAYER_AUDIT.md` Section H.7.
- **`SelectField`** (`src/components/ui/SelectField.jsx`): the "label inside control" primitive — field name and current value combined inside one 40px control. The Queue's Request Type / Assignee filters render through this instead of `Select`'s label-above treatment. Full contract in `GALILEO_LAYER_AUDIT.md` Section H.10.
- **`Button` — variant/emphasis/size taxonomy** (backward-compatible across two passes): `variant="destructive"` (new, Default group's second variant — solid `#DC2626`, Archive confirm) joins `"primary"`/`"neutral"`/`"ghost"`; `emphasis="light"` (new alias of the pre-existing `"soft"`) composes with `variant="neutral"` into the Light/Neutral group; `size="default"`/`"small"`/`"compact"` (40/32/24px) are semantic aliases for DaisyUI's own size modifiers. The Queue's "New Request" (Default/Primary), "Calendar View" (Light/Neutral), and the Create Request / Archive modals' footer buttons all render through this. Full contract in `GALILEO_LAYER_AUDIT.md` Section H.11.
- **`Modal`** (`src/components/ui/Modal.jsx`, new this pass): shared modal/dialog foundation — 552px width, content-driven height, 16px radius, no visible close icon, footer-driven dismissal, focus trap, Escape-to-cancel. The Create Request modal and `ConfirmDialog` (Archive) both render through this instead of hand-rolled overlay markup. Full contract in `GALILEO_LAYER_AUDIT.md` Section H.13.
- **`SelectionCard`** (`src/components/ui/SelectionCard.jsx`, new this pass): generic bordered/selectable radio-card — a real radio input inside one fully clickable `<label>`, title + supporting description. `CreationMethodSelector` (Create Request modal's method choice) renders through this. Full contract in `GALILEO_LAYER_AUDIT.md` Section H.14.

---

## 6. Queue composition anatomy

Top to bottom, as implemented in `AppShell.jsx` + `App.jsx` (queue view) + `ContentRequestQueue.jsx`:

1. **App shell** (`AppShell.jsx`) — left nav rail + content area, page-level chrome only.
2. **Module navigation** — blue module header (module name + page group label) and the section-tab row beneath it, both part of `AppShell`. The section-tab row's own wrapper is transparent (see `GALILEO_LAYER_AUDIT.md` H.2) and sits directly on the page's `bg-base-200` canvas.
3. **Page header** (inline in `App.jsx`, queue view only) — title, description, and the Calendar View (Light/Neutral) / New Request (Default/Primary) actions, right-aligned. New Request opens the Create Request modal (Section 13).
4. **Summary cards** (`QueueMetricCards.jsx`) — two `MetricCard`s above the main queue surface ("Due this Period", "Completed This Period"), neutral variant, left-aligned content.
5. **Status tabs** — All / Needs Action / In Progress / Completed / On Hold / Archived, each with a live `CountBadge` count, inside the queue's `Card`.
6. **Search / filter toolbar** — dominant search input plus Request Type and Assignee filters, each rendered as a `SelectField` (label and current value combined inside one 40px control, not a separate label row).
7. **Operational table** — the request list itself, flush with the surrounding `Card`. Column model in Section 10.
8. **Footer** — last-updated label, pagination, rows-per-page control.

---

## 7. Approved geometry

| Element | Value |
|---|---|
| Left nav rail | 52px wide |
| Module header (navbar) | 48px tall |
| Module/section nav row | 40px tall (plus 8px top padding above the tabs — see `GALILEO_LAYER_AUDIT.md` H.2) |
| Section rhythm (page vertical spacing) | 24px |
| Page inset (horizontal padding) | 24px |
| Summary cards | 194px wide, auto height (`MetricCard` — 12px padding + 8px gap + content, no fixed height) |
| Gap between summary cards | 24px |
| Status-tab row inter-tab gap | 12px (tightened from a prior 20px for a more compact Figma-parity feel) |
| Toolbar controls (search/filters) | 40px tall — search input and both `SelectField` filters are now the same 40px height with no separate label row above them (corrected from an earlier pass where the filters were slightly taller due to a visible label sitting above a 40px control) |
| Button height scale (`Button`'s `size` prop) | `"default"` 40px / `"small"` 32px / `"compact"` 24px — 8px-decrement scale, see `GALILEO_LAYER_AUDIT.md` H.11 |
| Table row height | 48px minimum (fixed for all rows except those using `ClampCell`, which may grow beyond 48px for a wrapped second line) |
| Footer | 64px tall |

---

## 8. Table content rules

- Text-heavy cells may use `ClampCell` (Section 5) to allow up to 2 lines.
- A `ClampCell` row grows naturally to fit a wrapped second line rather than being forced to a fixed height.
- Content is clamped with an ellipsis after 2 lines (`line-clamp-2`).
- IDs, status, dates, assignee, numeric values, actions, and tags remain single-line by default (`whitespace-nowrap`) — clamping is opt-in per column, not a table-wide default. In the current Queue, only the Brand/Request column uses `ClampCell`; every other column stays single-line.

---

## 9. Status pill treatment

The Status column badges use a **soft semantic treatment**:

- Composed from DaisyUI's own built-in `badge-soft` + `badge-{color}` mechanism (`badge.css`) — `badge-soft` consumes the `--badge-color` each color modifier (`badge-error`/`badge-info`/`badge-success`/`badge-neutral`) already sets, via `color-mix(in oklab, var(--badge-color) 8%/10%, var(--color-base-100))` for background/border. This reuses DaisyUI's existing mechanism rather than a bespoke reimplementation.
- Each status **preserves its own semantic color** — Needs Action stays error-toned, In Progress stays info-toned, Completed stays success-toned, Draft/Archived/On Hold stay neutral-toned. Text renders in that same semantic color (readable colored text on a tinted background), replacing the prior white-text-on-solid-fill treatment.
- **Radius is 8px**, applied via an inline style referencing the existing `--radius-box` token (`style={{ borderRadius: "var(--radius-box)" }}`). `.badge`'s own base rule hardcodes `border-radius: var(--radius-selector)` (4px); rather than stack a competing radius utility class — a same-property cascade conflict — the override is applied inline, which always wins regardless of compiled stylesheet order, and introduces no new hardcoded value.
- Galileo theme tokens only: no new hex values were introduced for this treatment.
- **This is a distinct visual language from `CountBadge` (status-tab counts) and `CustomBadge` (retailer tags)** — same row, three different meanings. See the comparison table in `GALILEO_LAYER_AUDIT.md` Section H.5 before reaching for one where another belongs.

---

## 10. Content Request-specific configuration

Everything below lives in `ContentRequestQueue.jsx` or its direct imports and is not part of the reusable pattern:

- **Current tabs, in order**: All / Needs Action / In Progress / Completed / On Hold / Archived (`STATUS_TABS`, using `REQUEST_STATUS` from `src/lib/models.js`). "On Hold" maps to `REQUEST_STATUS.ON_HOLD` (added to the model specifically to give this tab a real status to match against — no duplicate/parallel status semantics were created). "Draft" remains a valid status value with no tab, since no mock data currently uses it. Figma's "Shipped" tab still has no corresponding model value and was not added.
- **Current columns, in order**: Brand/Request (title only, as a `text-primary font-medium` link — the eyebrow brand line an earlier pass had added above it was removed this pass; the approved Figma frame does not show it, and no brand-derivation logic reads the request/product/item data for this column at all anymore, a presentation-only removal), Request type, Status, Retailers (`CustomBadge`), YTD RSV, Content type, Assignee, Launch Date, row actions — a hardcoded `<thead>` in this file, not a shared column-config structure. "Source" and the prior "Due / Launch" label were removed from this presentation (the underlying date derivation is unchanged, only the column label and the Source column's visibility changed).
- **YTD RSV** — no such field exists anywhere in the `Request` data model; every row renders a dash (`—`), right-aligned, using the shared `NUMERIC_CELL_CLASS` (`Table.jsx` — Roboto Mono, 12px, right-aligned; see `GALILEO_LAYER_AUDIT.md` H.12) so the dash sits exactly where a real value would once this field exists. Nothing is fabricated to populate this column. The column header stays in the normal table-header font (a label, not a numeric value) and only picks up `text-right` for alignment.
- **Current filters**: search input (by request/brand/SKU/GTIN/UPC/retailer, controlled), Request Type (`REQUEST_TYPE_FILTER_OPTIONS`, derived from `REQUEST_TYPE_LABELS`) and Assignee (`mockAssignees`, both from `src/data/formOptions.js`) — both now rendered through `SelectField` (Section 5 / `GALILEO_LAYER_AUDIT.md` H.10), which combines the field name ("Request Type" / "Assignee") and current value inside one 40px control, and both remain fully wired (`onChange` filters the row list and each tab's count).
- **Retailer tags**: render through `CustomBadge` (Section 5 / `GALILEO_LAYER_AUDIT.md` H.4), each with a categorical dot color (`RETAILER_DOT_PALETTE`, a local copy of the same convention `BrandVizReviewBody` already uses, assigned by each retailer's fixed position in `mockRetailers`) plus a `title` tooltip carrying the full retailer name. Overflow beyond `MAX_VISIBLE_RETAILERS` (2) renders as a dot-less `+N` `CustomBadge`.
- **Current mock data**: `mockRequests` (`src/data/mockRequests.js`), passed down through `App.jsx`'s `requests` state; `mockRetailers` (`src/data/mockRetailers.js`) still backs the table's own Retailers column and tag labels even though the toolbar's filter is Assignee, not Retailers.
- **Which parts must not be generalized**: the status set, column list, filter option lists, and the retailer-tag overflow rule (`MAX_VISIBLE_RETAILERS`) stay in this file. They must not migrate into `AppShell` or `ui/*` on the assumption a future screen might want something similar — wait for an actual second use case before extracting a shared abstraction. (The retailer dot-palette logic is intentionally duplicated, not imported, from `BrandVizReviewBody.jsx` — that file is part of the protected Creation/Read review surface this pass doesn't touch. The Brand/Request column's own brand-derivation helper, previously duplicated from `RequestDetailsCard.jsx` for the now-removed eyebrow line, was deleted along with that line — there is no brand-derivation logic left in this file.)

---

## 11. Known functional gaps

- **Filters are now functional** — search, Request Type, and Assignee are controlled inputs that filter the row list and each tab's live count (this superseded an earlier "visual-only" gap recorded in a prior version of this document).
- **Row actions are now implemented** — Edit (gated by `canEditRequest`) and Archive (with a confirm dialog) both work from the table's Actions column (this superseded an earlier "decorative icons" gap).
- **Pagination is still visual-only** — "1 2 … 99" and the chevrons are static markup; no page state exists, and all rows always render on one page.
- **Calendar View is still not implemented** — the button renders with no click handler.
- **YTD RSV is still not modeled** — no such field exists anywhere in `Request`; the column exists (Section 10) but always renders a dash, styled with the shared numeric-cell treatment, never a fabricated number.
- **"Completed This Period" is still not period-scoped** — `QueueMetricCards` reuses the existing all-time `status === COMPLETED` count; there is no calculation that additionally scopes completions to the current period.
- **Most additional statuses are still not in the model** — "On Hold" was added (`REQUEST_STATUS.ON_HOLD`) specifically to support its tab; Figma's "Shipped" tab still has no corresponding `REQUEST_STATUS` value and was not added.
- **No sort indicator exists on any column, including Launch Date** — there was no sort state before the column-model update and none was introduced by it; nothing to regress, but also nothing implemented.
- **More mock data may be added later** — `mockRequests`/`mockRetailers`/`mockAssignees` are illustrative datasets, not a claim of production data coverage.

---

## 12. Reuse checklist for future prototypes

1. **Verify repo** — confirm which branch/commit the new work starts from and that the working tree is clean before beginning.
2. **Audit Figma** — identify the approved reference frame(s) and any explicit design-token names called out (e.g., `color/primary/soft/bg`) before writing code.
3. **Map Figma to React** — identify which existing tokens/primitives already cover the reference, and flag anything with no existing equivalent rather than inventing one.
4. **Separate tokens / primitives / composition / product config** — place each change in the correct layer (Section 3); resist adding product-specific logic to shared layers.
5. **Implement in isolated commits** — one approved change per commit, with an exact, reviewed commit message; no bundling of unrelated changes.
6. **Validate build** — rebuild in an isolated environment (`npm install` + `npx vite build`) after each change, not just at the end.
7. **Run visual review** — check the change against the Figma reference (or, absent a live browser, against the compiled CSS/JS output) before considering it done.
8. **Document exceptions** — record anything that couldn't be mapped 1:1 (missing tokens, unmodeled data, visual-only controls) rather than silently deciding or omitting it.

---

## 13. Create Request modal / Archive modal composition

New this pass. Both modals are launched from the Queue (and, for Archive, also from Request Detail's footer — see below) but compose entirely from the shared `Modal`/`Button`/`SelectionCard` primitives documented in `GALILEO_LAYER_AUDIT.md` Section H; this section covers only how each modal is put together, not the primitives themselves.

**Create Request modal** (`src/components/CreateRequestLauncher.jsx`, opened by the Queue's "New Request" button):

- **Structure, top to bottom:** `Modal` header ("Create request"), introductory copy ("Create one request manually or upload a CSV to create multiple requests at once."), the creation-method choice (two `SelectionCard`s via `CreationMethodSelector.jsx`: "Build Manually" / "Bulk CSV import"), a "Request Type" section (conditional content — see below), and the `Modal` footer (Cancel / Create request).
- **Default state:** "Build Manually" is selected the moment the modal opens (`useState("manual")`, not `null`) — the manual Request Type radios (Viz ID Change / Brand Request / Innovation, `RequestTypeSelector.jsx`) are visible immediately, with no extra click required. No request type is pre-selected (none exists in the approved behavior to default to), so "Create request" stays disabled until the user picks one.
- **Bulk CSV mode:** selecting the "Bulk CSV import" card hides the three manual Request Type radios and instead shows one line of informational copy: "Defined per CSV row. Bulk CSV supports mixed request types using the Request_Type column." "Create request" is enabled immediately in this mode (no further choice required here — each CSV row carries its own type at import time).
- **Footer:** Cancel (Ghost group) aligned left, "Create request" (Default/Primary, 40px) aligned right, via `Modal`'s own `footer` slot (`justify-between`). Clicking "Create request" calls the exact same `handleContinue`/`onContinue(method, requestType)` wiring that existed before this pass — routing to `ManualRequestWizard` (manual) or `BulkCsvWizard` (bulk) is unchanged; only the button's visible label/styling and the modal's copy/default-state changed.
- **What did not change:** the request-type data model, `REQUEST_TYPE_LABELS`, routing destinations, or any creation/navigation logic in `App.jsx`'s `handleLauncherContinue`.

**Archive confirmation modal** (`src/components/ui/ConfirmDialog.jsx`, used by both the Queue's row-level Archive action and Request Detail's footer "Archive request" action — one shared component, two call sites):

- **Structure:** reuses the shared `Modal` foundation directly — same 552px width, 16px radius, content-driven height, no visible close icon. Body is the confirmation copy (unchanged this pass: "Archive request?" / "This request will be moved out of the active queue. You can still view it from Archived requests."). Footer: Cancel (Ghost group) left, "Archive request" (Default/Destructive, 40px, resolves through the `--color-destructive`/`--color-destructive-content` tokens) right.
- **What did not change:** archive confirmation copy, the archive data mutation (`onArchive`/`onConfirm` still call straight through to `App.jsx`'s existing handler), Queue filtering/counts, or the separate "Archive request" trigger button in `RequestDetailFooter.jsx` (only the confirm dialog it opens was touched — the trigger button itself, `btn btn-outline btn-error`, is untouched, since it is a page-level trigger, not part of the confirmation modal this pass covers).
- **Prop change:** both call sites now pass `confirmVariant="destructive"` (was `"error"`) so the confirm button resolves through the new, correctly-saturated destructive token instead of the softer `--color-error` value used elsewhere in the app for form validation/status semantics.
