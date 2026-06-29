# Galileo Component Rules
Version: 0.1
Status: Living document

## Purpose

This document defines the implementation rules for Galileo UI components.

Galileo uses DaisyUI as the component foundation, but DaisyUI is NOT the design system.
DaisyUI provides implementation primitives. Galileo defines the visual language.
When both differ, Galileo always wins.

---

## General Principles

**1. Never invent component styling.**
If a component is documented here, always follow these rules instead of DaisyUI defaults.

---

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

---

**3. Tokens define colors. Components define behavior.**
Do not confuse them.
Changing color tokens should never change spacing, radius, typography, or sizing.

---

**4. DaisyUI defaults are NOT automatically accepted.**
Every DaisyUI component must be validated against Galileo before use.

---

**5. Never increase density.**
Enterprise tables prioritize information density.
Avoid unnecessary padding or oversized controls.

---

## Enterprise Color Usage

Galileo is intentionally color conservative. Visual hierarchy comes from typography, weight, spacing, and alignment — not color. Color is the last layer of emphasis.

**Default content always uses:**
```
text-base-content
```

**Semantic colors are reserved for:**
- State communication (Accepted, Declined, Pending)
- Projected values (RSV lift, spend reduction, ROAS)
- Success/error outcomes (push confirmed, action failed)
- AI recommendation accents

**Never use semantic colors for:**
- Current business data (Revenue, Spend, ROAS, RSV, Inventory, Forecast)
- Decorative emphasis
- Normal metric values

---

## Status vs Data

Status uses semantic colors. Data does not.

| Type | Color rule | Examples |
|------|-----------|---------|
| Status | Semantic | Accepted, Declined, Pending, Completed |
| Current data | `text-base-content` | Campaign, Ad Group, Current Bid, Current ROAS, Current RSV |
| Projected values | Semantic — `text-success` / `text-error` | Projected RSV Impact, Projected Spend Reduction |

The distinction: **current values are facts. Projected values are decisions.** Only decisions get color emphasis.

---

## Buttons

Table toolbars must use `btn-sm`. Never use default button size inside a toolbar.

```
Accept  → btn-sm btn-success
Decline → btn-sm btn-error
```

Toolbar buttons must not increase row height.

---

## Status Chips (badges)

```
Pending  → badge-sm badge-neutral
Accepted → badge-sm badge-success
Declined → badge-sm badge-error
```

Do not use `badge-ghost` for Pending — it reads as invisible. Use `badge-neutral`.
Do not increase badge size. Do not use pill shapes larger than `badge-sm`.

---

## Tables

Rows are neutral by default: `bg-base-100` with `border-base-300`.

Do NOT apply full-row semantic backgrounds (`bg-success/5`, `bg-error/5`) based on decision state. Color rows only if a specific exception requires it and at opacity ≤ 5%.

Column color rules:

| Column type | Class |
|-------------|-------|
| Identity (Campaign, Ad Group, Keyword) | `text-base-content` or `text-base-content/70` |
| Current data (Spend, RSV, ROAS, Bid) | `text-base-content` |
| Recommended values (Recommended Bid) | `font-semibold text-base-content` |
| Projected positive outcome | `font-semibold text-success` |
| Projected negative outcome | `font-semibold text-error` |
| Projected spend increase | `font-semibold text-warning` |
| Decision status | badge only — see Status Chips |
