# Content Request Intake — Technical Handoff

Static front-end prototype (React + Vite + Tailwind/DaisyUI). No backend, no API, no database, no auth, no real CSV parsing. All data is in-memory React state, seeded from mock files. Purpose: let PepsiCo/Galileo stakeholders review and debug the intake + bulk-planning flow for Content Requests (Viz ID Change, Brand Request, Innovation) before it's built for real.

Repo: `galileo-bid-optimization` on GitHub, `master` branch, project files at repo root (not nested in a subfolder).

---

## 1. App architecture

**Top-level flow:**

```
Content Request Queue  →  (New Request opens CreateRequestLauncher modal)  →  Build Manually | Bulk CSV Import  →  (create)  →  back to Queue
```

There is **no client-side router** (no react-router, no URL changes). `src/App.jsx` is a single component holding a `view` string in `useState` and conditionally rendering one of three pages based on its value, plus a modal rendered on top when open. This was a deliberate choice for a throwaway prototype — swap in real routing later if this survives past the review stage.

There used to be a fourth view, `"entry"` (a full page, `NewRequestEntry`, asking only for creation method). It's been replaced by `CreateRequestLauncher`, a modal opened directly from the Queue's "New Request" button — see below. `NewRequestEntry.jsx` has since been deleted from the repo; nothing imports it.

**View control:** `App.jsx` owns `const [view, setView] = useState("queue")` (valid values now: `"queue"`, `"manual"`, `"bulk"`) plus two more state values that back the modal:
```js
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [initialManualRequestType, setInitialManualRequestType] = useState(null);
```
A `goTo(v)` helper just calls `setView(v)`. Each page receives callbacks (`onNewRequest`, `onCreateRequest`, `onRequestsCreated`, `onCancel`) that call `goTo(...)` or toggle the modal — pages never manage navigation themselves.

**The Create Request modal:** Queue's "New Request" button now calls `setIsCreateModalOpen(true)` instead of navigating anywhere. `CreateRequestLauncher` (`src/components/CreateRequestLauncher.jsx`) is conditionally mounted (`{isCreateModalOpen && <CreateRequestLauncher .../>}`), so its internal state resets every time it opens. It asks for creation method (Build manually / Bulk CSV import) and, **only when Build manually is selected**, a required Request Type (Viz ID Change / Brand Request / Innovation) — because Manual creates exactly one request and the type can't be deferred. Selecting Bulk CSV shows informational copy instead ("Bulk CSV supports mixed request types...") since each row supplies its own type. On Continue:
```js
const handleLauncherContinue = (method, requestType) => {
  if (method === "manual") {
    setInitialManualRequestType(requestType);
    setView("manual");
  } else {
    setInitialManualRequestType(null);
    setView("bulk");
  }
  setIsCreateModalOpen(false);
};
```
`initialManualRequestType` is then passed into `ManualRequestWizard` as the `initialRequestType` prop (see §5) so the wizard skips its old in-page type gate and renders the correct step list immediately.

**Navigation without routing:** `App.jsx` also renders a breadcrumb strip above every page, driven by a lookup table:

```js
const BREADCRUMB_BY_VIEW = {
  queue: [["Content Request Queue"]],
  manual: [["Content Request", "queue"], ["New Request", "queue"], ["Build Manually"]],
  bulk: [["Content Request", "queue"], ["New Request", "queue"], ["Bulk CSV Import"]],
};
```

Each breadcrumb segment is `[label, targetView?]` — clicking a segment with a `targetView` calls `goTo(targetView)`. Since there's no `entry` view anymore, the "New Request" segment and the back-arrow icon both just return to `"queue"` from `manual`/`bulk`.

**Views/pages that exist:**
| view value | Page component | Purpose |
|---|---|---|
| `"queue"` | `ContentRequestQueue` | Dashboard/list of all requests |
| `"manual"` | `ManualRequestWizard` | Build one request by hand |
| `"bulk"` | `BulkCsvWizard` | Create many requests from a CSV |

`CreateRequestLauncher` is a modal, not a view — it layers on top of whichever view is current (always `queue`, in practice, since it's only opened from there).

---

## 2. Component map

### `src/App.jsx`
View state machine + breadcrumb + the in-memory "requests database" (see §3). Renders exactly one page per current `view`. No business logic lives here beyond wiring create-callbacks to `setRequests`.

### `src/pages/`
- **`ManualRequestWizard.jsx`** — The manual flow. Owns all manual wizard state (see §3). Accepts an optional `initialRequestType` prop — when provided (normal path, via the launcher modal), the old in-page `RequestTypeSelector` gate is skipped entirely and `requestType` initializes straight to that value; when omitted, the gate still renders as a fallback so the component works standalone. Renders a `WizardStepper` + one of `ManualDetailsForm` / `ProductLookupTable` / `InnovationItemInputForm` / `RetailerDatesStep` / `ManualReviewStep` depending on `requestType` and `currentStep`. Calls `onCreateRequest(request)` once, at the end.
- **`BulkCsvWizard.jsx`** — The bulk flow. Owns `currentStep`, `rows`, `batch`. Renders `OpenQuestionsPanel` + `WizardStepper` + one of `CsvTemplateStep` / `CsvUploadStep` / `BulkReviewStep` / `ConfirmRequestsStep`. Calls `onRequestsCreated(requests[], batchMeta)` once, at Confirm.
- **`ContentRequestQueue.jsx`** — Renders `QueueMetricCards` + a `Table` of every request. Read-only; "New Request" button calls `onNewRequest` (→ opens the `CreateRequestLauncher` modal in App, does not navigate).

*(`NewRequestEntry.jsx` used to live here — it's been deleted. See §1.)*

### `src/components/`
- **`CreateRequestLauncher.jsx`** — The Create Request modal (replaces the old `NewRequestEntry` page). Local state: `method` (`null | "manual" | "bulkCsv"`), `requestType` (`null | "vizId" | "brandRequest" | "innovation"`). Reuses `CreationMethodSelector` for the method cards and `RequestTypeSelector` for the type radios. `canContinue` is `Boolean(requestType)` when method is `"manual"`, or simply `true` when method is `"bulkCsv"` — Bulk never needs a type here. Calls `onContinue(method, requestType)` (`requestType` is `null` for Bulk) and `onCancel()`.
- **`CreationMethodSelector.jsx`** — Two-card radio (Build manually / Bulk CSV import). Presentational, `value`/`onChange` props. Card copy: "Create one request by completing a form." / "Create multiple requests from a spreadsheet. Each row becomes one request."
- **`RequestTypeSelector.jsx`** — Inline radio row for the three request types. Used by `CreateRequestLauncher` (Manual method only) and as `ManualRequestWizard`'s fallback gate when no `initialRequestType` is passed in. **Not** used in `CsvTemplateStep` (see §6).
- **`ManualDetailsForm.jsx`** — Task Title, Description, (conditionally) a default date, Assignee (optional), Content Type checkboxes. Shared by all three manual flows. Takes `showDate` prop (false for Innovation).
- **`ProductLookupTable.jsx`** — Search-and-select table over `mockProducts`. Used by Viz ID and Brand Request manual flows only. Local `query` state; selection state (`selectedProductIds`) lives in the parent wizard.
- **`InnovationItemInputForm.jsx`** — Repeater of 2-column item cards (not a table, not a product lookup) for Innovation manual mode. Column 1: UPC, Customer ID, Product Title, Brand. Column 2: Retailer, Start Ship Date (conditional), On Sale Date, eComm Pack Details. Exports `makeBlankItem()`. This is where Innovation's retailer gets captured — which is why Innovation never shows a Retailers step.
- **`RetailerDatesStep.jsx`** — Table of retailer+date groups with an editable date and a Remove action. **Viz ID / Brand Request only.**
- **`ManualReviewStep.jsx`** — Composes `RequestSummaryCard` + either an item-input table (Innovation) or a retailer-launch-groups table (Viz ID/Brand Request).
- **`RequestSummaryCard.jsx`** — Read-only key/value summary card, branches once on `requestType === "innovation"` vs the shared Viz ID/Brand Request shape.
- **`WizardStepper.jsx`** — Generic numbered-circle stepper. Takes a `steps: string[]` prop — **not hardcoded** — because Manual (4 or 2 steps depending on type) and Bulk (its own 4 steps) have different step lists.
- **`CsvTemplateStep.jsx`** — Bulk step 1. Shows the combined CSV column list and a "Download Template" button that generates a real client-side CSV blob (header row only, no data). No request-type selector here anymore.
- **`CsvUploadStep.jsx`** — Bulk step 2. `UploadDropzone` + three manual "simulate" links (success/empty/failed). On success, calls `onUploadComplete(mockBulkRows)` — the literal imported mock array, unmodified.
- **`BulkReviewStep.jsx`** — Bulk step 3. Table of rows as future requests. Columns: Status, Request Type, Title, Retailer, Date, Content Type, Notes/Issues.
- **`ConfirmRequestsStep.jsx`** — Bulk step 4. Shows a per-request-type count breakdown and the "Create N Requests" CTA.
- **`QueueMetricCards.jsx`** — 4 derived counters (In Progress / Due This Period / Completed / Needs Action) computed from the live `requests` array each render.
- **`OpenQuestionsPanel.jsx`** — Collapsible `<details>` listing unresolved product questions + a "Resolved this round" list. Currently rendered **only** inside `BulkCsvWizard`.
- **`components/ui/`** — `Button`, `Card`, `Checkbox`, `InfoBanner`, `Input`, `Select`, `Table`, `UploadDropzone`. Thin DaisyUI wrappers, no business logic. `Button` takes an optional `icon` (Heroicon component) + `iconPosition`; variants: `primary | ghost | outline | error | success | text`.

### `src/data/`
- **`mockProducts.js`** — 10 hardcoded products (id, description, brand, upc, ean, retailers[]). Catalog for `ProductLookupTable`.
- **`mockRetailers.js`** — 7 retailers (`{code, name}`), e.g. `AMZ`/Amazon, `WMT`/Walmart. `getRetailerByCode` helper.
- **`mockRequests.js`** — 6 seed `Request` objects (built via `createRequest(...)`) for the Queue on first load — mix of manual and `bulkCsv`/placeholder origin, across all 3 request types and several statuses.
- **`mockBulkRows.js`** — 7 seed `BulkRow` objects (built via `createBulkRow(...)`) — **deliberately mixed**: 3 vizId, 2 brandRequest (one flagged `issue`), 2 innovation. This is what `CsvUploadStep`'s "success" simulation returns.
- **`formOptions.js`** — Static lookup tables: `CONTENT_TYPE_OPTIONS_BY_FLOW`, `mockAssignees`, `REQUEST_TYPE_LABELS`, `DATE_FIELD_LABEL_BY_FLOW`.

### `src/lib/`
- **`models.js`** — The data model. Factory functions `createRequest`, `createBulkRow`, `createBulkBatch`; `bulkRowToRequest(row, batchId)` (the Bulk→Request mapper); `distinctRequestTypes(rows)`; `isDueThisPeriod(dateStr)`; `REQUEST_STATUS` / `BULK_BATCH_STATUS` enums; `nextId(prefix)` (a module-scoped incrementing counter, e.g. `REQ-1042`).
- **`businessRules.js`** — Named, testable scenario rules: `isStartShipDateRequired(retailerCode)` (true only for `"AMZ"`), `isItemRowValid(row)`, `getDetailsValidationErrors(formData, { requireDate })`, `ALWAYS_REQUIRED_ITEM_FIELDS`.
- **`groupByRetailer.js`** — `groupProductsByRetailer(products, defaultDate)` and `groupItemsByRetailer(itemInputs)` — pure functions that derive retailer+date buckets from wizard state. Used by `RetailerDatesStep` and `ManualReviewStep` (Viz ID/Brand Request only — Innovation doesn't use these).
- **`format.js`** — `fmtDate`, `fmtCount`, `todayIso`.

---

## 3. State model

**Where `requests[]` live:** Only in `App.jsx`, via `const [requests, setRequests] = useState(mockRequests)`. This is the single in-memory "database" for the whole prototype. No component below `App` holds a copy of the full list — `ContentRequestQueue` just receives it as a prop and renders it.

**`App.jsx`'s other state:** `view` (`"queue" | "manual" | "bulk"`), `isCreateModalOpen` (bool — controls whether `CreateRequestLauncher` is mounted), `initialManualRequestType` (`null | "vizId" | "brandRequest" | "innovation"` — set right before switching to `"manual"`, passed straight through as `ManualRequestWizard`'s `initialRequestType` prop).

**How manual-created requests are added:**
1. `ManualRequestWizard` builds one `Request` object at "Create Request" time (see §5) and calls `onCreateRequest(request)`.
2. `App.jsx`'s `handleRequestCreated(request)` does `setRequests(prev => [request, ...prev])` and `setView("queue")`.

**How bulk-created requests are added:**
1. `BulkCsvWizard`'s Confirm step filters `rows` to "ready" ones, maps each through `bulkRowToRequest(row, batch?.id)`, producing an array of `Request` objects, and calls `onRequestsCreated(newRequests, batchMeta)`.
2. `App.jsx`'s `handleRequestsCreated(newRequests)` does `setRequests(prev => [...newRequests, ...prev])` and `setView("queue")`. (`batchMeta`, the second argument, is currently **not** persisted anywhere — App's handler ignores it. There is no `batches[]` state array in the app.)

**How `currentView` is managed:** Entirely in `App.jsx` — see §1. No other component reads or writes `view`.

**State local to each wizard:**

`ManualRequestWizard` (all in this one component, via `useState`):
- `requestType` — lazy-initialized from the `initialRequestType` prop (`useState(initialRequestType)`); `null` only when the component is used standalone without that prop, in which case the old in-page gate still renders.
- `currentStep` (int, indexes into the per-type `steps` array)
- `formData` (`{ title, description, defaultDate, contentTypes[], assignee }`)
- `products` (array, Viz ID/Brand Request only)
- `itemInputs` (array, Innovation only; initialized to `[makeBlankItem()]`)
- `selectedProductIds` (a `Set`, transient — cleared after "Add to request")
- `errors` (object, from `getDetailsValidationErrors`, plus an `items` key set when Innovation item validation fails — see §7)
- `retailerGroups` is **derived**, not stored — `useMemo` over `products`/`itemInputs`/`formData.defaultDate` via `groupProductsByRetailer`.

Because `App.jsx` conditionally renders `{view === "manual" && <ManualRequestWizard .../>}`, the component fully unmounts when the user leaves and fully remounts (with fresh state) the next time — so passing a new `initialRequestType` on each launcher Continue is enough; no `useEffect` sync is needed.

`CreateRequestLauncher` (mounted conditionally the same way, via `isCreateModalOpen`):
- `method` (`null | "manual" | "bulkCsv"`)
- `requestType` (`null | "vizId" | "brandRequest" | "innovation"`, cleared whenever `method` changes away from `"manual"`)

`BulkCsvWizard`:
- `currentStep` (int, indexes into fixed `BULK_STEPS`)
- `rows` (array of `BulkRow`, empty until upload "succeeds")
- `batch` (a `BulkBatch` object, created on upload; not currently read after Confirm)

`ContentRequestQueue`: no local state — pure display over the `requests` prop.

---

## 4. Data models

All shapes live in `src/lib/models.js` as factory functions with defaults (spread `...partial` last, so any field can be overridden).

### Request
```js
{
  id: "REQ-1042",
  requestType: "vizId", // "vizId" | "brandRequest" | "innovation"
  creationMethod: "manual", // "manual" | "bulkCsv"
  title: "",
  description: "",
  status: "needs_action", // "needs_action" | "in_progress" | "completed" | "draft"
  assignee: "",
  dueDate: null,       // ISO date string or null
  launchDate: null,    // ISO date string or null
  contentTypes: [],    // array of content-type value strings
  retailers: [],       // array of retailer codes, e.g. ["WMT","AMZ"]
  products: [],        // Viz ID / Brand Request only — array of product refs
  itemInputs: [],       // Innovation only — array of item objects (see below)
  assets: [],          // always empty in this prototype — no upload wired up
  isPlaceholder: false,// true for bulk-created requests
  sourceBatchId: null, // set for bulk-created requests
  createdAt: "2026-07-15",
}
```

### BulkRow
```js
{
  id: "ROW-1042",
  requestType: "vizId", // per-row — "vizId" | "brandRequest" | "innovation"
  title: "",
  description: "",
  launchDate: null,   // Viz ID / Innovation
  dueDate: null,      // Brand Request
  contentType: null,  // single value, not an array (unlike Request.contentTypes)
  retailer: null,     // single code, not an array (unlike Request.retailers)
  // Innovation-only — blank for Viz ID / Brand Request rows:
  upc: null,
  customerId: null,
  productTitle: null,
  brand: null,
  startShipDate: null,
  onSaleDate: null,
  ecommPackDetails: null,
  status: "ready",       // "ready" | "issue"
  issueReason: null,     // e.g. "Missing retailer code" — set when status is "issue"
  willCreateRequest: true,
}
```

### BulkBatch
```js
{
  id: "BATCH-1042",
  templateName: "bulk-request-template.csv",
  uploadedAt: "2026-07-15",
  rowCount: 0,
  createdRequestCount: 0,
  status: "uploaded", // "uploaded" | "confirmed" | "failed"
  rows: [],
}
```
Note: `BulkBatch` has **no `requestType` field** — a batch is expected to contain mixed types. `distinctRequestTypes(rows)` computes the set of types present, on demand, for display.

### Product row (from `mockProducts.js` / `ProductLookupTable` selection)
```js
{
  id: "P-1001",
  description: "GreenValley Organic Trail Mix, 12oz",
  brand: "GreenValley Snacks",
  upc: "041220012349",
  ean: "8410045678231",
  retailers: ["WMT", "TGT", "KR"],
  launchDate: undefined, // added later by RetailerDatesStep's per-retailer date edit
}
```

### Innovation item row (`InnovationItemInputForm` / `Request.itemInputs`)
```js
{
  id: "item-<timestamp>-<seq>",
  upc: "",
  customerId: "",
  productTitle: "",
  brand: "",
  retailer: "",
  startShipDate: "", // required only if retailer === "AMZ"
  onSaleDate: "",
  ecommPackDetails: "",
}
```

---

## 5. Manual flow logic

All three manual flows run through the **same** `ManualRequestWizard` component. `requestType` is normally chosen up front in the `CreateRequestLauncher` modal (§1) before the wizard even mounts, arriving as the `initialRequestType` prop — the old in-page `RequestTypeSelector` gate screen only appears if that prop is omitted (standalone/fallback use). Either way, `requestType` determines `STEPS_BY_TYPE[requestType]`:

```js
const STEPS_BY_TYPE = {
  vizId:        ["Details", "Products", "Retailers", "Review"],
  brandRequest: ["Details", "Products", "Retailers", "Review"],
  innovation:   ["Details & Item Inputs", "Review"],
};
```

### Manual — Viz ID Change
- **Steps shown:** Details → Products → Retailers → Review.
- **Fields collected (Details):** Task Title*, Description, Default Launch Date* (label: "Default Launch Date"), Content Type* (checkboxes: Enhanced Content / A+ Content / Lifestyle Images / Video), Assignee (optional).
- **Products step:** `ProductLookupTable` — search `mockProducts`, checkbox-select, "Add N to request" button pushes selected products into `products[]`.
- **Retailers step:** `RetailerDatesStep` — shows retailer+date groups derived by `groupProductsByRetailer(products, formData.defaultDate)`; each group's date is independently editable; "Remove" strips that retailer off the matching products.
- **Review:** `ManualReviewStep` → `RequestSummaryCard` (Title, Description, Launch Date, Brand, Content Type, Products count, Retailers, Assignee) + a "Retailer Launch Groups" table (Product Title, EAN per group).
- **On submit ("Create Request"):** builds one `Request` via `createRequest({ requestType: "vizId", creationMethod: "manual", products, retailers: <distinct retailer codes from retailerGroups>, itemInputs: [], status: "needs_action", ... })`, calls `onCreateRequest`.

### Manual — Brand Request
Identical mechanically to Viz ID Change — **same components** (`ProductLookupTable`, `RetailerDatesStep`, `ManualReviewStep`). Only differences: the date field label is "Due/Launch Date" (`DATE_FIELD_LABEL_BY_FLOW.brandRequest`), the Retailers step copy says "Confirm retailer-specific due or launch dates...", and its Content Type options swap "Lifestyle Images" for "Brand Store Update". Product carries `requestType: "brandRequest"` through to the created Request. The name "Brand Request" is used verbatim everywhere (labels, badges) — never renamed to anything else.

### Manual — Innovation
- **Steps shown:** "Details & Item Inputs" → Review (**2 steps, not 4**).
- **Fields collected (combined step):** Task Title*, Description, Content Type* (New Item Setup / Enhanced Content / A+ Content) — **no date field at this level** (`showDate={false}` passed to `ManualDetailsForm`) — plus a repeater of item cards from `InnovationItemInputForm`: UPC*, Customer ID*, Product Title*, Brand*, Retailer* (col. 2), Start Ship Date (required only if Retailer is AMZ, via `isStartShipDateRequired`), On Sale Date*, eComm Pack Details (optional). No "ID Type" field exists.
- **Retailers step: does not exist for Innovation.** `STEPS_BY_TYPE.innovation` has no "Retailers" entry, so it's structurally impossible to reach — not just hidden by a conditional.
- **Review:** `ManualReviewStep` → `RequestSummaryCard` (innovation branch: Title, Description, On Sale Date(s) — derived from `itemInputs`, not a single form field — Start Ship Date (AMZ only), Brand(s), Content Type, Item Inputs count, Retailers — derived directly from `itemInputs`, not from `groupProductsByRetailer`, Assignee) + a flat Item Inputs table (no retailer grouping).
- **On submit:** `createRequest({ requestType: "innovation", creationMethod: "manual", products: [], itemInputs, retailers: <distinct retailer codes from itemInputs>, dueDate: formData.defaultDate || null, ... })`. Note `formData.defaultDate` is always empty string for Innovation (field never shown), so `dueDate`/`launchDate` on an Innovation manual Request end up `null` at the request level — the real dates live per-item in `itemInputs[].onSaleDate` / `.startShipDate`.

---

## 6. Bulk flow logic

`BulkCsvWizard` uses its own stepper (`BULK_STEPS = ["Download Template", "Upload Template", "Review", "Confirm"]`) — a completely separate component tree from `ManualRequestWizard`.

**Confirmed product rule baked into the architecture:** `requestType` is a property of each `BulkRow`, never of the batch/wizard. There is no UI control anywhere in `BulkCsvWizard` that sets one request type for the whole upload.

### Download Template (`CsvTemplateStep.jsx`)
- No request-type selector (removed in the last correction pass — a previous version wrongly gated the whole step behind one `RequestTypeSelector`).
- Shows one combined column list — a `request_type` column plus the union of every type's fields, with an explanatory note on which columns matter for which type:
```
request_type, title, description, retailer, launch_date, due_date, content_type,
upc, customer_id, product_title, brand, start_ship_date, on_sale_date, ecomm_pack_details
```
- "Download Template" builds a real `Blob`/CSV (header row only, no data rows) and triggers a browser download client-side — no server involved.

### Upload CSV (`CsvUploadStep.jsx`)
- **No real parsing exists anywhere.** `UploadDropzone` accepts any file; selecting one calls `onFileSelected` → `simulate("success")`, which after a 600ms `setTimeout` calls `onUploadComplete(mockBulkRows)` — the literal `mockBulkRows` array from `src/data/mockBulkRows.js`, verbatim, regardless of what file was actually picked.
- Two extra "Simulate: empty upload / upload failed" links exist purely to demo those UI states (`onUploadComplete([])` for empty; "failed" just shows an error banner, no rows returned).

### Review imported rows (`BulkReviewStep.jsx`)
- Renders every row of `rows` (whatever `CsvUploadStep` returned) in a table: **Status, Request Type, Title, Retailer, Date, Content Type, Notes/Issues**.
- `Request Type` column reads `row.requestType` directly, per row — this is the only place "type" is determined, and it's literally different per table row when the mock data is mixed.
- `Date` column is type-aware: shows `row.dueDate` for `brandRequest` rows, `row.launchDate` for everything else.
- Summary banner: `"{rows.length} rows uploaded · {readyCount} requests will be created"`, plus (if any issues) `"{ready} ready · {issues} need attention" / "Ready rows will be created. Rows with issues will be skipped."`
- If more than one distinct `requestType` is present, an extra line says: *"This upload mixes request types: Viz ID Change, Brand Request, Innovation."*

### Confirm requests (`ConfirmRequestsStep.jsx`)
- Filters `rows` to `willCreateRequest && status !== "issue"`.
- Shows a per-type badge breakdown (e.g. `3 Viz ID Change` `2 Brand Request` `2 Innovation`) computed by reducing over `readyRows` grouped by `row.requestType`.
- CTA button text is dynamic: `Create {N} Request` / `Create {N} Requests` (singular/plural).
- On click, `BulkCsvWizard.handleConfirm` maps every ready row through `bulkRowToRequest(row, batch?.id)` and calls `onRequestsCreated(newRequests, batchMeta)`.

### How `requestType` per row is represented and preserved end-to-end
1. `createBulkRow({ requestType, ... })` — set at mock-data authoring time (stands in for "what the CSV said").
2. `BulkReviewStep` reads `row.requestType` directly for display — never assumes/derives it from anything batch-level.
3. `bulkRowToRequest(row, batchId)` — `requestType: row.requestType` is the very first field set when building the `Request`. `isInnovation = row.requestType === "innovation"` gates whether an `itemInputs` entry gets built from the row's Innovation-only fields.
4. The resulting `Request.requestType` flows into `App.jsx`'s `requests[]` and is what `ContentRequestQueue` displays via `REQUEST_TYPE_LABELS[req.requestType]`.

So: **Viz ID rows create Viz ID requests, Brand Request rows create Brand Request requests, Innovation rows create Innovation requests — driven entirely by the row, never assumed from the upload as a whole.**

---

## 7. Validation / assumptions

**Real (enforced in code) validation:**
- Manual Details step: `getDetailsValidationErrors(formData, { requireDate })` — Task Title required, default date required unless Innovation, at least one Content Type required. Assignee is **not** required (confirmed optional).
- Manual Products step: "Continue" disabled if zero products/items added.
- Innovation item rows: `isItemRowValid(row)` — UPC/Retailer/Customer ID/Product Title/Brand/On Sale Date always required; Start Ship Date required only if `retailer === "AMZ"` (`isStartShipDateRequired`). **This now blocks navigation.** `ManualRequestWizard.handleNext` checks `itemInputs.some((item) => !isItemRowValid(item))` on the "Details & Item Inputs" step; if any row fails, it sets `errors.items = "Some item inputs are missing required fields. Complete all required fields before continuing."`, renders that text in an `InfoBanner variant="error"` under the item form, and does not advance `currentStep`. (Individual invalid items also still show their own inline "Missing required fields for this item." text in `InnovationItemInputForm`.)
- Bulk Upload step: "Continue" from "Upload Template" disabled until `rows.length > 0`.
- Bulk Confirm: button disabled if `readyRows.length === 0`.

**Mocked / not real:**
- CSV parsing — does not exist. Any uploaded file, regardless of content, returns the fixed `mockBulkRows` array.
- CSV template download — real Blob/file download, but content is header-row-only (no sample data rows).
- "Empty upload" / "upload failed" states — manually triggered via dev-only links, not derived from any real file inspection.
- Row-level `issue` status — hardcoded on one seed row (`Nordic Naturals — Brand Request content update`, `issueReason: "Missing retailer code"`), not computed by any validation function.
- Assets/attachments — `Request.assets` field exists in the shape but nothing in the UI ever writes to it. No file upload is wired to a request.
- `BulkBatch` — created and passed to `onRequestsCreated` as a second argument, but `App.jsx` never stores it. There is no batches list, no way to see "which requests came from which upload" except via `Request.sourceBatchId`, which is set but never surfaced in the Queue UI (`ContentRequestQueue` shows it in a badge's `title` tooltip only — "Bulk placeholder" badge, hover shows the batch id).

**Hardcoded assumptions still baked in:**
- `isStartShipDateRequired` only checks retailer code `"AMZ"` — flagged in code comments as an implementation default, not a confirmed product decision.
- `QueueMetricCards`'s "Due This Period" = current calendar month (`isDueThisPeriod`), a placeholder definition.
- Manual Innovation's `dueDate`/`launchDate` at the Request level are still always `null` (dates live per-item only) — but this no longer shows as a blank cell. `getRequestDisplayDate(request)` (`models.js`) resolves `dueDate → launchDate → earliest itemInputs[].onSaleDate → null`, and `ContentRequestQueue`'s "Due / Launch" column now calls it instead of reading `req.dueDate` directly. Sorting for "earliest" relies on `onSaleDate` being an ISO `YYYY-MM-DD` string, which sorts correctly as plain text.
- ID generation (`nextId`) is a module-scoped incrementing counter starting at 1000 — resets to 1000 every full page reload (not persisted).

---

## 8. Known limitations

- No persistence — refreshing the browser resets `requests[]` back to the 6 seed rows in `mockRequests.js`. Nothing is saved to localStorage, a backend, or anywhere durable. This also resets `view` and closes any open modal.
- No request detail view — clicking a row in `ContentRequestQueue` does nothing; there's no drill-in page to edit a request after creation (relevant to Open Question "Can bulk-created placeholder requests be edited later in request detail?" — answer today is no, there's no detail view at all).
- No assignee/asset editing after creation for any request, manual or bulk.
- No way to filter/sort/search the Queue table.
- No confirmation dialog before Bulk "Create N Requests" (Manual wizard's "Discard" does have a `window.confirm`, Bulk's does not — inconsistent).
- `BulkBatch` metadata is effectively discarded after Confirm (see §7) — a real implementation would want to persist batches for audit/undo.
- Single hardcoded mock CSV result regardless of what's uploaded — cannot demo "upload a file with 3 rows" vs "upload a file with 50 rows"; it's always the same 7 rows.
- No routing — cannot deep-link to a specific view (e.g. no shareable URL for "New Request → Bulk"), no browser back-button support beyond the in-app breadcrumb/back-arrow.
- Retailer/product catalogs are tiny fixed arrays (10 products, 7 retailers) — no pagination, no "can't find your product" flow.
- `RequestSummaryCard`/`ManualReviewStep` for Viz ID/Brand Request use `groupProductsByRetailer`, which assigns `["UNASSIGNED"]` as a retailer bucket if a product has no retailers — this edge case exists in code but isn't visibly labeled anywhere in the UI (would show as retailer code "UNASSIGNED" literally).
- Content-type checkboxes, assignee list, and retailer list are all static arrays in `formOptions.js` / `mockRetailers.js` — no way to add a new option from the UI.

---

## 9. Build / run

```bash
npm install
npm run dev      # Vite dev server
npm run build    # production build to dist/
npm run preview  # preview a production build locally
```

**Last verified build result:** clean, **717 modules transformed**, no errors, no warnings from Vite/Rollup itself. (Module count is unchanged from before the launcher-modal rework: `CreateRequestLauncher.jsx` was added the same time `NewRequestEntry.jsx` was deleted.)

```
vite v5.4.21 building for production...
✓ 717 modules transformed.
dist/index.html                   0.72 kB
dist/assets/index-*.css         322.05 kB │ gzip: 46.75 kB
dist/assets/index-*.js          197.73 kB │ gzip: 59.83 kB
✓ built
```

Stack: React 18, Vite 5, Tailwind CSS 4 (`@tailwindcss/vite` plugin) + DaisyUI 5 (`corporate` custom theme in `src/theme/corporate.css`, tokens sourced from a Figma export — colors, radius, Inter font), `@heroicons/react` v2 for all icons. No test runner, no linter config, no CI configured in this repo.

---

## 10. Product rules implemented

Enforced in code (not just UI copy):

1. **Manual = one request.** `ManualRequestWizard` calls `onCreateRequest` exactly once, with a single `Request` object, regardless of request type.
2. **Bulk = many requests.** `BulkCsvWizard.handleConfirm` maps an array of ready rows to an array of `Request` objects via `bulkRowToRequest`, calling `onRequestsCreated` once with the full array.
3. **Bulk supports mixed request types per row.** `BulkRow.requestType` is set per row; `bulkRowToRequest` reads `row.requestType` (never a batch-level value); `BulkBatch` has no `requestType` field; the CSV template is one combined file with a `request_type` column, not per-type templates; seed mock data (`mockBulkRows.js`) deliberately includes vizId + brandRequest + innovation rows in the same array to prove this works end-to-end.
4. **Manual Innovation skips Retailers.** `STEPS_BY_TYPE.innovation` has no "Retailers" entry — structurally absent, not conditionally hidden. Retailer is captured per item in `InnovationItemInputForm` instead.
5. **Brand Request keeps its name.** `REQUEST_TYPE_LABELS.brandRequest = "Brand Request"` — used verbatim in the type selector, Queue table, review summaries, and Bulk review/confirm breakdowns. Never relabeled to "Content Update" or similar (an earlier prototype iteration had used a different name; corrected).
6. **"Create Request" vs "Create Requests" CTA logic:** Manual wizard's Review step button is always singular, "Create Request" (hardcoded string — Manual can only ever create one). Bulk's Confirm button is `Create {N} Request${N === 1 ? "" : "s"}` — pluralized based on the live count of ready rows.
7. **Start Ship Date required only for Amazon (AMZ).** `isStartShipDateRequired(retailerCode)` in `businessRules.js` — single source of truth, consumed by `InnovationItemInputForm` (field-level `required`/hint) and `RequestSummaryCard` (which AMZ ship dates to surface in the summary). Flagged in comments as an implementation default pending product confirmation.
8. **Assignee is optional everywhere.** Removed from required-field validation in `getDetailsValidationErrors` for all three manual flows (Innovation, Viz ID, Brand Request alike).
9. **Bulk-created requests are placeholders.** `bulkRowToRequest` always sets `isPlaceholder: true` and `status: "needs_action"` — the product intent (per spec comments) is that assignee/assets get filled in later, closer to the work date; nothing in the UI currently supports that later-editing step (see §8).
10. **Manual requires Request Type up front; Bulk does not.** `CreateRequestLauncher`'s Continue button is disabled until a creation method is chosen, and — only for Build manually — until a Request Type is also chosen (`canContinue = isManual ? Boolean(requestType) : isBulk`). Selecting Bulk CSV import enables Continue immediately, with copy explaining that type is set per row via the CSV's `Request_Type` column instead.
11. **Innovation item-input validation blocks progression.** Previously, invalid Innovation item rows (missing UPC/Retailer/Customer ID/Product Title/Brand/On Sale Date, or missing Start Ship Date for AMZ) showed inline errors but didn't stop the user from reaching Review. `ManualRequestWizard.handleNext` now checks `isItemRowValid` on every item and blocks Continue with an explicit banner if any row fails.
12. **Queue always shows a usable date for Innovation requests.** `getRequestDisplayDate` (`models.js`) falls back from `dueDate` → `launchDate` → earliest item `onSaleDate`, so manually-created Innovation requests (which never populate request-level dates) no longer show a blank "Due / Launch" cell in `ContentRequestQueue`.
13. **Bulk's partial-success behavior is flagged, not silently assumed.** `BulkReviewStep` now shows an explicit note: "Assumption: ready rows will be created and rows with issues will be skipped. Validate partial import behavior with Gowri." The underlying behavior (skip issue rows, create the rest) is unchanged — this only makes the assumption visible for product review.

---

*Generated from the live source tree on `master`, updated after the Create Request launcher-modal rework and the validation/display-date cleanup pass. If ChatGPT is reviewing a different commit, diff against this file's assumptions before trusting specifics like line-level behavior.*
