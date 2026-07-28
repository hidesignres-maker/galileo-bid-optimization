# Galileo Add Details Pattern v1

Documents the approved Add Details Pattern v1, as implemented on
`experiment/content-request-details-pattern`. This covers the manual
create flow's first step (Add Details for Brand Request / VizID Change,
and Details & Item Inputs for Innovation), including Supporting Materials,
Notes, and mock file previews.

This document describes implemented and approved behavior only.

## 1. Purpose

Align the Brand/VizID Add Details step with the approved Figma composition
— a centered work surface with a specific field layout, stepper treatment,
and Supporting Materials structure — while preserving every existing
behavior underneath it: state ownership, validation, navigation, request
creation, Innovation's own flow, the Queue, and Bulk CSV.

This is a visual/structural alignment pass plus two scoped functional
additions (a request-level Notes field, and lightweight mock file
previews) — not a rebuild of the manual wizard's underlying logic.

## 2. Source-of-truth model

- **Figma** is the visual source of truth for the Brand/VizID Add Details
  composition: work-surface width, padding, field-row proportions, stepper
  treatment, and Supporting Materials layout/copy.
- **The React repository** is the functional source of truth for
  everything else: what state exists, what's required, what happens on
  Continue/Back/Discard, and what a created Request looks like.
- Where the two could conflict (e.g. Innovation has no equivalent Figma
  spec for this pass), the existing, working implementation wins and is
  left structurally explicit rather than forced into the Brand/VizID shape.

## 3. Shared create-flow shell

`ManualRequestWizard` remains the sole owner of all wizard state and
behavior across every request type:

- `formData`, `products`, `itemInputs`, `errors`
- `requestType`, `currentStep`
- validation (click-time, via `getDetailsValidationErrors` /
  `isItemRowValid` in `businessRules.js`)
- navigation (`handleNext` / `handleBack`)
- request creation (`handleCreateRequest` → `createRequest` in
  `models.js`)

`ManualDetailsForm`, `ContentRequirementsSection`, `WizardStepper`, and
`Card`/`Input` are presentational children driven entirely by props from
the wizard. None of them own request state.

Brand and VizID Change share one Add Details composition (same component
tree, same field layout). Innovation is kept structurally explicit — a
separate rendering branch in `ManualRequestWizard`, not a conditional
inside the Brand/VizID composition.

## 4. Brand/VizID Add Details composition

Rendered only when `stepName === "Add Details"` (which, per
`STEPS_BY_TYPE`, only ever occurs for `vizId` / `brandRequest` —
Innovation's first step is named `"Details & Item Inputs"` and never
matches this branch):

```jsx
<div className="w-[778px] mx-auto">
  <Card title="Request details" headerClassName="px-6 pt-6" bodyClassName="p-6">
    <ManualDetailsForm ... />
  </Card>
</div>
```

- Work surface: **778px**, centered (`mx-auto`).
- Card padding: **24px** on all sides (`px-6 pt-6` header, `p-6` body).
- Inner content width: **730px** — a direct consequence of 778px minus
  24px padding on each side (778 − 24 − 24 = 730), not a separately
  hardcoded value.
- Height is content-driven — no fixed height anywhere in this
  composition.
- Card title is the literal string **"Request details"**, not the raw
  step name ("Add Details") — the page-level, request-type-specific title
  ("New Request : VizID change" / "Brand request") already lives in
  `App.jsx`, so this internal heading intentionally doesn't repeat it.

## 5. Innovation differences and explicit exclusions

Innovation is **not** part of the Brand/VizID Add Details composition. It
renders through its own branch (`stepName === "Details & Item Inputs"`),
using the original `Card title={stepName}` treatment (no 778px wrapper, no
"Request details" title override):

- No request-level date field (`showDate={!isInnovation}` → `false` for
  Innovation; dates live per item in `itemInputs[].onSaleDate` /
  `startShipDate`).
- Item inputs (`InnovationItemInputForm`) render in their existing
  location, directly inside Innovation's own Card.
- Supporting Materials (`ContentRequirementsSection`) renders after Item
  Inputs, not inline inside `ManualDetailsForm` — same position as before
  this pass.
- No 207.5/207.5/267px field-row geometry — Innovation's field row keeps
  its original proportional 3-up grid (and only ever shows 2 of those 3
  cells, since it has no date field).
- No dedicated 778px-aligned footer — Innovation keeps the original shared
  wizard footer (Discard / Back / "Continue to {next step}").

The one thing Innovation *does* share with Brand/VizID in this pass is the
`WizardStepper`'s `manualCreate` visual variant (see Section 6) — that's
shell-level chrome above the step content, not part of the Add Details
card composition itself.

## 6. Wizard stepper variant

`WizardStepper` gained an opt-in `variant` prop (`"default"` |
`"manualCreate"`), used only by `ManualRequestWizard`:

- **32px step indicators** (`w-8 h-8`, down from the default 40px).
- **8px pill connector bars** (`h-2 rounded-full`, up from a 1px hairline).
- Labels at **16/28** (`text-base leading-7`, up from `text-sm`).
- The whole stepper capped at **780px** and centered (`max-w-[780px]
  mx-auto`) — lining up with the 778px Add Details work surface, roughly a
  200px inset on each side within the 1180px page canvas.
- Active/inactive coloring is unchanged by the variant: active step is
  `bg-primary`, inactive is `bg-base-300`.

`"default"` (no `variant` prop passed) renders byte-identical classes, in
the same order, as before this prop existed. Bulk CSV's `WizardStepper`
call never passes `variant`, so its stepper is untouched.

## 7. Request Details form anatomy

Inside the 778px Card, `ManualDetailsForm` renders:

- **Full width:** Request title (required), Task description (optional,
  textarea).
- **One row**, only for non-Innovation requests (derived from the
  existing `requestType` prop — no new flag):
  - Date field — **207.5px** (label per flow: "Default Launch Date" for
    VizID, the existing approved label for Brand Request).
  - Assignee — **207.5px** (optional Select).
  - Content type — **267px** (checkboxes: Images, Copy, Video; at least
    one required).
  - **24px gaps** between the three (`gap-6`), via an explicit grid
    template: `grid-cols-[207.5px_207.5px_267px]` at the `md:` breakpoint
    and wider. Below that breakpoint, fields stack to a single column
    (`grid-cols-1`) without changing the desktop geometry.
  - 207.5 + 207.5 + 267 + 24 + 24 = 730 — exactly the Card's inner width.
- Innovation keeps its original 3-column proportional grid
  (`sm:grid-cols-3 gap-4`) for this row, showing only Assignee and Content
  type (no date field).

## 8. Supporting Materials structure

`ContentRequirementsSection` (shared by both flows — inline inside
`ManualDetailsForm` for Brand/VizID, rendered separately after Item Inputs
for Innovation) is ordered:

1. Section introduction (heading + helper copy).
2. Informational alert (`InfoBanner`).
3. Reference link (`Input`, with a leading `LinkIcon`).
4. Notes for supporting materials (see Section 9).
5. Upload files (dropzone + file list, see Section 10).

- Heading is uniform across both flows: **"Supporting materials
  (optional)"** (previously "Content requirements" for Brand/VizID vs.
  "Supporting materials" for Innovation).
- Helper copy makes explicit that the whole section is skippable ("...if
  helpful. You can continue without adding any.").
- Reference link preserves its existing state, placeholder style
  (SharePoint / brand asset / PDP-style), and hint copy — only the leading
  icon is new.
- Upload dropzone: white surface (`bg-base-100`), 1px dashed border, 8px
  radius (`rounded-[8px]`), 182px target height (`h-[182px]`), with
  "Browse files", "Maximum 10 files", and "Up to 500MB each" copy.

## 9. Notes model and behavior

"Notes for supporting materials" is a **request-level, optional** field —
not per-item, not shared with Bulk CSV:

- Data shape: `contentRequirements.notes` (default `""`), alongside the
  pre-existing `files` and `referenceLink`. Set in `models.js`'s
  `createRequest()` default and in `ManualRequestWizard`'s
  `initialFormData`.
- Distinct from Bulk CSV's per-row `contentNotes` — Manual never
  populates `contentNotes`, and `bulkRowToRequest` never populates
  `notes`. Both fields coexist on the same `contentRequirements` object
  shape without being reused for each other.
- Rendered as a plain multiline `textarea` (no character limit, no new
  validation rule), controlled via the same immutable-update pattern as
  every other Supporting Materials field
  (`updateContentRequirements({ notes: ... })`).
- Included in the created Request's `contentRequirements.notes` at
  `handleCreateRequest` time.
- Reviewed via `ReviewNotesPanel` (in `SupportingMaterialsReview.jsx`),
  which reads `contentRequirements.notes`, defaults to `""` when absent
  (so requests created before this field existed still render safely),
  and shows a neutral "No notes added for this request." empty state —
  never invented default text.

## 10. Mock file preview behavior

Uploaded/simulated files can show a lightweight thumbnail, entirely
in-memory:

- File entry shape: `{ id, name, previewUrl?, mimeType?, sizeLabel? }` —
  `previewUrl`, `mimeType`, and `sizeLabel` are all optional and additive.
  **Old `{ id, name }`-only file entries continue to render safely** —
  they simply get no thumbnail and no metadata line.
- "Browse files" opens a real, hidden `<input type="file" multiple>` —
  the browser hands back genuine `File` objects (name, type, size).
- For image files (`file.type` starting with `image/`), a temporary local
  preview is created via `URL.createObjectURL(file)` and stored as
  `previewUrl`. For non-image files, no `previewUrl` is created.
- **No backend upload and no persistence anywhere** — nothing is sent over
  the network; everything lives only in the wizard's in-memory
  `formData.contentRequirements.files` for the duration of the session.
- Object URLs are revoked in two places: immediately when a file is
  removed (`removeFile` in `ContentRequirementsSection`), and once, on the
  wizard's own unmount (`ManualRequestWizard`, the actual long-lived owner
  of this state) — deliberately *not* on step navigation, so a preview
  already shown isn't broken if the user goes to another step and back.
- No local mock product-image assets exist in the repository, so files
  without a `previewUrl` (non-images, or legacy `{ id, name }`-only
  entries) render a neutral placeholder icon instead — `PhotoIcon` when
  `mimeType` looks like an image, `DocumentIcon` otherwise. This logic
  lives in one shared primitive, `FileThumb` (`components/ui/FileThumb.jsx`),
  used identically by both Add Details' file list and
  `SupportingMaterialsReview`'s file list.
- The "Maximum 10 files" copy is functionally enforced (`MAX_FILES = 10`
  in `ContentRequirementsSection.jsx`) — additional picks beyond the cap
  are silently ignored.

**Bulk CSV's own upload path (`ImportCsvStep.jsx`, `UploadDropzone.jsx`,
`bulkRowToRequest`'s `contentNotes`/`referenceLinks`/`assetLinks`) is
entirely separate and untouched by any of this** — it has its own
CSV-only, per-row supporting-content model, with no file previews and no
shared code with the Manual flow's `ContentRequirementsSection` or
`FileThumb`.

## 11. Footer behavior

The Brand/VizID Add Details step gets its own footer, anchored to the
same 778px boundary:

```jsx
<div className="w-[778px] mx-auto flex items-center justify-between h-10">
  <Button variant="text" className="text-error" onClick={onCancel}>Discard</Button>
  <Button icon={ArrowRightIcon} onClick={handleNext}>Continue to products</Button>
</div>
```

- 40px action row (`h-10`).
- Discard left, "Continue to products" (exact copy) right.
- No full-width top border (dropped only for this composition).
- Same `handleNext` / `onCancel` handlers as every other step — same
  click-time validation, no new disabled-state logic. Back never appears
  here since Add Details is always step 0.

Every other step (Select Products, Innovation's Details & Item Inputs,
and Review & Create) keeps its pre-existing footer exactly as before —
this new footer only replaces the shared one for this one step.

## 12. Approved geometry and tokens

| Element | Value |
|---|---|
| Add Details work surface width | 778px |
| Card inner content width | 730px |
| Card padding (header + body) | 24px |
| Field row: date / assignee | 207.5px each |
| Field row: content type | 267px |
| Field row gaps | 24px |
| Footer action row height | 40px |
| Manual-create stepper indicator | 32px |
| Manual-create stepper connector | 8px (pill) |
| Manual-create stepper label | 16/28 |
| Manual-create stepper width / inset | ~780px, ~200px inset at 1180px canvas |
| Upload dropzone height | 182px |
| Upload dropzone radius | 8px |
| Upload dropzone border | 1px dashed |

No global theme tokens (`base-200`, `error`, radius variables, color
tokens in `theme/corporate.css`) were changed in this pass — every value
above is a local, scoped class on the specific elements listed.

## 13. Reusable primitives and backward-compatible extensions

All primitive changes in this pass are additive, optional, and
byte-identical for every caller that doesn't opt in:

- **`WizardStepper`** — new `variant` prop, defaults to `"default"`
  (unchanged output).
- **`Card`** — new `headerClassName` prop, defaults to `""` (falls back to
  the original `"px-4 pt-4"` via a real conditional, not an appended
  class — avoiding the same-CSS-property cascade-order risk).
- **`Input`** — new `icon` prop (optional leading Heroicon for non-date
  inputs), plus a `z-10` fix on the leading-icon classes (see Section 14
  note). Both are additive; no existing caller's markup changes shape.
- **`FileThumb`** (new) — shared thumbnail/placeholder primitive, used by
  both Add Details and Review's Supporting Materials file lists.

## 14. Validation and functionality preserved

- Click-time validation is unchanged: title required, date required for
  Brand/VizID (not Innovation), at least one content type required,
  description and assignee optional — all via the existing
  `getDetailsValidationErrors` / `isItemRowValid` functions in
  `businessRules.js`, untouched by this pass.
- Continue is never disabled preemptively on Add Details to match a
  static design state — validation still runs on click, exactly as
  before.
- Request creation (`handleCreateRequest` → `createRequest`), retailer
  grouping (`groupProductsByRetailer`), product selection
  (`ProductLookupTable`), the Queue, and Bulk CSV's upload/review/confirm
  flow are all unmodified by this pass.
- A separately-fixed defect is included in this branch's history: the
  leading icon in `Input` (date icon, and the new Reference-link icon)
  was being visually hidden behind the `<input>` element itself, because
  DaisyUI v5's `.input` class sets `position: relative` with an opaque
  background — a later-painted, same-stacking-level sibling. Fixed with
  an explicit `z-10` on the icon. This was a latent, pre-existing bug
  (not introduced by this pattern), caught and fixed during this work.

## 15. Known gaps

- No real backend/upload/persistence exists anywhere in this prototype —
  file previews are session-only, in-memory blob URLs.
- No local mock product-image assets exist in the repository; non-image
  and legacy `{ id, name }`-only files always fall back to the neutral
  placeholder icon rather than a bundled sample image.
- There is no request detail view in this prototype, so "reopening a
  created request to see its notes/files" is not yet possible — this gap
  predates this pass and applies equally to Reference link.
- Innovation has no verified Figma spec for its own Add Details-equivalent
  composition in this pass — its layout is preserved as-is, not
  redesigned.
- This document was written and verified through code inspection,
  isolated production builds, and Node-level component-rendering checks
  (`react-dom/server`) — not through an actual rendered browser session,
  since this environment has no browser available.

## 16. Reuse checklist v1

Before reusing any part of this pattern elsewhere, confirm:

- [ ] Is the new context genuinely Brand/VizID-shaped, or does it need its
      own explicit composition (like Innovation got here)? Prefer a
      separate, explicit branch over adding another generic prop.
- [ ] Does the target component already support the geometry needed
      (`Card`'s `headerClassName`/`bodyClassName`, `Input`'s `icon`,
      `WizardStepper`'s `variant`) via existing optional props, before
      adding a new one?
- [ ] If adding a new optional prop to a shared primitive, does the
      default value produce byte-identical output for every existing
      caller?
- [ ] Does any new file-preview usage stay in-memory only (no network
      call, no persistence) and revoke its object URLs on removal and on
      the actual state-owning component's unmount (not on incidental
      child remounts)?
- [ ] Does any new "optional, request-level" field stay distinct from
      Bulk CSV's equivalent per-row field, rather than being reused
      across both creation paths?
- [ ] Does click-time (not continuously-disabled) validation remain the
      pattern for any new required field?
