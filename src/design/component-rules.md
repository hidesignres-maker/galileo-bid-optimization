# Galileo Component Rules
Version: 0.2
Status: Living document

## Purpose

This document defines the implementation rules for Galileo UI components.

Galileo uses DaisyUI as the component foundation, but **DaisyUI is NOT the design system.**
DaisyUI provides implementation primitives. Galileo defines the visual language.
When both differ, Galileo always wins.

Standard components should be decent by default by following this document.
Complex analytical components require designer direction — do not infer their design from DaisyUI defaults.

---

## The 90% Alignment Rule

Most of the UI should look and feel consistent with Galileo without requiring custom design every time. This is possible because Galileo follows predictable patterns for common components.

The remaining 10% — charts, scenario analysis, forecasting, complex steppers, analytical workflows — cannot be inferred from token values or DaisyUI primitives. These require explicit designer input before implementation.

**Three layers govern where a component sits:**

| Layer | What it covers | Who decides |
|-------|---------------|-------------|
| **1. Core UI** | Backgrounds, cards, buttons, badges, typography, spacing, standard tables | These rules — follow them directly |
| **2. Enterprise density** | Data tables, metrics, status indicators, recommendation review | These rules + enterprise color section |
| **3. Designer layer** | Charts, forecasting, scenario strips, complex steppers, analytical dashboards | Designer direction required — do not assume |

Rules in layers 1 and 2 guide consistency, not block feature-specific decisions. When a pattern isn't documented here, use judgment and document what you did.

---

## General Principles

**1. Never invent component styling.**
If a component is documented here, follow these rules instead of DaisyUI defaults.

**2. Prefer semantic classes over custom CSS.**

Correct:
```
btn-primary
badge-success
alert-warning
```

Incorrect:
```
style={{background:"#0066FF"}}
```

**3. Tokens define colors. Components define behavior.**
Changing color tokens should never change spacing, radius, typography, or sizing.

**4. DaisyUI defaults are not automatically accepted.**
Every DaisyUI component must be validated against Galileo before use.

**5. Never increase density.**
Enterprise tables prioritize information density. Avoid unnecessary padding or oversized controls.

---

## Layer 1 — Core UI Rules

These apply to all standard components. Following these produces consistent Galileo UI without designer input.

### Backgrounds and surfaces

```
Page background    → bg-base-100
Subtle surface     → bg-base-200
Borders, dividers  → border-base-300
Cards              → bg-base-100 border border-base-300 shadow-sm
```

### Cards

```jsx
<div className="card bg-base-100 border border-base-300 shadow-sm">
  <div className="card-body p-4">...</div>
</div>
```

Do not add colored card backgrounds unless the card communicates a terminal state (success, error).

### Buttons

Standard hierarchy:

```
Primary action   → btn btn-primary
Secondary action → btn btn-ghost or btn btn-outline
Destructive      → btn btn-error
```

Inside toolbars and tables, always use `btn-sm`. Never use default button size in a dense context.

```
Accept  → btn-sm btn-success
Decline → btn-sm btn-error
```

### Badges

```
Pending  → badge-sm badge-neutral
Accepted → badge-sm badge-success
Declined → badge-sm badge-error
Info tag → badge-sm badge-ghost   (labels, match types, non-status chips)
```

Do not use `badge-ghost` for actionable status — it reads as inactive. Use `badge-neutral` for Pending.
Do not increase badge size. Do not use pill shapes larger than `badge-sm`.

### Typography

```
Default text       → text-base-content
Secondary text     → text-base-content/70
Muted / captions   → text-base-content/50
Labels, metadata   → text-xs text-base-content/50
Section headings   → text-base font-bold text-base-content
Subheadings        → text-sm font-semibold text-base-content
```

Typography creates hierarchy before color does.

### Spacing

Use Tailwind spacing scale. Do not use arbitrary values (`p-[13px]`).
Prefer `p-4` (cards), `px-4 py-2` (table footers), `gap-3` (inline flex rows).

---

## Layer 2 — Enterprise Density Rules

These apply to data tables, recommendation reviews, metrics, and status workflows.

### Color philosophy

Galileo is intentionally color conservative. Visual hierarchy comes from typography, weight, spacing, and alignment. **Color is the last layer of emphasis.**

Default content always uses `text-base-content`. Semantic colors are reserved for:

- State communication (Accepted, Declined, Pending)
- Projected / impact values (RSV lift, spend reduction, ROAS projections)
- Success/error outcomes (push confirmed, action failed)
- AI recommendation accents

Never use semantic colors for normal business data. The test: is this a fact or a judgment? Facts are neutral. Judgments (projections, decisions) may use emphasis.

### Status vs Data

| Type | Color rule | Examples |
|------|-----------|---------|
| Status | Semantic | Accepted, Declined, Pending, Completed |
| Current data | `text-base-content` | Campaign, Ad Group, Current Bid, Current ROAS, Current Spend |
| Projected values | `font-semibold text-success` / `text-error` | Projected RSV Impact, Projected Spend Reduction |

**Current values are facts. Projected values are decisions. Only decisions get color emphasis.**

### Tables

Rows are neutral by default: `bg-base-100` with `border-base-300`.

Do not apply full-row semantic backgrounds based on decision state. If a subtle tint is needed, use opacity ≤ 5% and only after explicit designer review.

Column color rules:

| Column type | Class |
|-------------|-------|
| Identity (Campaign, Ad Group, Keyword) | `text-base-content` or `text-base-content/70` |
| Current data (Spend, RSV, ROAS, Bid) | `text-base-content` |
| Recommended values (Recommended Bid) | `font-semibold text-base-content` |
| Projected positive outcome | `font-semibold text-success` |
| Projected negative outcome | `font-semibold text-error` |
| Projected spend increase | `font-semibold text-warning` |
| Decision status | badge only — see Layer 1 Badges |

Use `table table-sm` for all data tables. Never use default table size in a dense UI.

Table toolbar buttons use `btn-sm`. The toolbar must not increase the visual weight of the table header.

### Metric footers

Summary rows below tables (accepted/declined/pending counts) use `text-base-content/70`. They are informational, not status. Only projected impact values in the footer may use semantic color.

---

## Layer 3 — Designer Layer

The following component types **cannot be implemented from these rules alone.** They require explicit designer direction before implementation.

- **Charts and visualizations** — ForecastChart, bar charts, trend lines, sparklines. Color palette, axis style, annotation placement, and interaction states are not inferrable from DaisyUI or token values.
- **Scenario analysis strips** — ScenarioImpactStrip layout, metric grouping, comparison structure.
- **Complex steppers** — GuidedStepper progress indicators, step states, visited/active/locked styling.
- **Forecasting and projection views** — overview cards with model vs accepted scenario comparison.
- **Analytical dashboards** — any view combining multiple data layers, time series, or cross-category summaries.

When working on these, do not apply layer 1 or layer 2 rules without checking against the design. Document any assumption made in the absence of a spec.

---

## Relationship between layers

These layers are additive, not exclusive. A data table uses Layer 1 (card, border, typography) + Layer 2 (neutral rows, column color rules, badge sizes). A chart inside a card uses Layer 1 for the card wrapper + Layer 3 for everything inside the chart.

The goal is that **standard UI is consistent by default, and complex UI is consistent by design.**
