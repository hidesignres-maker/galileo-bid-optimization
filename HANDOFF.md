# Galileo — Campaign Bid Optimization Prototype
## Handoff & AI Context Document

> Este archivo es la fuente de verdad del prototipo. Léelo antes de hacer cualquier cambio. Está escrito tanto para diseñadores como para una IA que retome el trabajo sin contexto previo.

---

## 1. Contexto del proyecto

**Producto:** Galileo — herramienta interna de gestión de campañas para Skai  
**Módulo:** Campaign Bid Optimization  
**Objetivo del prototipo:** Comparar dos experiencias de revisión de recomendaciones de optimización semanal de bids  
**Semana prototipada:** WK12 (Mar 17–23, 2026)  
**Retailer mock:** Walmart – US – Total Walmart  
**Usuario ficticio:** Shirley Chisholm  
**Stack:** React 18 + Vite (sin router, sin librerías externas)

---

## 2. Estructura de archivos

```
Claude/
├── HANDOFF.md                        ← este archivo
├── index.html                        ← entry point HTML para Vite
├── package.json                      ← dependencias: React 18, Vite
├── vite.config.js                    ← configuración Vite con plugin React
├── campaign-bid-optimization.jsx     ← archivo original / referencia
└── src/
    ├── main.jsx                      ← monta <App /> en #root
    └── App.jsx                       ← prototipo completo (archivo activo)
```

**Archivo activo:** `src/App.jsx`  
**Repositorio GitHub:** https://github.com/hidesignres-maker/galileo-bid-optimization  
**Deploy:** Vercel (configurar Framework Preset = Vite para que funcione)

---

## 3. Dos modos de experiencia

El prototipo contiene **dos conceptos en un solo archivo**, controlados por estado:

```js
const [experienceMode, setExperienceMode] = useState("guided");
// "guided"    → Option B — Guided Scenario Review
// "contained" → Option A — Contained Review
```

Un switcher visual aparece en la vista de detalle WK12 (no en la landing de Recommendations). Cambiar de modo **no resetea** ningún estado: decisiones, push status y draft persisten.

---

## 4. Option A — Contained Review

**Concepto:** Todo el flujo en un solo panel scrollable con stepper horizontal.

### Flujo
```
Landing Recommendations → WK12 detail
  └── Panel "Recommendation Review"
        ├── Step 1 — Pause Recommendations
        ├── Step 2 — Ad Group Bid Recommendations
        ├── Step 3 — Keyword Bid Recommendations
        └── Step 4 — Review & Push
```

### Qué muestra siempre (fuera del panel)
- 4 KPI cards globales
- Forecast chart con filtros
- Target selector (RSV / Incremental Sales)

### Step 1 — Pause
- Tabla de 8 filas con: Campaign, Ad Group, Current Spend, Current RSV, Current ROAS, Projected RSV Impact, Projected Spend Reduction, Decision
- Summary row: `X accepted · X declined · X pending · Projected spend reduction: $X`

### Step 2 — Ad Group Bids
- `StepImpactSummary` compacto: Accepted / Projected spend change / Projected RSV lift / Projected ROAS
- Tabla de 8 filas

### Step 3 — Keyword Bids
- Mismo layout que Step 2
- Tabla de 10 filas (añade columnas Keyword y Match Type)

### Step 4 — Review & Push
- Net impact card con barras de comparación (Current vs Optimized)
- Selected actions grid (4 columnas)
- Impact contribution por categoría (Pause / Ad Groups / Keywords)
- Push to Skai → success state

### Navegación
- Continue bloqueado hasta tener al menos 1 decisión en el paso actual
- No hay validación de presupuesto (fue eliminada en la versión limpia)

---

## 5. Option B — Guided Scenario Review

**Concepto:** 5 pasos focalizados con shell persistente. Cada paso es un workspace, no un dashboard.

### Flujo
```
Overview → Pause → Ad Groups → Keywords → Review & Push
    0         1         2          3            4
```

### Shell persistente (visible en todos los pasos)
- Top bar
- ← Back to Recommendations
- Título + status badge + ModeSwitcher
- Retailer / fecha / target
- GuidedStepper compacto

### GuidedStepper
- 5 etapas clicables
- Muestra conteo `reviewed/total` en pasos 1–3
- Review (paso 4) solo clickeable si hay al menos 1 decisión en cualquier categoría
- Pasos anteriores siempre clickeables una vez visitados

### Step 0 — Overview
- Único paso con KPI cards y forecast chart completo
- 4 KPI cards: Current Weekly Spend / Projected Optimized Spend / Projected RSV Lift / Projected ROAS
- 3 category cards: Pause / Ad Groups / Keywords con métricas del modelo
- CTA principal: "Start Review →"
- **No permite Accept/Decline**

### Steps 1–3 — Recommendation steps (Pause / Ad Groups / Keywords)
Cada uno tiene exactamente:
1. Título + copy de una línea
2. `ScenarioImpactStrip` (Model scenario vs Your accepted scenario)
3. Tabla con toolbar (Select all / Accept / Decline)
4. Status line: `X reviewed · X pending`

**Sin:** KPI cards globales, forecast chart, budget strip, ledger de presupuesto

### Step 4 — Review & Push
- Net impact card (barras Current vs Optimized)
- Selected actions (tabla 2 columnas: Actions / Impact contribution)
- Push to Skai → mismo success state que Option A

### Footer por paso
| Paso | Botones |
|------|---------|
| Overview | Save Draft · Start Review → |
| Pause | ← Back · Save Draft · Continue to Ad Groups → |
| Ad Groups | ← Back · Save Draft · Continue to Keywords → |
| Keywords | ← Back · Save Draft · Continue to Review → |
| Review | ← Back · Save Draft · Push to Skai → |

Continue habilitado con al menos 1 decisión en la categoría actual.

---

## 6. ScenarioImpactStrip — componente clave de Option B

```jsx
<ScenarioImpactStrip
  modelMetrics={[...]}      // métricas del modelo (todas las recs)
  acceptedMetrics={[...]}   // métricas de recs aceptadas únicamente
  reviewedCount={N}
  pendingCount={N}
/>
```

- Grid de 3 columnas: Metric / Model scenario / Your accepted scenario
- Fondo blanco plano, sin colores de fondo pesados
- Nota: "Updates after you accept or decline recommendations."
- **Checkbox NO actualiza métricas — solo Accept/Decline lo hace**

### Model scenario (estable, nunca cambia)
Calculado sobre todas las recs de la categoría:
- Pause: suma de `projectedSpendReduction`, suma de `rsvImpact`
- Ad Groups: suma de `spendChange`, suma de `optimizedRSV - baselineRSV`, ROAS ponderado por RSV
- Keywords: misma lógica

### Your accepted scenario (reactivo)
Calculado solo sobre recs con `decision === "accepted"`.  
Declined y Pending quedan excluidos.

---

## 7. Datos mock

### PAUSE_RECS (8 filas)
Campos: `id, campaign, adGroup, currentSpend, currentRSV, currentROAS, rsvImpact, projectedSpendReduction`  
ROAS de todas las filas: 2.2x–2.6x (por debajo del target de 2.8x)

### AD_GROUP_RECS (8 filas)
Campos: `id, campaign, adGroup, currentBid, recommendedBid, baselineRSV, optimizedRSV, spendChange, optimizedROAS`  
Mix de aumentos y reducciones de bid. ROAS optimizado: 4.9x–5.3x

### KEYWORD_RECS (10 filas)
Campos: `id, campaign, adGroup, keyword, matchType, currentBid, recommendedBid, baselineRSV, optimizedRSV, spendChange, optimizedROAS`  
Match types: Exact / Broad / Phrase

### CHART_DATA
9 semanas (W8–W16). W8–W11: actual. W12–W16: baseline + optimized forecast.

---

## 8. Estado compartido entre modos

Todo el estado vive en un solo `App()`. Cambiar de modo no lo resetea.

| Estado | Descripción |
|--------|-------------|
| `decisions.pause / adGroup / keyword` | Objeto `{id: "accepted" \| "declined"}` |
| `selected.pause / adGroup / keyword` | Set de IDs con checkbox activo |
| `pushStatus` | `"idle" \| "pushing" \| "success"` |
| `pushTimestamp` | Timestamp del push exitoso |
| `savedDraft` | Boolean temporal (2s) |
| `target` | `"RSV" \| "Incremental Sales"` |
| `activeStep` | Paso activo en Option A (1–4) |
| `guidedStep` | Paso activo en Option B (0–4) |
| `guidedVisitedMax` | Máximo paso visitado en B (controla navegación) |
| `experienceMode` | `"guided" \| "contained"` |
| `currentView` | `"recommendations" \| "optimization"` |

---

## 9. Historial de cambios

### v1 — Option A original (`opcionA.jsx`)
- Flujo de 4 pasos con lógica de budget carry-forward
- `BudgetStrip` mostraba: Released from pauses / Savings / Allocated / Remaining
- `transitionDelta()` calculaba impacto al presupuesto por decisión
- Validación bloqueaba Accept si excedía el presupuesto disponible
- Columna "Spend Released" en tabla Pause

### v2 — Option A + Option B (`opcionA.jsx` actualizado)
- Se agregó Option B completo (GuidedStepper, ScenarioImpactStrip, 5 pasos)
- Se mantuvo Option A intacto con su lógica de budget
- `experienceMode` state para switch entre modos
- ScenarioImpactStrip con fondos morado/verde pesados

### v3 — Versión limpia (`campaign-bid-optimization.jsx`) ← **VERSIÓN ACTIVA**
Limpieza hecha por GPT sobre v2:
- **Eliminado:** `BudgetStrip`, `transitionDelta`, `budgetDeficit`, `globalRemaining`, `agBudgetError`, `kwBudgetError`, toda la lógica de reallocation budget
- **Renombrado:** `spendReleased` → `projectedSpendReduction` en datos y columnas
- **Agregado en Option A:** `StepImpactSummary` — barra compacta de 4 métricas sobre tabla en Steps 2 y 3
- **Review & Push Option A:** simplificado, sin ledger de presupuesto, con "Impact contribution" en grid 4 columnas
- **ScenarioImpactStrip Option B:** rediseñado con fondo blanco plano, grid simple, copy explicativo
- **Terminología:** eliminado "Spend Released", "Remaining budget", "Allocated", "Reallocation"
- **KPI card Option A:** corregido a "Current Weekly Spend" (antes era "Optimized Spend")
- **canContinue guards:** ya no dependen de budget, solo de `decidedCount > 0`

---

## 10. Limitación conocida

En el `ScenarioImpactStrip` del paso Pause (Option B), el ROAS de "Your accepted scenario" usa `modelPauseROAS` en vez del ROAS calculado solo de filas aceptadas. Es un descuido menor — si se quiere corregir, hay que calcular `acceptedPauseROAS` filtrando `PAUSE_RECS` por `pauseDec[r.id] === "accepted"` y pasarlo como prop.

---

### v4 — Galileo Prototype Framework — Phases 0–4 (2026-06-29)
- **Phase 0:** Baseline build verified (Vite 5, 653ms, clean)
- **Phase 1:** Tailwind CSS 4 + DaisyUI 5 installed; `package.json` `"type":"module"` added to fix ESM-only `@tailwindcss/vite` error
- **Phase 2:** `src/theme/galileo.css` — DaisyUI `galileo` theme created from DS tokens. Semantic role mapping: `--ai` purple → primary (AI accent only), RSV cyan → secondary, spend orange → accent/warning, attr green → success, incr pink → error, share blue → info
- **Phase 3:** `src/theme/formatters.js` (fmtCurrency/fmtPct/fmtBid), `src/ui/AppShell.jsx`, `src/ui/StatusBadge.jsx`, `src/ui/KpiStats.jsx`, `src/design/design-principles.md` (20 rules)
- **Phase 4:** `RecommendationsPage` migrated to DaisyUI (navbar, stats strip, card, table, badges). All behavior preserved: WK12 click navigates, wk12Status reactive to pushStatus, all data intact. `const C` and legacy styles untouched in Option A/B
- **Build output:** 211KB JS + 63KB CSS (galileo theme active, DaisyUI 5.6.5)

---

## 11. Próximas revisiones sugeridas

- [ ] Revisión visual: Overview B, paso Ad Groups, paso Review — ¿el ScenarioImpactStrip ocupa demasiado espacio?
- [ ] Decidir si el ROAS de Pause en "Your accepted scenario" debe corregirse
- [ ] Evaluar si Option A necesita el `StepImpactSummary` o si es suficiente el summary row
- [ ] Conectar datos reales (reemplazar mock data)
- [ ] Decidir cuál modo avanza a siguiente iteración de diseño

---

## 12. Cómo correr localmente

```bash
cd "Desktop/Projects/trabajo/Claude"
npm install
npm run dev
```

Abre `http://localhost:5173`

---

## 13. Contexto para IA — instrucciones de continuidad

Si estás leyendo esto como una IA retomando este proyecto, esto es lo que necesitas saber:

**No toques** `campaign-bid-optimization.jsx` en la raíz — es el archivo de referencia/backup. El archivo activo es `src/App.jsx`.

**Antes de cualquier cambio:**
1. Lee este documento completo
2. Identifica en qué modo aplica el cambio (Option A / Option B / ambos)
3. Verifica que el estado compartido no se rompa al cambiar de modo
4. No reimplementes la lógica de budget carry-forward — fue eliminada intencionalmente

**Reglas de terminología activas:**
- ✅ Projected spend reduction / Projected spend change
- ✅ Projected RSV lift / Projected RSV impact
- ✅ Projected ROAS
- ✅ Model scenario / Your accepted scenario
- ✅ Reviewed / Pending
- ❌ Budget carried forward
- ❌ Spend released for reallocation
- ❌ Remaining budget / Unallocated budget
- ❌ Allocation pool

**Regla crítica de interacción:**
Checkbox → no actualiza métricas de escenario.
Accept/Decline → sí actualiza métricas de escenario.
Esta separación es intencional y debe preservarse.

**Al terminar cualquier cambio**, actualiza la sección 9 (Historial de cambios) con una entrada v4, v5, etc.
