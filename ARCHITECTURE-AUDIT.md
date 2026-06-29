# Galileo Prototype Framework — Architecture Audit
## Bid Optimization as Reference Implementation

> Status: Audit complete. Awaiting review before any implementation begins.
> No files were created or modified during this audit.

---

## 1. Current Architecture

The entire prototype lives in a single file: `src/App.jsx` (1,470 lines). There is no routing library, no CSS framework, no component library, and no file separation of any kind. Everything — tokens, formatters, mock data, shared components, state, calculations, and two full render trees — is co-located.

**File inventory and responsibilities:**

| File | Lines | Responsibility |
|------|-------|----------------|
| `src/App.jsx` | 1,470 | Everything: tokens, data, logic, state, UI, two full render modes |
| `src/main.jsx` | 9 | React DOM mount only |
| `index.html` | 13 | Vite entry point |
| `package.json` | 18 | React 18 + Vite only. No Tailwind, no DaisyUI |
| `vite.config.js` | 4 | Vite + React plugin |
| `campaign-bid-optimization.jsx` | 1,470 | Backup / reference copy of App.jsx |
| `ad group reco/` | — | Earlier iteration files (not active) |
| `data viz color/` | — | Existing Galileo Design System HTML + chart playbook (separate, unconnected) |
| `HANDOFF.md` | — | Project context and AI continuity document |

**Internal structure of App.jsx by line range:**

| Lines | Content | Layer |
|-------|---------|-------|
| 4–13 | `const C = {}` — color token object | UI Foundation |
| 16–24 | `fmtCurrency`, `fmtPct`, `fmtBid` | Prototype Data |
| 27–69 | `PAUSE_RECS`, `AD_GROUP_RECS`, `KEYWORD_RECS`, `CHART_DATA` | Prototype Data |
| 72–95 | `Badge`, `Chip`, `FilterSelect`, `KpiCard` | UI Foundation |
| 97–109 | `TableToolbar` | UI Foundation (partially coupled) |
| 112–135 | `ForecastChart` | Feature-specific |
| 139–156 | `Stepper` (Option A) | UI Foundation (partially coupled) |
| 160–204 | `GuidedStepper` (Option B) | UI Foundation (partially coupled) |
| 207–231 | `ScenarioImpactStrip` | UI Foundation (partially coupled) |
| 233–252 | `StepImpactSummary` | UI Foundation (partially coupled) |
| 255–269 | `ReviewSection` | Dead code — never called |
| 272–398 | `App()` — state, handlers, calculations, nav guards | Product Structure + Prototype Data |
| 400–435 | `const s = {}` — style object (36 keys) | UI Foundation |
| 443–586 | `RECS_LIST` data + `RecommendationsPage` component | Product Structure + Prototype Data |
| 590–627 | `PageTopBar`, `ModeSwitcher` | Product Structure |
| 630–1109 | Option B guided render (5 steps + footer) | Product Structure |
| 1112–1468 | Option A contained render (4 steps + footer) | Product Structure |

**Important finding from the `data viz color/` folder:**
A Galileo Design System HTML file already exists with a more complete token set than what `const C` currently implements. It defines CSS custom properties including `--text-primary`, `--surface`, `--border`, `--spend`, `--rsv`, `--ai`, shadow tokens, and dark mode. This is the authoritative Galileo token source. The prototype's `const C` is a simplified subset that diverges from it. The framework's `theme/tokens.js` should reconcile with this file, not be written from scratch.

---

## 2. Main Coupling Problems

**Problem 1 — Everything in one closure**
The `s = {}` style object is defined inside `App()` at runtime, so it re-creates 36 style objects on every render. More critically, it means no child component can access styles without prop-drilling `s` — which is exactly what `TableToolbar` does (`s` is passed as a prop). This is the primary sign that styles need to be lifted out.

**Problem 2 — Two full render trees share no abstraction**
Option A and Option B both render the same three recommendation tables (Pause, Ad Groups, Keywords) with identical column definitions, identical `TableToolbar` usage, and identical row rendering. The only difference is context (one is inside a panel, the other is inside a guided step). This is ~240 lines of duplicated JSX that could be three shared table components.

**Problem 3 — State, calculations, and rendering are fully merged**
`App()` contains: 13 state variables, 18 handler functions, 15 `useMemo` calculations, 2 navigation guard sets, and 2 complete render trees — all in a single function. There is no separation between "what data exists" and "how it's displayed."

**Problem 4 — The `const C` token object diverges from the real Galileo Design System**
The prototype uses hex values (`"#2563EB"` for blue) that differ from the existing Galileo DS tokens (`--ai: #7221B6`, `--rsv: #04AFFF`). The framework needs to reconcile these before extracting the theme layer — otherwise extracted components will use wrong colors.

**Problem 5 — `ForecastChart` is hardcoded to `CHART_DATA`**
The chart component takes no props — it reads `CHART_DATA` directly from module scope. It cannot be reused without modification.

**Problem 6 — `ReviewSection` is dead code**
Defined at line 255, never called anywhere. Should be removed before migration to avoid carrying it into the new structure.

**Problem 7 — Business copy is embedded in JSX**
All button labels, step titles, supporting copy, and summary strings are hardcoded inline throughout the render tree. This makes copy reviews require reading JSX.

**Problem 8 — No DaisyUI or Tailwind**
The proposed framework mentions a Galileo DaisyUI theme, but the current project has zero dependency on either. Adding DaisyUI is a deliberate new infrastructure decision, not an extraction. This needs to be treated as a separate phase, not assumed to be free.

---

## 3. Reuse Classification

| Candidate | Classification | Current Coupling | Recommended Destination | Reason |
|-----------|---------------|------------------|------------------------|--------|
| `const C` tokens | Reusable with normalization | Diverges from real Galileo DS | `theme/tokens.js` | Every future prototype needs the same token set; reconcile with DS first |
| `Badge` | Reusable now | Generic color map, no business logic | `ui/feedback/StatusBadge.jsx` | Used 24× already; will appear in any enterprise prototype |
| `Chip` | Reusable now | Fully generic toggle button | `ui/forms/Chip.jsx` | Appears in target selectors, filter groups — universal pattern |
| `FilterSelect` | Reusable now | Generic select, no logic | `ui/forms/FilterBar.jsx` | Will be needed in any data-heavy feature |
| `KpiCard` | Reusable now | Generic label/value/sub, no domain logic | `ui/data-display/KpiStats.jsx` | Used in both modes; will appear in every feature overview |
| `TableToolbar` | Reusable with normalization | Receives `s` as prop (style coupling) | `ui/data-display/DataTable.jsx` | Pattern is generic; prop `s` must be removed and styles internalized |
| `ForecastChart` | Do not extract | Hardcoded to `CHART_DATA`, SVG-specific to RSV forecasting | `features/bid-optimization/components/` | Pattern is too domain-specific; a generic chart layer is out of scope |
| `Stepper` (Option A) | Reusable with normalization | References `STEP_LABELS` from outer scope | `ui/navigation/Stepper.jsx` | Linear steppers appear in any multi-step workflow |
| `GuidedStepper` (Option B) | Reusable with normalization | Props include `pauseReviewed`, `agReviewed`, `kwReviewed` — domain names | `ui/navigation/GuidedStepper.jsx` | Core concept is generic (steps + counts + click rules); prop names need normalization to `stepCounts[]` |
| `ScenarioImpactStrip` | Reusable with normalization | Generic grid structure; no business logic inside | `ui/data-display/ScenarioImpactStrip.jsx` | Already fully prop-driven; the name "scenario" is domain-neutral enough |
| `StepImpactSummary` | Reusable with normalization | 4-metric bar, hardcoded metric labels partially | `ui/data-display/StepImpactSummary.jsx` | Compact metric row above a table is a common pattern |
| `ReviewSection` | Do not extract | Dead code, never used | Delete | No value; creates confusion during migration |
| `PageTopBar` / `AppShell` | Reusable now | Near-identical in both modes; only text varies | `ui/layout/AppShell.jsx` | Every prototype needs a top bar; already nearly duplicated |
| `ModeSwitcher` | Do not extract | Prototype-only affordance for A/B comparison | `features/bid-optimization/components/` | Not a pattern that appears in production; keep it local |
| `s = {}` style object | Reusable with normalization | Defined inside `App()`, passed as prop to children | `theme/tokens.js` or inlined per component | Keys like `panel`, `th`, `td`, `toolRow` are universal table patterns |
| `RecommendationsPage` | Feature-specific | Tightly coupled to `RECS_LIST`, `wk12Status`, `setCurrentView` | `features/bid-optimization/pages/RecommendationsPage.jsx` | Composition is specific to Bid Optimization landing |
| Pause / AG / KW tables | Feature-specific | Column definitions are domain-specific | `features/bid-optimization/steps/` | Columns differ per rec type; extraction would be thin wrapper |
| All state + handlers | Feature-specific | `decisions`, `selected`, `pauseDec`, `agDec`, `kwDec` | `features/bid-optimization/logic/state.js` | Entirely bid-optimization domain |
| All `useMemo` calculations | Feature-specific | `pauseSpendReduction`, `agRSVLift`, `kwProjectedROAS` | `features/bid-optimization/logic/calculations.js` | Formula logic is domain-specific; extracting it improves testability |
| `PAUSE_RECS`, `AD_GROUP_RECS`, `KEYWORD_RECS` | Feature-specific | Bid optimization mock data | `features/bid-optimization/data/mockData.js` | Data shape is domain-specific |
| `CHART_DATA` | Feature-specific | RSV forecast weeks | `features/bid-optimization/data/mockData.js` | Belongs with other mock data |
| `fmtCurrency`, `fmtPct`, `fmtBid` | Reusable now | No coupling at all | `theme/formatters.js` | Universal formatting utilities; will be needed in every financial prototype |

---

## 4. Recommended Target Architecture

This structure is calibrated to the actual project size. It avoids the abstraction overhead of the full proposed tree while establishing the four-layer separation needed for future prompts.

```
src/
  main.jsx                          ← unchanged

  theme/
    tokens.js                       ← C token object, reconciled with Galileo DS
    formatters.js                   ← fmtCurrency, fmtPct, fmtBid

  ui/
    layout/
      AppShell.jsx                  ← top bar + page wrapper
      StickyActionBar.jsx           ← fixed footer with slot for buttons

    feedback/
      StatusBadge.jsx               ← Badge component (color map)
      SuccessState.jsx              ← push success display

    data-display/
      KpiStats.jsx                  ← KpiCard row
      ScenarioImpactStrip.jsx       ← model vs accepted scenario grid
      StepImpactSummary.jsx         ← compact 4-metric bar above table

    navigation/
      Stepper.jsx                   ← Option A linear stepper
      GuidedStepper.jsx             ← Option B clickable stepper with counts

    forms/
      Chip.jsx                      ← toggle chip (target selector)
      FilterBar.jsx                 ← FilterSelect wrapper

  design/
    design-principles.md
    table-guidelines.md
    copy-guidelines.md
    prototype-guidelines.md

  features/
    bid-optimization/
      pages/
        RecommendationsPage.jsx
        OptimizationPage.jsx        ← shell + mode switcher + routing between A/B

      steps/
        OverviewStep.jsx
        PauseStep.jsx
        AdGroupStep.jsx
        KeywordStep.jsx
        ReviewStep.jsx

      components/
        RecommendationToolbar.jsx   ← TableToolbar (normalized, no prop s)
        ForecastChart.jsx           ← stays here, not extracted
        ModeSwitcher.jsx            ← prototype-only A/B toggle

      data/
        mockData.js                 ← PAUSE_RECS, AD_GROUP_RECS, KEYWORD_RECS,
                                       CHART_DATA, RECS_LIST

      logic/
        calculations.js             ← all useMemo formulas as pure functions
        state.js                    ← useState declarations + handlers

      copy/
        copy.js                     ← step titles, button labels, supporting copy

  App.jsx                           ← top-level composition only (~30 lines)
```

**What was removed from the proposed structure:**
- `app/routes.jsx` — no router needed, `currentView` state is sufficient
- `ui/data-display/DataTable.jsx` — the three recommendation tables are too column-specific to share a generic DataTable; `RecommendationToolbar` is the reusable part
- `ui/feedback/EmptyState.jsx` and `LoadingState.jsx` — not present in current prototype; don't pre-build what doesn't exist yet
- `ui/forms/` was simplified — `FilterBar` wraps `FilterSelect`, that's the only form primitive needed now

---

## 5. Migration Sequence

Each phase is independently reversible. The prototype must render correctly after each phase before proceeding.

---

### Phase 1 — Extract theme and formatters
**Files affected:** New `src/theme/tokens.js`, new `src/theme/formatters.js`, `src/App.jsx` (import replaces inline definitions)

**What changes:** `const C = {}` moves to `tokens.js`. `fmtCurrency`, `fmtPct`, `fmtBid` move to `formatters.js`. App.jsx imports both.

**What does NOT change:** No component logic, no JSX, no styling behavior.

**Outcome:** Token object and formatters are importable by any future feature. The Galileo DS token reconciliation happens here — this is the moment to align `C.blue` with `--ai` or decide they are intentionally different.

**Risk:** Low. Only import paths change. If the reconciliation with the DS tokens changes any color values, visual regression must be checked manually.

**Verification:** App renders identically. No visual diff.

---

### Phase 2 — Extract dead code and isolate mock data
**Files affected:** Remove `ReviewSection` from App.jsx. New `src/features/bid-optimization/data/mockData.js` with all four data constants.

**What changes:** `PAUSE_RECS`, `AD_GROUP_RECS`, `KEYWORD_RECS`, `CHART_DATA`, `RECS_LIST` move to `mockData.js`. App.jsx imports them.

**Outcome:** Data is isolated and independently editable. Replacing mock data in future iterations doesn't require reading the component file.

**Risk:** Very low. Pure data movement.

**Verification:** All tables still render with correct row counts. Landing page still shows 4 rows.

---

### Phase 3 — Extract UI Foundation components
**Files affected:** New files under `src/ui/`. App.jsx imports from them.

**Order within phase:**
1. `StatusBadge.jsx` — Badge (simplest, zero coupling)
2. `Chip.jsx` — toggle button
3. `FilterBar.jsx` — FilterSelect
4. `KpiStats.jsx` — KpiCard
5. `AppShell.jsx` — PageTopBar (merge the two near-identical instances)
6. `StickyActionBar.jsx` — sticky footer wrapper
7. `Stepper.jsx` — Option A stepper (remove `STEP_LABELS` from outer scope, pass as prop)
8. `GuidedStepper.jsx` — normalize prop names (`stepCounts[]` instead of `pauseReviewed` etc.)
9. `ScenarioImpactStrip.jsx` — already prop-driven, move as-is
10. `StepImpactSummary.jsx` — move as-is

**Outcome:** UI Foundation layer is complete. Future prototypes can import any of these without touching Bid Optimization code.

**Risk:** Medium for GuidedStepper prop normalization — changing prop names requires updating all 3 call sites in the guided render. Must be done atomically.

**Verification:** Both Option A and Option B render and interact correctly. Stepper advances, GuidedStepper shows correct counts, ScenarioImpactStrip updates after Accept/Decline.

---

### Phase 4 — Extract calculations and state
**Files affected:** New `src/features/bid-optimization/logic/calculations.js`, new `src/features/bid-optimization/logic/state.js`. App.jsx imports both.

**What moves to `calculations.js`:** All `useMemo` formulas as pure functions that take data arrays and decision maps as arguments. Example: `calcPauseSpendReduction(recs, decisions)`.

**What moves to `state.js`:** All `useState` declarations and handler functions. These stay as React hooks — export a custom hook `useBidOptimizationState()`.

**Outcome:** Business logic is testable independently of React rendering. The formula for `projectedROAS` can be verified in isolation.

**Risk:** Medium. Custom hook extraction requires careful handling of the closure over `decisions` and `selected`. The `useMemo` dependencies must be preserved correctly.

**Verification:** Accept/Decline decisions update scenario metrics correctly. Push simulation works. Navigation guards still block/allow correctly.

---

### Phase 5 — Extract product structure (pages and steps)
**Files affected:** New files under `src/features/bid-optimization/pages/` and `steps/`. `App.jsx` becomes a thin composition layer.

**What moves:**
- `RecommendationsPage` → `pages/RecommendationsPage.jsx`
- Guided mode render (Option B) → split into `OverviewStep`, `PauseStep`, `AdGroupStep`, `KeywordStep`, `ReviewStep`
- Option A render → `pages/OptimizationPage.jsx` containing inline step blocks (or also split into steps if size warrants it)
- `ModeSwitcher` → `components/ModeSwitcher.jsx`
- `ForecastChart` → `components/ForecastChart.jsx`
- `RecommendationToolbar` → normalized version of `TableToolbar` without prop `s`

**Outcome:** `App.jsx` is ~30 lines of composition. Each step is independently readable and editable. A designer reviewing PauseStep only reads that file.

**Risk:** Highest phase. The Pause, AG, and KW tables appear in both Option A steps and Option B steps. The decision here: share one `PauseStep` between both modes (passing mode as prop), or keep them as separate renders. Recommended: share the same step component, controlled by a `variant="guided"|"contained"` prop that adjusts wrapping only.

**Verification:** Full end-to-end flow works in both Option A and Option B. Decisions persist when switching modes. Push works. Landing returns correctly.

---

### Phase 6 — Design documents
**Files affected:** New `src/design/` folder with 4 markdown files.

**What is written:** design-principles, table-guidelines, copy-guidelines, prototype-guidelines — derived from the rules already captured in HANDOFF.md and the brief.

**Risk:** None. No code changes.

**Verification:** Documents exist and are linked from HANDOFF.md.

---

## 6. Do-Not-Extract List

These elements should remain inside `features/bid-optimization/` permanently:

| Element | Reason |
|---------|--------|
| `ForecastChart` | SVG implementation is hardcoded to RSV weekly forecast data shape; no generic version is warranted |
| `ModeSwitcher` | Prototype-only A/B toggle; does not represent a production pattern |
| Pause table columns | `Current ROAS`, `Projected RSV Impact`, `Projected Spend Reduction` are domain-specific; no generic table abstraction earns its weight |
| Ad Group table columns | `recommendedBid`, `optimizedROAS`, `spendChange` — domain-specific |
| Keyword table columns | Adds `keyword`, `matchType` — domain-specific |
| `RECS_LIST` structure | Landing page data shape (with `statusKey`, `dateRange`, `retailer`) is specific to this feature |
| `canContinueStep` guards | Navigation rules reference domain counts; not a generic pattern |
| All `useMemo` calculation formulas | RSV-weighted ROAS, `projectedSpendReduction` — domain math |
| `netSpendChangeG` / `optimizedSpendG` derivations | Bid optimization-specific financial modeling |
| Copy strings in `copy.js` | "Pause Recommendations", "Your accepted scenario" — feature vocabulary |
| `wk12Status`, `appliedCount`, `pendingCount` | Landing status simulation specific to this prototype |

---

## 7. Token-Efficiency Gains

The goal of the framework is that future prompts can be short and precise. Here is what each extraction buys:

**`theme/tokens.js` + `theme/formatters.js`**
Eliminates ~30 lines from every future prompt. Currently any AI working on this file must understand `C.blue`, `C.textSub`, `C.purple` from context. With a named token file, a prompt can say "use Galileo tokens" and the AI reads the file directly.

**`ui/layout/AppShell.jsx`**
Eliminates the full top bar + page wrapper from every future feature prompt. Currently ~20 lines of JSX. A prompt becomes: "wrap in AppShell" instead of redefining avatar, brand name, nav, and layout.

**`ui/navigation/GuidedStepper.jsx`**
The most token-heavy reusable component — 44 lines with complex click logic. Extracting it means future guided workflows say "use GuidedStepper with steps=[…] and stepCounts=[…]" without redefining the visited/clickable/count logic.

**`ui/data-display/ScenarioImpactStrip.jsx`**
Already prop-driven. Any future feature with a model-vs-accepted comparison pattern can use it immediately. The prompt becomes one line: "use ScenarioImpactStrip with modelMetrics and acceptedMetrics."

**`ui/data-display/KpiStats.jsx`**
Eliminates 5 lines per KPI card row from feature prompts. Used in both overview sections; will appear in any feature with performance summary.

**`ui/layout/StickyActionBar.jsx`**
Every multi-step workflow needs a fixed footer. Extracting this means future prompts say "StickyActionBar with back/save/continue buttons" instead of redefining `position:fixed, bottom:0, zIndex:100` every time.

**`features/bid-optimization/logic/calculations.js`**
Doesn't reduce prompt length directly, but allows future prompts like "reuse the ROAS calculation from bid-optimization calculations.js" — making the AI referential rather than regenerative.

**`src/design/` documents**
The largest token-efficiency gain of the entire framework. Currently, design rules like "scenario metrics update only after Accept/Decline" and "do not repeat metrics above and below a table" must be re-stated in every prompt. With `design-principles.md` in the repo, a single prompt line — "follow Galileo design principles" — replaces 10–15 lines of interaction rules. This is the highest-leverage document in the framework.

**Estimated prompt reduction for a new feature built on this framework:**
- Current: a feature prompt must define colors, tokens, shell, stepper, badge styles, table density, button styles, and interaction rules — approximately 80–120 lines of context.
- With framework: colors, shell, stepper, badges, table density, buttons, and interaction rules are referenced by name — approximately 10–20 lines of context.

---

## 8. First Implementation Task

**Extract `src/theme/tokens.js` and `src/theme/formatters.js`.**

Specifically:
1. Move `const C = { … }` from `App.jsx` lines 4–13 into `src/theme/tokens.js` as a named export
2. Move `fmtCurrency`, `fmtPct`, `fmtBid` from lines 16–24 into `src/theme/formatters.js` as named exports
3. Add import statements at the top of `App.jsx`
4. At this point: reconcile `C.blue (#2563EB)` against the Galileo DS file (`data viz color/00_Galileo Design System.dc.html`) and decide whether to align or keep the prototype palette separate — document the decision

This task is the right starting point because:
- It touches zero JSX and zero logic
- It is instantly reversible
- It unblocks every subsequent phase (all components will import from `tokens.js`)
- It forces the DS reconciliation conversation before styles are spread across many files
- Verification is trivial: the app renders identically

Do not proceed to Phase 2 until token reconciliation is resolved.

---

## 9. Known Uncertainties

These require designer or product confirmation before or during migration:

**DS token reconciliation**
The prototype uses `C.blue = "#2563EB"` (a standard Tailwind blue). The Galileo Design System uses `--ai: #7221B6` (purple) as its primary AI/brand color and `--rsv: #04AFFF` for RSV data. These are meaningfully different. Before tokens are extracted, a decision is needed: does this prototype adopt the real Galileo palette, or does it intentionally use a simplified prototype palette? This affects the visual appearance of every button, badge, and accent color.

**DaisyUI adoption**
The audit brief references a "Galileo DaisyUI theme" but the current project has no DaisyUI dependency. Adding DaisyUI is infrastructure work, not a migration — it requires installing the package, configuring Tailwind, replacing inline styles with class names, and verifying visual parity. This is a significant undertaking that should be a separate decision, not assumed to happen during component extraction.

**Shared step components between modes**
Option A and Option B render the same three tables twice. Phase 5 recommends sharing a single step component with a `variant` prop. This needs design confirmation: are the two modes expected to diverge further, in which case keeping them separate is safer, or are they converging toward a single experience, in which case sharing is correct?

**`StepImpactSummary` scope**
`StepImpactSummary` (the compact 4-metric bar in Option A steps 2 and 3) was added by GPT and is not present in Option B. It is unclear whether it should be in Option A permanently, removed, or brought into Option B as well. Its destination in the UI Foundation depends on this decision.

**Copy layer**
A `copy/copy.js` file is proposed for step titles, button labels, and supporting text. This only makes sense if the copy is expected to be iterated on separately from component logic (e.g., for content reviews or localization). If copy is stable, the overhead of a separate file is not worth it at this scale.

**`guidedVisitedMax` forward-only constraint**
Currently the guided stepper allows backward navigation freely but forward navigation only to previously visited steps. If the design intent is to allow free forward navigation once any decision exists, the `guidedVisitedMax` logic needs to change. This should be confirmed before Phase 5 to avoid extracting logic that then needs to be redesigned.
