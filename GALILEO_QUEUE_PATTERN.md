# Galileo Queue Pattern v1

Status: **approved baseline.** This document reflects the Content Request Queue implementation as it stands today, after the composition, theme, geometry, soft-pill, and two-line table-cell passes. It documents only what is already implemented and approved — it does not propose new patterns or new visual treatments.

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
2. **UI primitives** — `src/components/ui/*.jsx` (`Card`, `Table`, `Input`, `Select`, `Button`, `Checkbox`, `InfoBanner`, `UploadDropzone`). Generic, product-agnostic wrappers around DaisyUI. Changes only to add a genuinely reusable, backward-compatible capability — never to add product-specific behavior.
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
| `--color-base-300` | `#E4E6EA` |
| `--color-neutral` | `#21272C` |
| `--radius-field` (inputs/buttons) | `0.25rem` (4px) |
| `--radius-box` (cards/surfaces) | `0.5rem` (8px) |
| `--border` | `1px` |
| Font | Inter (`--font-primary: "Inter", ui-sans-serif, system-ui, sans-serif`, applied on `body`) |

**Single Corporate theme owner:** `src/index.css` sets `@plugin "daisyui" { themes: false; }`, disabling every DaisyUI bundled preset theme — including DaisyUI's own built-in theme also named `"corporate"`. `corporate.css`'s `@plugin "daisyui/theme"` block is therefore the only definition of `[data-theme="corporate"]`; there is no duplicate/colliding registration.

Not reassigned this pass (left at DaisyUI defaults, not part of the approved set above): `--radius-selector` (0.25rem, checkboxes/radios), `--color-base-200`, all `-content` pairing colors other than base/primary, `--color-secondary/success/warning/error/info`.

---

## 5. Reusable primitives and variants

Each of these is an optional, backward-compatible addition to an existing primitive — every prior call site keeps its exact previous behavior unless it explicitly opts in.

- **`Button` — `iconClassName`** (default `"w-4 h-4"`): overrides the icon's size only. Use when a specific button's icon must render at a non-default size for Figma parity (e.g., the Queue's "Calendar View" button, whose icon renders at 20px) without resizing icons on any other button.
- **`Card` — `flat`** (default `false`): omits `shadow-sm` for a lighter, flatter surface. Use for compact tiles that sit inside another surface and shouldn't read as a separately elevated card (e.g., the summary cards inside the Queue).
- **`Table` — `flush`** (default `false`): drops the wrapper's own border/`rounded-box` so the table sits flush with whatever bordered surface already contains it, instead of reading as a nested card-within-a-card. Use when a table is the direct content of a `Card` (as in the Queue) rather than a standalone table on a page.
- **`ClampCell`** (new export alongside `Table`): opt-in table cell for text-heavy columns. `<td>` stays the real outer table-cell element (no display override, no reliance on `min-height` on `<tr>`/`<td>`); an inner wrapper (`min-h-12 flex items-center`) preserves the 48px row floor and vertical centering, and an innermost wrapper (`line-clamp-2 break-words`) does the actual 2-line clamp. `className` styles the `<td>` itself; `contentClassName` styles only the clamped text. Use for any single column whose content can meaningfully run to a second line (e.g., a title/description column) where truncating to one line would lose information — not for short, structured values.

---

## 6. Queue composition anatomy

Top to bottom, as implemented in `AppShell.jsx` + `App.jsx` (queue view) + `ContentRequestQueue.jsx`:

1. **App shell** (`AppShell.jsx`) — left nav rail + content area, page-level chrome only.
2. **Module navigation** — blue module header (module name + page group label) and the section-tab row beneath it, both part of `AppShell`.
3. **Page header** (inline in `App.jsx`, queue view only) — title, description, and the Calendar View / New Request actions, right-aligned.
4. **Summary cards** (`QueueMetricCards.jsx`) — two cards above the main queue surface.
5. **Status tabs** — All / Needs Action / In Progress / Completed, each with a live count, inside the queue's `Card`.
6. **Search / filter toolbar** — dominant search input plus Request Type and Assignee filters.
7. **Operational table** — the request list itself, flush with the surrounding `Card`.
8. **Footer** — last-updated label, pagination, rows-per-page control.

---

## 7. Approved geometry

| Element | Value |
|---|---|
| Left nav rail | 52px wide |
| Module header (navbar) | 48px tall |
| Module/section nav row | 40px tall |
| Section rhythm (page vertical spacing) | 24px |
| Page inset (horizontal padding) | 24px |
| Summary cards | 194 × 84px each |
| Gap between summary cards | 24px |
| Toolbar controls (search/filters) | 40px tall |
| Table row height | 48px minimum (fixed for all rows except those using `ClampCell`, which may grow beyond 48px for a wrapped second line) |
| Footer | 64px tall |

---

## 8. Table content rules

- Text-heavy cells may use `ClampCell` (Section 5) to allow up to 2 lines.
- A `ClampCell` row grows naturally to fit a wrapped second line rather than being forced to a fixed height.
- Content is clamped with an ellipsis after 2 lines (`line-clamp-2`).
- IDs, status, dates, assignee, numeric values, actions, and tags remain single-line by default (`whitespace-nowrap`) — clamping is opt-in per column, not a table-wide default. In the current Queue, only the Request title column uses `ClampCell`; every other column stays single-line.

---

## 9. Status pill treatment

The Status column badges use a **soft semantic treatment**:

- Composed from DaisyUI's own built-in `badge-soft` + `badge-{color}` mechanism (`badge.css`) — `badge-soft` consumes the `--badge-color` each color modifier (`badge-error`/`badge-info`/`badge-success`/`badge-neutral`) already sets, via `color-mix(in oklab, var(--badge-color) 8%/10%, var(--color-base-100))` for background/border. This reuses DaisyUI's existing mechanism rather than a bespoke reimplementation.
- Each status **preserves its own semantic color** — Needs Action stays error-toned, In Progress stays info-toned, Completed stays success-toned, Draft stays neutral-toned. Text renders in that same semantic color (readable colored text on a tinted background), replacing the prior white-text-on-solid-fill treatment.
- **Radius is 8px**, applied via an inline style referencing the existing `--radius-box` token (`style={{ borderRadius: "var(--radius-box)" }}`). `.badge`'s own base rule hardcodes `border-radius: var(--radius-selector)` (4px); rather than stack a competing radius utility class — a same-property cascade conflict — the override is applied inline, which always wins regardless of compiled stylesheet order, and introduces no new hardcoded value.
- Galileo theme tokens only: no new hex values were introduced for this treatment.

---

## 10. Content Request-specific configuration

Everything below lives in `ContentRequestQueue.jsx` or its direct imports and is not part of the reusable pattern:

- **Current tabs**: All / Needs Action / In Progress / Completed (`STATUS_TABS`, using `REQUEST_STATUS` from `src/lib/models.js`). "Draft" is a valid status value but has no tab, since no mock data currently uses it; Figma's "Shipped"/"On Hold"/"Archive" tabs were not added, since those aren't values this prototype's model defines.
- **Current columns**: Request title, Request type, Status, Retailers, Content type, Assignee, Due/Launch, Source, row actions — a hardcoded `<thead>` in this file, not a shared column-config structure.
- **Current filters**: search input (by request/brand/SKU/GTIN/UPC/retailer, uncontrolled), Request Type (`REQUEST_TYPE_FILTER_OPTIONS`, derived from `REQUEST_TYPE_LABELS`), Assignee (`mockAssignees`, both from `src/data/formOptions.js`). Both filter placeholders read simply "All."
- **Current mock data**: `mockRequests` (`src/data/mockRequests.js`), passed down through `App.jsx`'s `requests` state; `mockRetailers` (`src/data/mockRetailers.js`) still backs the table's own Retailers column and tag labels even though the toolbar's filter is Assignee, not Retailers.
- **Which parts must not be generalized**: the status set, column list, filter option lists, and retailer-tag overflow rule (`MAX_VISIBLE_RETAILERS`) stay in this file. They must not migrate into `AppShell` or `ui/*` on the assumption a future screen might want something similar — wait for an actual second use case before extracting a shared abstraction.

---

## 11. Known functional gaps

- **Filters are visual-only** — search, Request Type, and Assignee are uncontrolled inputs with no `onChange` wiring; nothing filters the row list.
- **Pagination is visual-only** — "1 2 … 99" and the chevrons are static markup; no page state exists, and all rows always render on one page.
- **Calendar View is not implemented** — the button renders with no click handler.
- **Row actions are not implemented** — the pencil/archive icons are decorative; no edit/archive callback exists anywhere in the prototype.
- **YTD RSV is not modeled** — no such field exists in `Request`; it is not a column.
- **"Completed This Period" is not period-scoped** — `QueueMetricCards` reuses the existing all-time `status === COMPLETED` count; there is no calculation that additionally scopes completions to the current period.
- **Additional statuses are not in the model** — Figma's "Shipped"/"On Hold"/"Archive" tabs have no corresponding `REQUEST_STATUS` value and were not added to the model to support them.
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
