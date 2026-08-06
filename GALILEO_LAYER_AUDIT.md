# Galileo Design-System Layer Audit — Content Request Intake Prototype

Read-only. No code changed. Scope: determine exactly what already exists in the Galileo/Corporate layer on top of DaisyUI and Tailwind, and where product screens bypass it, before making any visual changes.

---

## A. Current Galileo layer map

**1. DaisyUI primitive (base).** Tailwind CSS v4 (CSS-first — no `tailwind.config.js` exists; confirmed by glob) + DaisyUI v5.6.x. Wired in `src/index.css`: `@import "tailwindcss"; @import "./theme/corporate.css"; @plugin "daisyui" { themes: corporate; }`. `vite.config.js` only adds the `@tailwindcss/vite` plugin — no theme logic lives there.

**2. Galileo token/theme layer — `src/theme/corporate.css`.** A single DaisyUI theme, `corporate`, declared via `@plugin "daisyui/theme"`. Defines exactly three token families: color (DaisyUI semantic roles), radius/border (shape), and font-family. Nothing else. This is the only file in the repo that defines a design token.

**3. Galileo UI component layer — `src/components/ui/*`.** Exactly 8 files (confirmed by glob): `Card`, `Table`, `InfoBanner`, `Button`, `Checkbox`, `Input`, `Select`, `UploadDropzone`. Each wraps DaisyUI primitive classes behind a prop contract (e.g. `Input`/`Select` centralize the label+hint+error+required pattern; `Button` centralizes variant/size/icon). No product copy or business logic appears in any of the 8 files.

**4. Product-level composition layer — `pages/*` and the remaining `components/*`.** Assembles the 8 primitives into screens. This is where almost all of the app's actual visual decisions get made — including several that reimplement things the token/component layers don't yet cover (see D).

**What exists, what's missing, what should stay where:**

| Layer | What exists today | What's missing | Should NOT move here |
|---|---|---|---|
| Token/theme | Color, radius/border, font-family | Shadow scale, spacing scale, type-size scale — none defined; `shadow-sm`, `p-4`, `text-sm` etc. are raw Tailwind defaults with no semantic override | Component-specific decisions (e.g. "queue tile background") — those belong one layer up |
| UI component | Card, Table, InfoBanner, Button, Checkbox, Input, Select, UploadDropzone | Badge, Modal/Dialog, Textarea, a "stat tile," a shared eyebrow/label pattern, a shared footer-actions row | Screen layout, business copy, request-type-specific branching |
| Composition | All page/flow layout, all copy, all business-rule-driven rendering | — | Token values (no hex colors found hardcoded in JSX — color usage consistently goes through DaisyUI theme-aware classes like `text-error`, `bg-success/10`) |

The boundary between layers 2 and 3 is intact and clean today: nothing in `ui/*` reads business data, and nothing in `theme/corporate.css` encodes a component decision. The weak boundary is between layers 3 and 4 — several composition files reach past the `ui/` layer straight to raw DaisyUI classes (see D), which is the actual gap, not the token layer.

---

## B. Existing token inventory

From `src/theme/corporate.css`, verbatim:

- **Color** (DaisyUI semantic roles, each with a `-content` pair): `primary` `#0082CE`, `secondary` `#61738D`, `success` `#00A43B`, `warning` `#FDC700`, `error` `#FF6266`, `info` `#0090B5`, `base-100` `#FFFFFF`, `base-200` `#E8E8E8`, `base-300` `#D1D1D1`, `base-content` `#181A2A`, `neutral` `#000000`.
- **Shape**: `--radius-selector: 0.25rem` (checkboxes/radios), `--radius-field: 0.5rem` (inputs/buttons), `--radius-box: 1rem` (cards), `--border: 1px`.
- **Typography**: `--font-primary: "Inter"...`, `--font-code: "Roboto Mono"...` — family only.

**Confirmed absent** (not an assumption — no matching declarations found in `corporate.css` or anywhere else in `src/theme/`):
- No shadow tokens. Every `shadow-sm` in the app is Tailwind's unthemed default.
- No spacing-scale tokens. Every `p-4`, `gap-6`, `mt-3` etc. is raw Tailwind spacing, not a Galileo value.
- No type-size tokens. `text-xs`/`text-sm`/`text-base`/`text-2xl` are raw Tailwind sizes; there is no semantic naming layer (e.g. no `--font-size-label` or similar) over them.

---

## C. Existing UI component inventory

| Component | Wraps | Governed props |
|---|---|---|
| `Card` | `card bg-base-100 border border-base-300 shadow-sm` | `title`, `subtitle`, `actions`, `children` — one visual treatment, no variant prop |
| `Table` | `table` | `children` only — structural wrapper |
| `InfoBanner` | `alert` | variant (info/warning/success/error implied by usage), `children` — single visual register, no severity/role split |
| `Button` | `btn` | `variant` (primary/outline/ghost/text/success), `size`, `icon`, `iconPosition` |
| `Checkbox` | `checkbox checkbox-primary checkbox-sm` | `label`, passthrough props |
| `Input` | `input input-bordered` | `label`, `hint`, `error`, `required`, passthrough props |
| `Select` | `select select-bordered` | `label`, `hint`, `error`, `required`, `options`, `placeholder` |
| `UploadDropzone` | custom dropzone markup | `browseLabel` and drop/browse handling — this is the one component with real interaction logic, not just class wrapping |

---

## D. List of hardcoded or bypassed styles

Confirmed by direct grep/read, not inferred:

- **No Badge component exists**, so every status/type chip is a raw `badge badge-sm badge-*` class, independently re-implemented with its own color-mapping logic in 4 files: `ContentRequestQueue.jsx` (`STATUS_BADGE` map), `ProductLookupTable.jsx`, `ImportCsvStep.jsx`, `ConfirmRequestsStep.jsx`.
- **Button bypassed**: `ProductLookupTable.jsx:49` (`className="btn btn-sm btn-primary"`), `RetailerDatesStep.jsx:63` (`className="btn btn-ghost btn-xs text-error"`) — both use raw DaisyUI button classes instead of `<Button>`.
- **Input bypassed**: `RetailerDatesStep.jsx:54` (`className="input input-bordered input-xs"`), `ImportCsvStep.jsx:204` (search box, `input input-bordered input-sm w-full pl-9`).
- **Repeated hand-written "eyebrow" label pattern** (`text-xs font-semibold text-base-content/50 uppercase tracking-wide`), duplicated verbatim in 4 places rather than centralized: `CreateRequestLauncher.jsx:70`, `RequestSummaryCard.jsx:37` and `:55`, `OpenQuestionsPanel.jsx:41`.
- **InfoBanner bypassed for callout-style boxes**: `ImportCsvStep.jsx:187` builds its own success box (`rounded-box bg-success/10 border border-success/30`) instead of using `<InfoBanner>`.
- **No wrapper for DaisyUI's `collapse`**: `OpenQuestionsPanel.jsx:27` uses the raw `collapse collapse-arrow border border-warning/40 bg-warning/5 rounded-box` class set directly — this is the only collapsible element in the app, so there's no cross-file duplication yet, but it's an ungoverned pattern.
- **No Modal/Dialog primitive**: `CreateRequestLauncher.jsx:45` hand-builds its overlay (`fixed inset-0 z-50 flex items-center justify-center p-4`). It's the only modal in the app today, so duplication isn't demonstrated, but nothing in `ui/` governs this pattern.
- **Wizard footer row duplicated verbatim** (`flex items-center justify-between border-t border-base-300 pt-4`) in three places across two files: `BulkCsvWizard.jsx:86`, `ManualRequestWizard.jsx:173` and `:259`.
- **`ContentRequirementsSection.jsx` does not reuse `UploadDropzone`.** Confirmed by import list: it has no `UploadDropzone` import and instead builds its own mock-upload affordance (`MOCK_FILE_NAMES`, `addMockFile`, a plain `btn btn-sm btn-outline` button). By contrast, `ImportCsvStep.jsx` does correctly import and use `UploadDropzone` — so the existing component is proven reusable, just not reused here.

---

## E. Gaps in the current abstraction

Gaps are additive (missing components/variants), not structural — the existing token/component boundary itself is sound:

- No `Badge` component, despite 4+ independent raw implementations of the same pattern.
- No `Modal`/`Dialog` primitive, despite one hand-built instance already in production use.
- No `Textarea` component (the description field in `ManualDetailsForm` hand-wraps a raw `<textarea>` in `Input`'s label pattern rather than there being a shared component).
- No shared "eyebrow/kicker label" pattern, despite 4 duplicated instances.
- No shared footer-actions row, despite 3 duplicated instances across 2 wizard pages.
- No severity/role split in `InfoBanner` — one visual register serves user-facing status, blocking errors, and internal dev notes alike.
- No `Card` emphasis/variant prop — one visual treatment for every grouping use case (metric tile, form section, table wrapper, summary).
- No stat-tile primitive outside the bespoke `QueueMetricCards`.

None of these require a new token — they're all achievable as new components or new props on existing components, built from the token set that already exists.

---

## F. Recommendation for the safest first visual change

**Add an `emphasis` prop to `Card`** (`"primary" | "default" | "subtle"`, defaulting to `"default"` so current output is unchanged everywhere it's already used). This uses only existing tokens (`base-100/200/300`, `border`, `radius-box`) — no new color, no new spacing value, no new component. It's additive and backward-compatible: nothing breaks if the prop is never passed. It directly addresses the single most-repeated finding in the prior visual-hierarchy audit ("one Card style for everything") and can be adopted one screen at a time.

---

## G. Exact files inspected

Read/inspected this turn: `src/index.css`, `package.json`, `vite.config.js`, `src/main.jsx`, `src/theme/corporate.css`, `src/components/ui/Checkbox.jsx`, `src/components/ui/Select.jsx`, `src/pages/ContentRequestQueue.jsx`, `VISUAL_HIERARCHY_AUDIT.md`; glob for `tailwind.config.*` (none found) and `vite.config.*` (one live file); glob for `src/components/ui/*.jsx` (8 files); grep across `src/` for `badge`, `input input-bordered`, `rounded-box border`, `uppercase tracking-wide`, `btn `, `btn-sm btn-primary`, `btn-ghost btn-xs text-error`, `bg-*/10`/`border-*/30`, `collapse`, footer-row patterns in `BulkCsvWizard.jsx`/`ManualRequestWizard.jsx`, modal markup in `CreateRequestLauncher.jsx`, and imports/contents of `ContentRequirementsSection.jsx` and `ImportCsvStep.jsx`.

Carried over from full reads earlier in this session (content already verified, not re-read): `src/components/ui/Card.jsx`, `Table.jsx`, `InfoBanner.jsx`, `Button.jsx`, `Input.jsx`, `UploadDropzone.jsx`; `src/App.jsx`, `QueueMetricCards.jsx`, `CreateRequestLauncher.jsx`, `ProductLookupTable.jsx`, `RetailerDatesStep.jsx`, `WizardStepper.jsx`, `ManualDetailsForm.jsx`, `InnovationItemInputForm.jsx`, `ManualReviewStep.jsx`, `RequestSummaryCard.jsx`, `BulkReviewStep.jsx`, `ConfirmRequestsStep.jsx`, `OpenQuestionsPanel.jsx`, `BulkCsvWizard.jsx`, `csvTemplate.js`, `models.js`, `formOptions.js`.

---

## 5. Visual audit mapping

Each item from `VISUAL_HIERARCHY_AUDIT.md`'s "Prioritized, low-risk visual improvements" list, classified against what exists today:

1. **Split InfoBanner's user-facing vs. internal/dev-note treatment** → *Requires a new backward-compatible variant.* `InfoBanner` has no role/severity prop today (C, E); adding one is additive and uses only existing color tokens.
2. **Reposition/demote OpenQuestionsPanel below the WizardStepper** → *Requires composition changes only.* Pure render-order/placement change in `BulkCsvWizard.jsx`; no component or token change needed.
3. **Add a `Card emphasis` variant, apply to Queue/Review/Content Requirements** → *Requires a new backward-compatible variant.* Same gap as F's recommendation — this is in fact the safest first change identified in F.
4. **Give Bulk Review's issue rows a stronger visual signal** → *Can be solved with existing Galileo tokens.* `border-error`/`bg-error` at a higher opacity is already available in the theme; no new component or token needed, just a stronger existing-token value in `BulkReviewStep.jsx`.
5. **Convert Bulk Confirm's prose stats into stat tiles** → *Requires composition changes only* if reusing `QueueMetricCards`' existing markup pattern as-is; *requires a new backward-compatible variant* if it should become a formally shared `StatTile` component first. Either path uses only existing tokens.
6. **Emphasize the "Title" column in tables** → *Can be solved with existing component props* — `Table` currently has no "emphasized column" prop, so a per-cell `font-semibold text-base-content` (already-used classes) applied directly in the composing page is achievable today without touching `Table.jsx`; a formal prop would be the cleaner version but isn't required.
7. **Promote "New Request" to a page-level primary action** → *Requires composition changes only.* `Button` already has a `primary` variant; this is a placement change in `ContentRequestQueue.jsx`.
8. **Differentiate Request title/Task description from Assignee/Content type** → *Can be solved with existing component props.* `Input`/`Select`/`RequestSummaryCard` already accept label text; weight differentiation is a className-level change using existing type classes, no new token.
9. **Strengthen WizardStepper's "current step" treatment** → *Requires composition changes only.* No new prop needed — `WizardStepper.jsx` already computes done/current/future state; the accent/weight change is internal to the existing component using existing tokens.
10. **Introduce a StatTile primitive** → *Requires a new backward-compatible variant* (new component, additive, zero risk to existing `QueueMetricCards` callers if extracted carefully).

**Should not be implemented yet:** none of the 10 items require deferral — every one is achievable with the existing token set, either through composition changes or small additive component props. None requires a new token or new color.

---

No code was changed to produce this audit.

---

## H. UI Foundation Update — tokens, Tab, CountBadge, CustomBadge, Card, MetricCard

Appended following the Queue Figma-parity pass. This section documents what is now actually implemented in `src/theme/corporate.css` and `src/components/ui/*`, superseding the specific token *values* listed in Sections A–C above where they disagree (those were correct at the time of the original audit; the theme has since been corrected against Figma — see H.1). The layer *model* and *boundary* described in Section A are unchanged and still accurate. This is a documentation-only pass: no application code was written or changed to produce this section.

### H.1 Page surface token

`main/color/base/200 = #F5F5F7` (Figma). `src/theme/corporate.css`'s `--color-base-200` now resolves to this value — it was previously `#E8E8E8`, a stale/incorrect value corrected in this pass. This is the single canonical token; there is no per-screen alias. (An earlier attempt introduced a separate `--color-page-creation` alias scoped to only the Creation flow, out of caution about repainting every screen — that turned out to be the wrong call once the *canonical* value itself was confirmed wrong, so the alias was removed and `--color-base-200` was corrected at the source instead.)

- Used as the default page/workspace background via the `bg-base-200` utility — `AppShell.jsx`'s outer wrapper (`pageBackgroundClassName` prop, default `"bg-base-200"`) and `App.jsx`'s root `<div data-theme="corporate">`. Applies uniformly to Queue, Read, Edit, and Creation.
- White cards remain `base/100` (`#FFFFFF`, unchanged) — `Card.jsx`'s `bg-base-100`. The two tokens are visually close but distinct; base-200 is the canvas, base-100 is anything sitting on top of it (cards, the nav rail, the module header bar).
- No raw `#F5F5F7` (or `#E8E8E8`) hex literal exists anywhere outside `corporate.css` — every consumer goes through the `bg-base-200` utility.

### H.2 Tab pattern — `src/components/ui/Tab.jsx`

**Contract:** `inline-flex`, `h-10` (40px), `py-px` (1px vertical) `px-3` (12px horizontal), `gap-2` (8px), `justify-center items-center`, `text-sm`, `border-b-2 -mb-px` (the underline).

**States:**
- Default/hover/active all keep the background fully transparent — no DaisyUI `tabs`/`tab-*` classes exist anywhere in this app, so there is no filled-tile class to fight; Tab simply never introduces one.
- Inactive: `text-base-content/60`, `font-normal`, `border-transparent`. Hover only darkens the text to `text-base-content` — never a background.
- Active: `text-primary` + `border-primary` (the 2px bottom border doubles as the underline) + `font-medium`. Weight is deliberately `font-medium` (500), not `font-semibold`/`font-bold` — color and the underline already carry the hierarchy, so the label doesn't also need to feel heavy.
- Focus: explicit `focus-visible:outline outline-2 outline-offset-2 outline-primary` — Tab renders a bare `<button>` with only utility classes (no DaisyUI `.btn`), so this is set explicitly rather than inherited.

**Wrapper surface is a caller concern, not Tab's:** because Tab never paints its own background, whatever sits behind it shows through.
- AppShell's module-nav row wrapper is transparent (no `bg-base-100` fill) and sits directly on the page's own `base-200` canvas — an earlier pass wrongly painted this wrapper white; that was corrected once flagged, since Tab's own transparency only reads correctly if its container is also transparent (or intentionally opaque on purpose, per below).
- Queue's status-tab row sits on the Card's own white `bg-base-100` surface.
- Product Selection's view-toggle row also sits on white.

Both are legitimate — the point is that the wrapper's surface is an explicit choice made by the composition that owns it, not something Tab assumes.

**Inter-tab spacing belongs to the tab-group's own container**, not to Tab: AppShell uses `gap-7`, Queue uses `gap-3` (tightened from `gap-5` for a more compact Figma-parity feel), Product Selection uses `gap-1`. Tab has no opinion on the space *between* tabs, only its own internal geometry.

- **Use when:** any underline-style tab list — status filters, module-level navigation, view toggles.
- **Do not use when:** a boxed/lifted/pill tab treatment is needed — no such variant exists; every tab list in this app uses the underline pattern.
- **Examples:** `AppShell.jsx` (Scores/Changes/Content Request/Insights), `ContentRequestQueue.jsx` (status tabs), `ProductLookupTable.jsx` (All Products/Selected Products).

### H.3 Count badge — `src/components/ui/CountBadge.jsx`

A small, self-contained primitive (not built on DaisyUI's `.badge`) specifically because its active/inactive color needs to be a plain prop rather than fighting a component's own built-in color mechanism.

- **Use for:** a numeric count riding inside a Tab — Queue's per-status counts today.
- **Visual:** `bg-count-badge` (`#EFEFEF`) / `border-count-badge-outline` (`#D5D6D6`) — two dedicated `@theme` tokens in `corporate.css`, not repeated hex. `min-w-[20px] h-5 px-1.5 text-xs font-medium`, `--radius-selector` (4px, the same compact radius DaisyUI's own badges use elsewhere).
- **Inactive:** neutral fill/border, `text-base-content/60`.
- **Active:** `bg-primary/10 border-primary/30 text-primary` — the numeral turns the same blue as its parent Tab's active label, so the two read as one highlighted unit.
- **No retailer dot, ever** — that's CustomBadge's job (H.4).
- **Not for workflow status** — that's StatusPill (H.5).

### H.4 Custom badge — `src/components/ui/CustomBadge.jsx`

Built on DaisyUI's `badge` class as its foundation (base inline-flex/alignment/line-height behavior), with Galileo-specific sizing, spacing, color, and typography layered on top.

- **Use for:** compact metadata tags — Queue's Retailer column today (`WMT`, `TGT`, … plus a `+N` overflow tag).
- **Visual:** `bg-base-200` (neutral light surface) / `border-base-300` (subtle outline), `text-xs font-normal` (no heavy weight), compact `px-1.5 h-5`, `--radius-selector` (4px) — a tighter radius than the rounder 8px status pills use, which keeps the two patterns visually distinct on the same row.
- **`dotColor`** (optional): a Tailwind `bg-*` class rendered as a small circular dot before the label. Omitted entirely for the neutral overflow badge (`<CustomBadge label="+2" />`), which never gets a dot.
- **`title`** (optional): native tooltip carrying the full accessible name (e.g. "Walmart") when `label` is an abbreviation (e.g. "WMT").
- **No semantic workflow meaning** — not a StatusPill substitute, not a CountBadge substitute, not for editable controls or action buttons.
- **Do not** use CustomBadge for status pills, Queue tab counts, editable controls, or action buttons — each of those already has its own established, unrelated component/treatment.

### H.5 StatusPill / CountBadge / CustomBadge — how they differ

There is no single `StatusPill` component file; "StatusPill" here names the existing, consistently-reused treatment (`STATUS_BADGE` + `STATUS_LABEL` + `STATUS_PILL_RADIUS`, exported from `src/pages/ContentRequestQueue.jsx` and consumed by `RequestDetailsCard.jsx`/`RequestDetailHeader.jsx` as well) — it has never been extracted into `ui/*` because it's a color *mapping* (status → semantic hue) as much as a visual treatment, and that mapping is Content-Request-specific business logic, not a generic UI primitive (see Section E: "No `Badge` component" gap, still true for this specific pattern).

| | **StatusPill** | **CountBadge** | **CustomBadge** |
|---|---|---|---|
| Purpose | Show a request's workflow status | Show a numeric count attached to a tab/filter | Show compact metadata (retailer codes, tags) |
| Source | `STATUS_BADGE`/`STATUS_LABEL` map in `ContentRequestQueue.jsx` (not a `ui/*` component) | `src/components/ui/CountBadge.jsx` | `src/components/ui/CustomBadge.jsx` |
| Color behavior | Semantic per status (`badge-soft badge-error/info/success/neutral`) — color *means* something | Neutral by default; blue only when its parent Tab is active — color reflects UI state, not data | Always neutral — color never carries meaning |
| Indicator dot | None | None | Optional colored dot (`dotColor`), omitted for overflow |
| Radius | `--radius-box` (8px) via inline style | `--radius-selector` (4px) | `--radius-selector` (4px) |
| Interaction | None (display only) | None (display only, but visually reflects its parent Tab's active state) | None (display only) |
| Example | Queue table's Status column, `RequestDetailsCard`'s Status row | Queue status-tab counts | Queue table's Retailers column |

**Common mistake to avoid:** using StatusPill's soft-semantic treatment for a numeric count, or using CustomBadge for a workflow status — the three exist precisely so each visual language stays attached to one meaning.

### H.6 Card foundation — `src/components/ui/Card.jsx`

Unchanged base contract: `bg-base-100 border border-base-300`, DaisyUI's `card` class (`radius-box`, 8px), `shadow-sm` by default (`flat` prop omits it for a lighter surface).

**New this pass:** `bodyPadding` prop (default `"p-4"`) — replaces the body's padding utility outright rather than being appended alongside it, avoiding a same-property utility-ordering conflict (Tailwind resolves two same-property utility classes on one element by compiled stylesheet order, which is not something call sites should have to reason about). Every existing caller that doesn't pass this prop renders with the exact same `"p-4"` class as before — `MetricCard` is the only caller that overrides it, to `"p-3"` (12px).

Default `Card` layout remains fully general-purpose — nothing metric- or queue-specific is baked into the base component.

### H.7 Metric card — `src/components/ui/MetricCard.jsx`

Built on `Card` — surface/border/radius/shadow are inherited, not redefined.

- **Geometry:** `w-[194px]`, `bodyPadding="p-3"` (12px), `gap-2` (8px) between label and value, `flex-col items-start text-left` — label above value, both left-aligned. **Corrected this pass:** the original implementation used `items-center text-center`; the approved Figma frame left-aligns this card's content, not centers it — `items-start`/`text-left` is now the only supported alignment (no centered variant exists).
- **No fixed height** — Figma's spec defines width/padding/gap, not height; the card sizes to its content.
- **`variant`** (default `"neutral"`): value text is plain `text-base-content` by default — no color. `"success"`/`"warning"`/`"danger"` variants exist (map to `text-success`/`text-warning`/`text-error`) but are opt-in only; Queue's current approved state uses `"neutral"` for every card. Semantic color should only be applied when the metric's *meaning* actually calls for it (e.g. an overdue count), never as decoration.
- **Shadow:** inherits `Card`'s default `shadow-sm` — confirmed against the compiled CSS to already be an exact match for the Figma `shadow/sm` spec (`0 1px 3px 0 rgba(0,0,0,.10), 0 1px 2px -1px rgba(0,0,0,.10)`), so no separate shadow token was needed.
- **Not interactive** — no `onClick`, no button semantics; a display-only tile.
- **API (as implemented):**
  ```jsx
  <MetricCard label="Due this Period" value={3} />
  <MetricCard label="Overdue" value={2} variant="danger" />
  ```
  `label`/`value` required, `variant` optional.

### H.8 Designer rules per component

| Component | Use when | Do not use when | Required anatomy | Variants | Accessibility | Common mistakes |
|---|---|---|---|---|---|---|
| **Tab** | An underline-style tab list (status filter, module nav, view toggle) | A boxed/pill tab look is needed (no such variant exists) | `active`, `onClick`, label content; caller owns `role`/`aria-selected`/`aria-current`/`aria-controls` | None beyond active/inactive | `focus-visible` outline built in; caller must supply `role="tab"`/`aria-selected` etc. for real tab semantics | Adding a background/fill class to the wrapper behind a transparent Tab; forgetting the wrapper's own surface choice is what actually shows through |
| **CountBadge** | A number attached to a Tab | Any status/workflow meaning | `count`, optional `active` | `active` (boolean) only | Numeral is real text content, not an image/icon | Using CountBadge styling for a retailer tag, or giving it a colored dot |
| **CustomBadge** | Compact metadata tags (retailers, short codes) | Status pills, tab counts, editable controls, action buttons | `label`, optional `dotColor`, optional `title` | Dot present/absent | Full name available via `title` tooltip when `label` is an abbreviation | Using CustomBadge for workflow status; adding weight/size that makes it compete visually with a StatusPill |
| **Card** | Any generic bordered/surfaced grouping | A component-specific pattern already exists (e.g. MetricCard for metric tiles) | `children`; everything else optional | `flat`, `bodyPadding`, `headerClassName`, `bodyClassName` | Inherits whatever semantics its children provide; Card itself has no interactive role | Passing a conflicting `bodyClassName` padding utility instead of using `bodyPadding` |
| **MetricCard** | A small labeled numeric summary tile | A KPI needs to be interactive/clickable (not supported) or needs a non-194px width (not supported) | `label`, `value` | `variant` (`neutral`/`success`/`warning`/`danger`) | Label and value are both real text; no color-only signaling | Reversing label/value order (value must render above the label — wrong); centering the content (Figma left-aligns it — `items-start`/`text-left` is the only supported alignment); applying a semantic variant color with no meaning behind it |
| **SelectField** | A compact toolbar/filter control whose field name and current value should read as one combined 40px control | A stacked form field needing a conventional external label (use `Select` instead) | `label`, `options`, `value`, `onChange`; `placeholder` optional (default `"All"`) | None — one visual treatment | Real `<select>` element (full keyboard support); `aria-label` defaults to `label` for a stable accessible name | Reaching for this in a multi-field form where a traditional stacked label reads better; forgetting the placeholder option stays `disabled` (matches `Select`'s existing behavior — clearing back to the placeholder is the caller's job, e.g. a Reset button, not a dropdown option) |
| **Button — size** | Any button needing a non-default height | — | `size`: `"default"` (40px) / `"small"` (32px) / `"compact"` (24px) | Legacy aliases `"md"`/`"sm"` kept, identical output | Hit target still meets the button's own focus/hover states at every size | Encoding a literal height (`h-8`, `h-6`) at a call site instead of using the semantic `size` prop |
| **Button — emphasis/variant groups** | `variant="primary"` for the one primary action on a view; `variant="destructive"` for an irreversible/destructive confirm action; `variant="neutral" emphasis="light"` for a secondary, non-blue action; `variant="ghost"` for a Cancel/dismiss action | Using `emphasis="light"`/`"soft"` for the primary action; `variant="primary"` for more than one action in the same view; `variant="error"` for a new destructive button (use `"destructive"` — different color, see H.11) | `variant`, optional `emphasis` (`"solid"` default / `"soft"`/`"light"`) | Groups: Default/Primary (`primary` + `solid`), Default/Destructive (`destructive` + `solid`), Light/Neutral (`neutral` + `light`/`soft`), Ghost (`ghost`) | Color is never the only signal — label text always states the action (e.g. "Archive request", not just a red button) | Combining `variant="primary"` with `emphasis="light"` when Figma calls for the Default/Primary *solid* group; using red text on a Ghost Cancel button next to a destructive confirm action |
| **Modal** | Any centered, backdrop-blocking dialog needing the approved 552px/16px-radius/no-visible-X treatment | A full-page flow is more appropriate than a dialog (e.g. the multi-step ManualRequestWizard) | `title`, `children`, `onCancel`; `footer` optional | None — one visual treatment; content and footer buttons vary by caller | `role="dialog"`, `aria-modal`, `aria-labelledby`; real focus trap; Escape closes | Forcing a fixed height on the panel; leaving a visible top-right X when explicit footer dismissal is the approved pattern; building a new hand-rolled overlay instead of composing this |
| **SelectionCard** | Picking exactly one option from a small set (2–4) where each option needs a title + supporting sentence | Numerous options, or options needing only a short label (use a plain radio row instead) | `name`, `value`, `selected`, `title`, `onSelect`; `description` optional | None — one visual treatment | Real `<input type="radio">` inside the clickable `<label>` — full native keyboard/radio-group semantics | Building a visually-selectable card around a decorative or hidden radio instead of a real one; letting the card's visual "selected" state diverge from the radio's actual `checked` state |

### H.9 How future prototypes should consume this

In order, before writing new UI:

1. **Tokens** — `src/theme/corporate.css`. Check whether the color/radius/spacing already exists before reaching for a raw Tailwind value or a new hex.
2. **Shared components** — `src/components/ui/*`. Check whether `Tab`, `CountBadge`, `CustomBadge`, `Card`, `MetricCard`, `Button` (including its `variant`/`emphasis`/`size` taxonomy — H.11), `Table`/`ClampCell`/`NUMERIC_CELL_CLASS` (H.12), `Input`, `Select`, `SelectField` (H.10), `SelectionCard` (H.14), `Modal` (H.13), `ConfirmDialog` (built on `Modal`), `Checkbox`, `InfoBanner`, or `UploadDropzone` already covers the need before building a one-off.
3. **Designer rules** (H.8 above) — confirm the *intended* use case matches; a visual resemblance to an existing component is not enough justification to reuse it for an unrelated meaning (e.g. don't reach for CountBadge just because something needs a small rounded number).
4. **Experience patterns** — `GALILEO_QUEUE_PATTERN.md`, `GALILEO_REVIEW_PATTERN.md`, `GALILEO_ADD_DETAILS_PATTERN.md`. Check whether the screen being built is a variant of an already-documented composition (queue-style list, review shell, details form) before inventing a new page shape.
5. **Prototype-specific data/logic** — only after 1–4 are exhausted should a new screen introduce its own status maps, column lists, filter options, or mock data, kept local to that screen's own files (never migrated into layers 1–3 "just in case" — see Section A's layer boundary).

Skipping straight to step 5 is how the original gaps in Section E accumulated (four independent badge re-implementations, three duplicated footer rows, etc.) — the point of this section is to make steps 1–4 the first stop, not an afterthought.

### H.10 SelectField — `src/components/ui/SelectField.jsx`

New this pass. A shared, additive primitive for the "label inside control" treatment: field name and current value render together inside one 40px control (e.g. "Request Type   All"), rather than a label row above a separate `Select`.

- **Why not extend `Select` (ui/Select.jsx) in place:** `Select`'s label renders above the control by design, and that pattern is still correct for stacked form fields (Create/Edit). The combined treatment is a different visual contract, not a variant of the same one, so it's a separate component rather than a prop toggle on `Select`.
- **Why not DaisyUI's own `.select` wrapper-plus-label composition:** DaisyUI v5's `select.css` does support `<label class="select"><span class="label">…</span><select>…</select></label>`, but its nested `& select` rule stretches the native `<select>` to the wrapper's full width via a negative-margin trick (verified against the compiled DaisyUI source, not assumed) so the entire box stays clickable. Composing that correctly would mean fighting the same mechanism for no more correctness than building the flex row directly, so `SelectField` lays out its own label span + native `<select>` + chevron icon using the app's existing border/height/radius tokens instead.
- **Anatomy:** one `h-10` (40px) bordered control (`border-base-300`, `rounded-field`) containing, in order: a muted `text-sm font-normal` label span (not interactive), the real `<select>` (transparent background, no border of its own, `appearance-none`), and a `ChevronDownIcon` (Heroicons Outline, `w-4 h-4 text-base-content/40`) — the same icon/muting convention `Input.jsx`'s leading icons already use.
- **Accessibility:** the `<select>` stays a real, fully native element — arrow-key/type-ahead/Enter-Space interaction and native focus are unchanged. `aria-label` defaults to `label`'s own text so the accessible name is stable even if the visible label copy changes later. The outer `<label>` wrapping the control also gives a native label/control association as a fallback.
- **Filtering behavior:** identical to `Select` — the placeholder option (`value=""`) is `disabled`, so it displays as the current state but can't be re-selected from the list; returning to it is a Reset-filters button's job, exactly as it already was.
- **Use when:** a compact filter/toolbar control should present its name and value together (Queue's Request Type / Assignee filters). **Do not use when:** the control is one of several stacked fields in a form — use `Select` there.

### H.11 Button — Default / Light / Ghost groups, Primary/Destructive variants, size scale — `src/components/ui/Button.jsx`

Extended across two passes, backward-compatibly both times — every existing caller from before either pass renders with the exact same classes as before.

- **Taxonomy note:** Galileo's approved button system names three groups — Default, Light, Ghost — with Default further split into Primary/Destructive. Button's actual API is `variant` + `emphasis` (not a literal `group` prop), per the explicit instruction that introduced this taxonomy ("if the current API uses variant + emphasis, extend that model consistently rather than introducing incompatible terminology"). The three groups map onto that existing model:
  - **Default** → `emphasis="solid"` (default) — `variant="primary"` | `"destructive"` | `"neutral"` | `"error"` | `"success"`
  - **Light** → `emphasis="light"` (new alias of the pre-existing `"soft"` value)
  - **Ghost** → `variant="ghost"` (already its own thing; doesn't combine with `emphasis`)
- **`emphasis` prop, default `"solid"`:** `"soft"` or `"light"` (exact aliases of each other) append DaisyUI's own `btn-soft` modifier. This reuses the same soft-treatment mechanism already documented for Queue status pills (`badge-soft` + a color modifier, Section 9 / H.5) — a parallel, not a new bespoke technique. `"soft"` is the original prop value (Calendar View still passes it, unchanged); `"light"` is the newer, approved taxonomy name for the identical output — prefer `"light"` in new call sites.
- **`variant="neutral"`:** maps to DaisyUI's `btn-neutral` (`--color-neutral`) — distinct from `"ghost"` (fully transparent, no color at all).
- **`variant="destructive"` (new):** the Default group's second variant — a solid red action button for irreversible/destructive confirmations (Archive). No matching DaisyUI color role exists, so it's resolved via an inline `--btn-color`/`--btn-fg` override to the `--color-destructive`/`--color-destructive-content` tokens (theme/corporate.css) rather than a new `.btn-destructive` class — DaisyUI derives every hover/active/focus/disabled state from those two custom properties via `color-mix`, so this gets full, correct interactive-state parity with every other variant for free. **Deliberately a different token from the pre-existing `"error"` variant** (`btn-error`, `--color-error` = `#FF6266`) — that color is already load-bearing for form validation text and the "Needs Action" status pill throughout the app; `"destructive"` is Figma's distinct, more saturated `main/color/error/error` (`#DC2626`) reserved for this solid button treatment. `"error"` is kept as a legacy alias for existing callers; it is not interchangeable with `"destructive"` and should not be used for new destructive buttons.
- **Approved groups, composed from `variant`/`emphasis`:**
  - **Default / Primary** — `variant="primary"` (default), `emphasis="solid"` (default). Blue fill, white label. The single primary action on a view (e.g. Queue's "New Request", the Create Request modal's "Create request").
  - **Default / Destructive** — `variant="destructive"`, `emphasis="solid"` (default). Solid `#DC2626` fill, white label. An irreversible/destructive confirm action (e.g. the Archive modal's "Archive request").
  - **Light / Neutral** — `variant="neutral" emphasis="light"`. Neutral soft surface (tinted background, no primary-blue fill), neutral text. A secondary action that shouldn't compete with the view's one primary action (e.g. Queue's "Calendar View", still using the original `emphasis="soft"` spelling).
  - **Ghost** — `variant="ghost"`. Fully transparent, neutral text, no border/background in any state. The Cancel action in both the Create Request and Archive modals — never red/destructive text, regardless of how destructive the adjacent confirm action is.
- **Size scale (semantic names):** `size="default"` (40px) / `"small"` (32px) / `"compact"` (24px) — all three map to DaisyUI's own built-in `.btn` size modifiers (no size, `btn-sm`, `btn-xs` respectively; confirmed 40/32/24px against the compiled DaisyUI source, an exact match for the approved 8px-decrement scale, not a coincidence engineered after the fact). Legacy `"md"`/`"sm"` remain as exact aliases for `"default"`/`"small"`.
- **Icon placement:** `icon` (a Heroicons component) + `iconPosition` (`"leading"` | `"trailing"`, default `"trailing"`). Icons before the label use `iconPosition="leading"` (e.g. Calendar View's calendar icon, New Request's plus icon).
- **Approved icon source:** Heroicons Outline (`@heroicons/react/24/outline`) — the same set used everywhere else in this app.
- **Do not:** create a page-specific/modal-specific button component or hand-build button markup inside a page or modal file — extend `Button` backward-compatibly instead, as both passes that touched it did. Do not use `variant="error"` for a new destructive button (use `"destructive"`); do not use `emphasis="light"`/`"soft"` for the one primary action on a view.

### H.12 Global table numeric/monetary-cell rule — `NUMERIC_CELL_CLASS`, `src/components/ui/Table.jsx`

New this pass. A shared class string (not a new component) for any table cell whose primary content is a bare numeric or monetary value.

- **Value:** `"font-code text-xs text-right tabular-nums"`. `font-code` is a real Tailwind utility generated from the `--font-code` token ("Roboto Mono", registered inside an `@theme` block in `theme/corporate.css` specifically so Tailwind v4 generates the utility — the same naming mechanism already documented for `bg-count-badge`/`border-count-badge-outline` in Section 4/H.3). `text-xs` = 12px. `tabular-nums` keeps digit widths consistent if/when a real number replaces a placeholder dash.
- **When it applies:** currency values, monetary metrics, numeric-only values, totals, percentages where the cell's primary content is the number itself.
- **When it does not apply:** dates (excluded unless separately specified), mixed text-and-number content where the number isn't the primary data (e.g. "3 items"), ids, and — importantly — the column **header** itself. A header like "YTD RSV" is a label, not a numeric value; it stays in the normal table-header font/weight and only picks up `text-right` for column alignment, so the label stays readable rather than rendering in a monospace numeric face.
- **Missing values:** a dash (`—`) rendered inside a cell carrying `NUMERIC_CELL_CLASS` still lands right-aligned in the same position a real value would — nothing is fabricated to populate an unmodeled field (see Queue's YTD RSV, Section 10).
- **Do not** apply `font-code`/`NUMERIC_CELL_CLASS` table-wide — it's an opt-in per-column treatment, same pattern as `ClampCell`'s opt-in 2-line clamp.
- **Example:**
  ```jsx
  <td className={`text-base-content/40 ${NUMERIC_CELL_CLASS}`}>—</td>
  ```

### H.13 Modal — `src/components/ui/Modal.jsx`

New this pass. Extracted from two previously hand-rolled, near-identical overlay recipes (`CreateRequestLauncher` and `ConfirmDialog` each built their own fixed-inset + backdrop + centered-panel markup) into one shared primitive — both now compose this instead of duplicating overlay markup.

- **Geometry (this pattern's own component contract, not a general-purpose token):** `max-w-[552px]` on desktop, `w-full mx-4` as the responsive fallback on narrower viewports (paired with the overlay's own `p-4`) — never a hardcoded inflexible width. Height is content-driven — no fixed height anywhere; `max-h-[calc(100vh-2rem)]` + `overflow-y-auto` on the body exists only as a safety net so a very tall body scrolls within the viewport rather than overflowing it, not as a height constraint on the normal case. Radius is 16px via the `--radius-modal` token (theme/corporate.css), applied inline for a guaranteed override — same reasoning as `STATUS_PILL_RADIUS`. White surface (`bg-base-100`), centered via the overlay's `flex items-center justify-center`.
- **No visible top-right close icon.** Dismissal is explicit: the caller supplies a `footer` (typically a Cancel action) and/or the backdrop click / Escape key, all routed through the same `onCancel`. Removing the icon does not remove accessibility — `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` (pointing at the real rendered `title`) are all still present, Escape still closes the dialog, and focus is still trapped and set on open.
- **Focus trap:** on mount, focus moves to the first focusable element inside the panel; Tab/Shift+Tab wrap within the panel's own focusable elements rather than escaping to the page behind the overlay. This is a real (if minimal) trap, broader than the "focus the confirm button on mount" approximation the prior `ConfirmDialog` implementation used on its own.
- **API:** `title` (visible heading + accessible name via `aria-labelledby`), `titleId` (optional, for a caller-supplied id), `children` (body content), `footer` (optional footer row — callers own their own button layout inside it, e.g. `justify-between` for a left Cancel / right primary action), `onCancel` (backdrop click, Escape, and any explicit dismissal control all call this same handler), `bodyClassName`/`className` (optional layout overrides).
- **Use when:** any centered, backdrop-blocking dialog needs the approved 552px/16px-radius/no-visible-X treatment (confirmations, compact creation flows). **Do not use when:** a full-page flow is more appropriate than a dialog (e.g. the multi-step ManualRequestWizard, which is its own page, not a modal).

### H.14 SelectionCard — `src/components/ui/SelectionCard.jsx`

New this pass. Extracted from `CreationMethodSelector.jsx`, which had already built this exact bordered-selectable-card treatment but with Create-Request-specific naming/data baked in — this component is deliberately generic (no "creation method" or "request" language anywhere in it).

- **Anatomy:** one `<label>` (the entire clickable/focusable surface) wrapping a real `<input type="radio">` plus a title (`text-sm font-bold`) and optional description (`text-xs text-base-content/60`) — title hierarchy is visibly stronger than the supporting copy. `name`/`value`/`selected`(→ the radio's `checked`)/`onSelect`(→ `onChange`) map directly onto the underlying radio input — real radio-group semantics and native keyboard behavior (Tab/Space, arrow-key movement within a shared `name`) are unchanged from a plain radio input; nothing here intercepts or reimplements that.
- **Selected/unselected states:** selected — `border-primary bg-primary/5 ring-1 ring-primary`. Unselected — `border-base-300 bg-base-100`, with `hover:border-base-content/30` so an unselected card still reads as interactive.
- **Single source of truth:** the `selected` prop drives both the visual selection treatment and the radio's `checked` state — they cannot drift out of sync, unlike a visual-only card wrapping an independently-styled radio.
- **Use when:** the user must pick exactly one option from a small set (2–4 is typical), and each option needs more explanation than a plain radio row can carry (a title plus a supporting sentence) — e.g. the Create Request modal's "Build Manually" / "Bulk CSV import" choice. **Do not use when:** options are numerous, or each option needs only a short label with no supporting copy — a plain radio row (`RequestTypeSelector.jsx`) is lighter-weight and reads better there.
- **Common mistake to avoid:** rendering the card as a styled `<div>` with a visually-hidden or separately-positioned radio "for decoration" — the radio must be the thing the label actually wraps, so keyboard/assistive-tech users get the same real radio-group semantics as a sighted mouse user.

No application code was changed to produce this section.
