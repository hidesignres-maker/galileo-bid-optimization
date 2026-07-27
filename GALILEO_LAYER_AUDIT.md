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
