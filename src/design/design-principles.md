# Galileo Prototype — Design Principles

> Rules for building and extending this prototype. Max 20. Read before touching App.jsx.

---

1. **Option B (Guided) is canonical.** It is the future experience. Invest here first.
2. **Option A must remain functional.** Do not delete it. Do not invest in abstracting it for now.
3. **DaisyUI is the component layer.** Use DaisyUI classes for all new UI. Do not introduce new libraries.
4. **Galileo DS is the visual source of truth.** All tokens come from `galileo.css`, never from arbitrary hex values.
5. **`--ai` purple is semantic.** Use it only for AI-surfaced recommendations and actions — not as a general primary brand color.
6. **Data colors are non-negotiable.** `--spend` (orange), `--rsv` (cyan), `--share` (blue), `--attr` (green), `--incr` (pink) must match the DS exactly.
7. **Checkbox ≠ metric update.** Selecting a row checkbox never updates scenario metrics. Only Accept/Decline does. This is a core product decision.
8. **Do not touch mock data shape.** `PAUSE_RECS`, `AD_GROUP_RECS`, `KEYWORD_RECS`, `CHART_DATA` are stable contracts. Change values only intentionally.
9. **State lives in App().** No external state library. Do not extract state this phase.
10. **`const C` is legacy.** Do not add new references to it. Replace usages with DaisyUI classes when migrating a component.
11. **Do not change product behavior.** The prototype's interactions, calculations, and flows are the product being reviewed. Visual migration must preserve them exactly.
12. **`ForecastChart` reads `CHART_DATA` directly.** Do not extract or refactor it this phase.
13. **`StepImpactSummary` stays in App.jsx.** Do not extract it this phase.
14. **`ReviewSection` is dead code.** It is never called. Do not build on it. Remove it before the next major refactor.
15. **`campaign-bid-optimization.jsx` is read-only.** It is the reference/backup. Never modify it.
16. **Run `npm run build` after each phase.** A clean build is the gate for the next phase.
17. **One format, one place.** `fmtCurrency`, `fmtPct`, `fmtBid` live in `src/theme/formatters.js`. Do not duplicate them.
18. **AppShell sets `data-theme="galileo"`.** Every page must render inside AppShell to get the correct theme context.
19. **Keep JSX readable.** Prefer DaisyUI utility class combinations over long inline style objects. Inline styles are acceptable only for data-driven values (e.g. chart widths, dynamic colors from token variables).
20. **Update `HANDOFF.md` section 9 (Historial) after each meaningful change.** v4, v5, etc.
