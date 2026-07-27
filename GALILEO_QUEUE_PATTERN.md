# Galileo Queue Pattern — Reusable Handoff

Status: **Content Request Queue visual experiment complete for this phase.** This document freezes the current implementation as the approved baseline and separates what is reusable Galileo pattern from what is Content Request-specific configuration, so the pattern can be applied to a different prototype without copying business logic.

No code changed to produce this document.

---

## 1. Approved baseline

The following compose the Content Request Queue as it stands today. These are the **approved composition patterns for this prototype phase and should not be changed without an explicit design request**:

- **AppShell** (`src/components/AppShell.jsx`) — left nav rail, blue module header, section nav row, content slot.
- **Page header** (inline in `src/App.jsx`, queue view only) — title, description, Calendar View + New Request actions.
- **Primary queue work surface** (`src/pages/ContentRequestQueue.jsx`, wrapped in `Card`) — the single dominant Card containing tabs, toolbar, table, and footer.
- **Status tabs** — All / Needs Action / In Progress / Completed, with count chips.
- **Search and filter toolbar** — dominant search input, compact secondary Retailers/Request Type filters.
- **Operational table hierarchy** — Request title as the strongest column, muted secondary metadata, compact retailer tags, decorative row actions.
- **Queue footer** — last-updated label, centered pagination, rows-per-page control.

Any further visual change to these six regions is a new design request, not an extension of this pass.

---

## 2. Reusable Galileo structure

### `src/components/AppShell.jsx`
- **Responsibility**: page-level chrome only — nav rail, module header, section tabs, content slot. Renders whatever configuration it's given; reads no request data, state, or business rules.
- **Configurable props**: `moduleName`, `pageGroupLabel`, `navItems` (array of `{ id, label, icon }`), `activeNavId`, `onNavSelect`, `sectionTabs` (array of strings), `activeSectionTab`, `onSectionTabSelect`, `children`.
- **Dependencies**: `@heroicons/react/24/outline` (icons only); existing Galileo/Corporate theme classes (`bg-primary`, `bg-neutral`, `bg-base-100/200/300`, `radius-field`, `border-base-300`). No dependency on any Content Request file.
- **What should remain product-agnostic**: no business copy, no request data, no navigation/routing logic beyond calling the optional `onNavSelect`/`onSectionTabSelect` callbacks it's given. Any new caller supplies its own `navItems`/`sectionTabs`/`children`.

### `src/components/ui/Card.jsx`, `Table.jsx`, `Input.jsx`, `Select.jsx`, `Button.jsx`
- **Responsibility**: each wraps one DaisyUI primitive behind a small prop contract. Already product-agnostic — no changes were made to any of these files in this pass.
- **Configurable props**: `Card` — `title`, `subtitle`, `actions`, `className`, `bodyClassName`; `Table` — structural wrapper only; `Input`/`Select` — `label`, `hint`, `error`, `required`, `className`, `containerClassName`, plus passthrough props (`placeholder`, `options`, etc.); `Button` — `variant`, `size`, `icon`, `iconPosition`.
- **Dependencies**: DaisyUI classes + Corporate theme tokens only.
- **What should remain product-agnostic**: no request-type/status-specific logic. `STATUS_BADGE`/`STATUS_LABEL` maps, filter option lists, and column definitions belong in the page that uses these primitives, not inside them.

### `src/pages/ContentRequestQueue.jsx`
- **Responsibility**: the Content Request-specific composition of the "Galileo Queue pattern" — tabs, toolbar, table, footer assembled from the primitives above.
- **Configurable props**: `requests` (array) — the only prop.
- **Dependencies**: `ui/Card`, `ui/Table`, `ui/Input`, `ui/Select`, plus Content Request data/lib modules (see Section 3).
- **What should remain product-agnostic**: nothing in this file is generic — it is the worked example, not the reusable layer. A different prototype should write its own version of this file, not extend this one with conditionals.

---

## 3. Content Request-specific configuration

Everything below is Content Request business configuration living in `ContentRequestQueue.jsx` (or its imports) — none of it belongs in `AppShell` or `ui/*`:

- **Request statuses**: `REQUEST_STATUS` (`src/lib/models.js`) and the local `STATUS_BADGE` / `STATUS_LABEL` maps and `STATUS_TABS` array in `ContentRequestQueue.jsx`.
- **Columns**: the `<thead>` column set (Request title, Request type, Status, Retailers, Content type, Assignee, Due/Launch, Source, row actions) — hardcoded in this file's JSX, not a shared table-column config.
- **Retailer display**: `mockRetailers` (`src/data/mockRetailers.js`), `retailerLabel()`, `RetailerTags` component, `RETAILER_FILTER_OPTIONS`, `MAX_VISIBLE_RETAILERS`.
- **Request types**: `REQUEST_TYPE_LABELS` (`src/data/formOptions.js`), `REQUEST_TYPE_FILTER_OPTIONS`.
- **Source values**: `req.isPlaceholder` / `req.sourceBatchId` (from `src/lib/models.js`'s `Request` shape) and their "Bulk placeholder" / "Manual" display text.
- **Dates**: `fmtDate()` (`src/lib/format.js`), `getRequestDisplayDate()` (`src/lib/models.js`).
- **Callbacks**: `setIsCreateModalOpen(true)` (New Request, wired in `App.jsx`); everything else in the Queue (tabs, search, filters, pagination, row actions) has no callback — see Section 4.
- **Mock data**: `mockRequests` (`src/data/mockRequests.js`), passed down from `App.jsx`'s `requests` state.

---

## 4. Visual-only controls

Every control below is currently decorative — present for visual fidelity to the Figma reference, wired to nothing:

| Control | State |
|---|---|
| Calendar View button | No handler; button renders and does nothing on click |
| Status tabs (All / Needs Action / In Progress / Completed) | Counts are computed live from `requests`, but clicking does not filter — "All" always displays as active and all rows always render |
| Search input | Uncontrolled `<Input>` — accepts typing, has no `onChange`, does not filter |
| Retailer filter | Uncontrolled `<Select>` — lists real retailer names, does not filter |
| Request type filter | Uncontrolled `<Select>` — lists real request type labels, does not filter |
| Pagination ("1 2 … 99" + chevrons) | Static markup, no page state exists, all rows always render on one page |
| Rows-per-page ("50 Rows") | `<Select>` with an empty `options` array — shows the placeholder only |
| Row actions (pencil / archive icons) | Decorative icons, no `onClick`, no edit/archive feature exists anywhere in the prototype |

---

## 5. Reuse instructions — applying this pattern to a different prototype

Example: building a "Scores" queue-style screen in a new prototype, without copying any Content Request logic.

1. **Copy the reusable layer only.** Bring over `src/components/AppShell.jsx` and the `src/components/ui/*` primitives (`Card`, `Table`, `Input`, `Select`, `Button`, plus `Checkbox`/`InfoBanner`/`UploadDropzone` if needed) and the theme files (`src/theme/corporate.css`, the Tailwind/DaisyUI wiring in `index.css`/`vite.config.js`). Do not copy `ContentRequestQueue.jsx`, `models.js`, `formOptions.js`, `mockRequests.js`, or `mockRetailers.js`.
2. **Define your own data shape.** Write a `models.js` (or equivalent) for the new domain's entity — its own status enum, its own display fields. Do not reuse `REQUEST_STATUS` or `Request`.
3. **Write a new page component**, e.g. `ScoresQueue.jsx`, modeled structurally on `ContentRequestQueue.jsx`: one `Card` containing a tabs row, a toolbar row (`Input` for search, `Select` for filters), a `Table`, and a footer row — but with your own status/column/filter definitions, following the same "visual-only until a real filter is requested" discipline from Section 4.
4. **Wire `AppShell` with new config**, not new code: pass your own `navItems`, `sectionTabs`, `activeNavId`, `activeSectionTab`, `moduleName`, `pageGroupLabel` from your app's top-level component. Do not fork `AppShell.jsx` itself — if it's missing a capability, that's a signal to extend its props (backward-compatibly), not to copy the file.
5. **Reuse the page-header pattern by hand**, not by extracting a shared component yet: title + description on the left, secondary + primary `Button`s on the right, same as the Queue view's header block in `App.jsx`. (See Section 6 on why this isn't generalized into a shared component yet.)
6. **Build and verify** the new screen compiles and that `AppShell`'s existing consumers (this Queue) are unaffected — the same isolated-build discipline used throughout this prototype.

---

## 6. Guardrails

- **Figma is the visual source of truth** — layout, spacing, density, and composition should trace back to an approved Figma reference, not intuition.
- **Product state/data remain the functional source of truth** — `requests[]`, `models.js`, business rules, and validation are never adjusted to match a screenshot.
- **Use the existing Galileo/Corporate theme and `ui/*` wrappers** — no bespoke DaisyUI markup where a wrapper already exists; no bypassing `Input`/`Select`/`Button`/`Card`/`Table` for raw classes.
- **Do not add product logic to `AppShell` or shared presentation components** — they render configuration, they don't know what a "request" or a "status" is.
- **Do not invent new tokens when existing semantic tokens are sufficient** — no new colors, no arbitrary hex values, no arbitrary pixel values; use the color/radius/border/font tokens already defined in `corporate.css` and DaisyUI's existing size/utility classes (`badge-sm`, `select-sm`, `w-32`, etc.).
- **Do not generalize screen-specific rules into the shared pattern** — e.g. Content Request's status set, column list, and retailer-tag overflow rule stay in `ContentRequestQueue.jsx`; they must never migrate into `AppShell` or `ui/*` "just in case" a future screen wants something similar. Wait for the next real use case before extracting a shared abstraction.

---

## 7. File inventory

**Files added:**
- `src/components/AppShell.jsx`
- `VISUAL_HIERARCHY_AUDIT.md`
- `GALILEO_LAYER_AUDIT.md`
- `GALILEO_QUEUE_PATTERN.md` (this file)

**Files modified (this Queue visual-fidelity phase):**
- `src/App.jsx` — wrapped in `AppShell`; queue-view page header (title/description/actions) added; queue `<main>` width made view-conditional; Manual/Bulk views unchanged.
- `src/pages/ContentRequestQueue.jsx` — full composition rebuild (tabs, toolbar, table, footer) inside one `Card`.

**Files intentionally left untouched (not deleted, simply no longer rendered by the Queue):**
- `src/components/QueueMetricCards.jsx` — its count logic was the reference for the new tab counts, but it is not imported or rendered anymore.

**Files confirmed unchanged this phase** (no edits made): `src/lib/models.js`, `src/lib/businessRules.js`, `src/data/mockRequests.js`, `src/data/mockRetailers.js`, `src/data/formOptions.js`, `src/lib/format.js`, `src/pages/ManualRequestWizard.jsx`, `src/pages/BulkCsvWizard.jsx`, `src/components/CreateRequestLauncher.jsx`, and every file under `src/components/ui/`.

**Files that contain reusable Galileo code:**
- `src/components/AppShell.jsx`
- `src/components/ui/Card.jsx`, `Table.jsx`, `Input.jsx`, `Select.jsx`, `Button.jsx`, `Checkbox.jsx`, `InfoBanner.jsx`, `UploadDropzone.jsx`
- `src/theme/corporate.css`, `src/index.css`, `vite.config.js`

**Files that contain Content Request-specific code:**
- `src/pages/ContentRequestQueue.jsx`
- `src/lib/models.js`, `src/lib/businessRules.js`, `src/lib/format.js` (formatters are generic utilities but currently only consumed by Content Request views)
- `src/data/mockRequests.js`, `src/data/mockRetailers.js`, `src/data/formOptions.js`
- `src/App.jsx`'s queue-view header block and breadcrumb config (the shell wiring itself, `<AppShell>` usage, is reusable; the view-switch content inside it is Content Request-specific)

---

## 8. Validation

Verified by rebuilding the project in an isolated copy (`npm install` + `npx vite build`) immediately before writing this document:

```
vite v5.4.21 building for production...
transforming...
✓ 718 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.72 kB
dist/assets/index-*.css         324.35 kB
dist/assets/index-*.js          224.03 kB
✓ built in 1.39s
```

Confirmed:
- **Build passes**: yes.
- **State unchanged**: yes — `App.jsx`'s `useState` hooks (`view`, `requests`, `isCreateModalOpen`, `initialManualRequestType`) are identical to before this phase.
- **Models unchanged**: yes — `src/lib/models.js` was not edited.
- **Validation unchanged**: yes — no validation logic exists in the Queue, and the wizards' validation files were not touched.
- **Navigation behavior unchanged**: yes — `goTo`, `handleLauncherContinue`, and all breadcrumb targets are unchanged.
- **Request creation unchanged**: yes — `handleRequestCreated`/`handleRequestsCreated` and both wizards are untouched.
- **Mock data unchanged**: yes — `mockRequests.js`/`mockRetailers.js`/`formOptions.js` were not edited.
- **Business rules unchanged**: yes — `src/lib/businessRules.js` was not touched at any point in this phase.

Not committed or pushed, per instruction.
