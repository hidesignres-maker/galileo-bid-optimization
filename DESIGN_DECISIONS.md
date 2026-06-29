# Galileo — Campaign Bid Optimization: Design Decisions

> This file records durable product and UX decisions for the prototype.
> It is not a changelog (see HANDOFF.md section 9) and not an architecture audit (see ARCHITECTURE-AUDIT.md, which is outdated).
>
> **Who updates this:** Add an entry only when a decision is made that is stable enough to constrain future work. Do not add speculative or in-progress thinking here.

---

## 1. Workflow structure

**Decision:** The recommendation review workflow is organized by category, not by campaign or by action type.

The five steps are:
1. Overview — context and model projections, no decisions made here
2. Pause — ad groups recommended for pausing
3. Ad Group Bids — bid changes at the ad group level
4. Keyword Bids — bid changes at the keyword level
5. Review & Push — confirmation and push to Skai

**Rationale:** Each category has a distinct data shape and decision context. Mixing them in a single flat list forces users to context-switch constantly. Separating them lets the UI surface category-relevant metrics (e.g. ROAS threshold for Pause, bid delta for Ad Groups) without cluttering the other steps.

**Implication for future work:** Any new recommendation type (e.g. budget caps, dayparting) should get its own step, not be merged into an existing one.

---

## 2. Accept/Decline is the unit of action — not selection

**Decision:** Selecting a row checkbox does not update scenario metrics. Only clicking Accept or Decline changes the "Your accepted scenario" panel.

**Rationale:** This is a deliberate product choice to prevent users from confusing "I'm looking at this" with "I've decided on this." The checkbox is for bulk operations (select → Accept all / Decline all). The scenario strip updates only on committed decisions.

**Implication for future work:** Do not wire checkbox state to metric recalculation. If a scenario preview-on-hover feature is ever added, it must be visually distinct from the committed scenario.

---

## 3. Charts are deferred

**Decision:** `ForecastChart` (SVG, reads `CHART_DATA` directly) is intentionally untouched. No chart migration, no new charting library.

**Rationale:** The chart strategy has not been decided. The current SVG implementation works and is stable. Migrating it before a library decision is locked wastes effort and risks breaking the one piece of the prototype that currently renders complex data.

**Implication for future work:** Do not touch `ForecastChart` until a chart strategy is explicitly scoped. When that phase comes, evaluate: (a) staying with SVG, (b) adopting a library like Recharts or Nivo, (c) replacing with a static image for the prototype. The decision should be driven by whether the chart needs to be interactive or just illustrative.

---

## 4. Table column contract

**Decision:** Every recommendation table in the Guided flow must answer four questions for each row:

| Column type | Question answered |
|-------------|-------------------|
| What changes | The object being modified (campaign, ad group, keyword, bid value) |
| Affected object | The entity in the ad hierarchy that carries the change |
| Expected impact | Projected RSV, ROAS, spend delta — relative and absolute where useful |
| User action | Decision (Pending / Accepted / Declined) |

**Rationale:** Without all four, users cannot make a confident decision. Missing "expected impact" makes the table a list of changes, not a recommendation. Missing "what changes" makes the table unactionable.

**Implication for future work:** Any column addition should map to one of these four. Columns that don't fit (e.g. historical data, audit trail) belong in a detail drawer, not the main table.

---

## 5. Option A is a parallel concept, not a legacy

**Decision:** Option A (Contained Review, 4-step panel) is maintained in the same file as Option B (Guided Scenario Review). It uses legacy inline styles intentionally — it has not been migrated to DaisyUI.

**Rationale:** Both options are live prototypes being evaluated in research. Option A is not "old code to be replaced" — it is an alternative design hypothesis. Migrating it to DaisyUI before a research decision is made would create effort that may be discarded.

**Implication for future work:** Do not migrate Option A to DaisyUI until it is explicitly scoped. Do not delete it. If Option B is chosen as the direction, Option A can then be archived. If both proceed, they should be extracted into separate files.

---

## 6. Color semantics (Galileo DS)

**Decision:** The DaisyUI `galileo` theme maps DS tokens to semantic roles. These mappings are fixed:

| Token | Role | Use |
|-------|------|-----|
| `--ai` purple | `primary` | AI-surfaced recommendations and actions only |
| `--rsv` cyan | `secondary` | RSV metric data |
| `--spend` orange | `accent` / `warning` | Spend metric data |
| `--attr` green | `success` | Positive outcomes, accepted decisions |
| `--incr` pink | `error` | Negative outcomes, declined decisions, below-threshold values |
| `--share` blue | `info` | Share metric data |

**Rationale:** Consistent color → metric associations allow users to scan tables and charts without reading every label. Breaking this (e.g. using green for any positive number, not just attribution-green) degrades the chart/table consistency that the DS is designed to create.

**Implication for future work:** When a number is positive, use `text-success` only if it represents an outcome that is genuinely good (e.g. spend reduction, RSV lift). Do not use it purely because a number is positive. Same logic applies to `text-error`.
