# Visual Hierarchy Audit — Content Request Intake Prototype

Read-only design review. No code was changed. Scope: identify where the Galileo presentation layer needs to add visual hierarchy on top of the existing React + Vite + Tailwind/DaisyUI structure, without touching logic, state, navigation, validation, or the data model.

---

## Root cause, before the screen-by-screen breakdown

Almost every flatness issue below traces back to three structural habits repeated throughout the codebase:

1. **One Card style for everything.** `Card` (`bg-base-100 border border-base-300 shadow-sm`) is the only grouping/elevation mechanism in the app. It wraps metric tiles, form sections, a single repeatable item row, a review summary, and a data table identically. Because nothing is ever visually "louder" or "quieter" than a Card, no card reads as more important than its neighbor — even when one is the primary object of the screen (the Requests table, the Review summary) and another is incidental (a metric tile, an optional section).
2. **A compressed type scale.** The app runs almost entirely on `text-sm` and `text-xs`, with `text-base` reserved for Card titles and `text-2xl` for the page H1. There is nothing between "page title" and "card title," and "section header inside a card" and "field label" frequently render at the exact same weight (`text-sm font-semibold`). The eye has only two real stops: H1, and everything else.
3. **InfoBanner is overloaded.** The same blue/green/amber alert box is used for user guidance ("Add supporting files..."), system status ("Upload complete"), blocking validation errors, and internal product/dev notes ("Assumption: ... Validate with Gowri"). A user has no way to learn which banners matter and which don't, so they end up skimming all of them equally — or none.

Everything in the sections below is a symptom of one of these three habits.

---

## 1. Screen-by-screen audit

### Content Request Queue
The landing screen has three zones — metric tiles, the Requests table's header/action, the table body — and all three carry identical Card weight. The four `QueueMetricCards` tiles are the natural "state of the world at a glance" anchor for this screen, but they don't outrank the table beneath them, so the eye has no obvious entry point. Inside the table, `Title` (the row's real identity) and low-priority columns like `Assignee` or `Retailers` render in the same gray weight — only the `Status` badge carries any real signal. The single most important action on the page, **New Request**, is a `btn-sm` tucked into a Card header next to the word "Requests," competing with the breadcrumb and H1 above it rather than standing out as the page's primary CTA.

### Create Request modal
Reasonably contained because it's small and scoped, but "choose a method" and "choose a request type" read as two co-equal decisions stacked vertically, when the second is entirely dependent on (and secondary to) the first. The only hierarchy cue is a line of small italic gray text ("Select a creation method to continue"). Footer buttons (Cancel = text, Continue = primary) are correctly weighted — this is the one place in the app where button hierarchy is unambiguous.

### Manual — Request Type gate
A single Card with an inline radio row. This is arguably the highest-leverage decision in the entire Manual flow (it determines the whole downstream step list), and it currently has less visual presence than a single optional field further into the wizard.

### WizardStepper (shared: Manual + Bulk)
Functionally correct (done/current/future states, checkmarks, connecting line) but visually modest — "current step" is only a font-weight bump, with no accent bar or size jump. Given it's the primary orientation device for every multi-step flow in the app, it currently has less visual authority than the InfoBanners that often sit directly beneath it.

### Manual — Details step (VizID Change / Brand Request)
All fields — Request title, Task description, Date, Assignee, Content type — sit in one visually flat block. Request title (functionally the request's name) has identical weight to Assignee (optional, defaults to "Unassigned"). The Content Requirements section appended below is separated only by a thin top border, and because it contains an InfoBanner, it visually reads as *more* prominent than the required fields above it — the inverse of its actual priority ("optional, can be done later").

### Manual — Products step
Search input and the "Add N to request" button sit side by side at equal visual weight; the primary action is a small inline `btn-sm btn-primary` easily lost next to the search field. The only feedback that a selection is in progress is text inside the button label itself ("Add 3 to request") — there's no separate, more visible selection-count indicator.

### Manual — Retailers step
Clean and simple, but reuses the same generic InfoBanner as every other instructional or status message in the app, so it doesn't read as "this step's specific guidance" so much as "another blue box."

### Manual — Innovation (Details & Item Inputs)
The densest, flattest screen in the prototype. Request details, the Item Inputs list (collapsible, numbered cards), and Supporting materials all render as visually equal blocks divided only by thin top borders and near-identical `text-sm font-bold`/`font-semibold` headers. Item Inputs — the product's own stated *primary object* for Innovation — has no stronger visual anchor than the optional Supporting materials section beneath it. Inside a collapsed item, the one-line summary and the "missing required fields" error state are both small text with limited contrast against surrounding copy, so a scan of 4-5 collapsed items doesn't quickly separate "ready" from "needs attention."

### Manual — Review & Create
The pre-commit checkpoint, and currently the flattest data display in the app: a plain label/value list where Title and Assignee render with identical typographic weight. The retailer/product or item-input detail table below the summary is a second Card of equal visual weight to the summary Card above it, so nothing signals "this is the primary summary, that is supporting detail." The one strong hierarchy signal on the whole screen is the green `Create Request` button — which, by contrast, highlights just how flat everything above it is.

### Bulk — Import CSV step
Before upload: sparse, and the "Required columns" chip panel (a dozen+ small badges) is visually the loudest element on the page even though it's reference material, not the actual call to action. After upload: the screen becomes dense fast — chip panel, blue InfoBanner, green success banner, search bar + "Upload another file" button, then the row table, then a caption — five-plus blocks at similar weight, with nothing signaling that the table is now the main content and the chip panel above it is now just reference material already acted on.

### Bulk — Review step
`OpenQuestionsPanel` — an internal, amber-toned "open questions for the product team" accordion — renders **above the WizardStepper** on every single Bulk screen, meaning an internal artifact currently outranks the user's own step navigation and content on first paint. The Review table itself (7 columns) relies on Status badges and a faint red row tint as its only differentiation; given the screen's whole job is "spot rows that need attention before confirming," that signal is fairly quiet. Three separate banners/captions stack above the table (ready/issue counts, mixed-types note, and an internal "Assumption: validate with Gowri" dev note) at equal visual weight, so the actionable summary competes directly with an internal caveat that isn't meant for the end user at all.

### Bulk — Confirm step
The simplest Bulk screen, but its key numbers (rows uploaded, ready, excluded) are embedded in a sentence inside an InfoBanner rather than called out the way QueueMetricCards calls out numbers on the Queue screen — even though this is conceptually the same "at a glance stats" moment.

---

## 2. Components with equal weight that should differ

| Currently equal weight | Should read as |
|---|---|
| QueueMetricCards tiles vs. the Requests table Card | Metrics = primary at-a-glance anchor; table = primary content below it — both currently just "a Card" |
| Request title / Task description vs. Assignee / Content type | Title = primary identity field; Assignee = lowest-priority, optional |
| Item Inputs section vs. Supporting materials section (Innovation) | Item Inputs = primary object; Supporting materials = secondary, explicitly "can be done later" |
| RequestSummaryCard's Title/Description rows vs. its Assignee/Content Type rows | Title & core identity = primary; everything else = supporting metadata |
| "Download CSV template" / "Browse files" / "Upload another file" / "Add item" — all `btn-outline` | Only one of these is the primary action in a given moment; the rest are secondary |
| Validation error banners vs. "Assumption: validate with Gowri" dev-note banners | User-blocking errors = high severity; internal product notes = lowest priority, shouldn't use alert styling at all |
| OpenQuestionsPanel vs. WizardStepper | Stepper = primary navigation, should always outrank; OpenQuestionsPanel = supplementary, currently outranks it by render order |
| Table "Title"/"Request title" column vs. every other column | Should be the one column with real typographic weight; currently identical to Retailer/Date/Content Type |

---

## 3. Spacing, typography, density, grouping

- **Typography scale is too shallow.** Only `text-2xl` (H1), `text-base` (Card title), and `text-sm`/`text-xs` (everything else) are in use. There's no intermediate step for "important label inside a dense screen" (e.g., Item Inputs' header, RequestSummaryCard's Title row) versus "minor field label" (Assignee, eComm Pack Details).
- **Grouping relies entirely on borders, never on background or spacing rhythm.** Every section boundary is a `border-t border-base-300`. A subtle background shift (e.g., a slightly tinted `bg-base-200` panel for optional/supplementary content) would let the eye separate "core" from "supporting" without adding a single new component.
- **Density is uniform regardless of importance.** The Review & Create summary (should be scannable, high-signal) and the dense multi-column Bulk Review table (should be scannable, high-signal) both use the same row padding as low-stakes metadata elsewhere. Nothing is "zoomed in" for the moments that matter most (final review, spotting issues before Confirm).
- **Numbers that matter are buried in prose.** QueueMetricCards is the one place numbers get their own visual treatment (large, colored, tile-based). Bulk Confirm's "rows uploaded / ready / excluded" and Bulk Review's ready/issue counts are conceptually the same kind of at-a-glance stat, but currently live inside sentence-form InfoBanner text.
- **Status signal is thin where it matters most.** Bulk Review's issue-row tint (`bg-error/5`) is very subtle; on a table with 7+ columns of gray text, it's easy to miss the rows that actually need attention — the exact opposite of what that screen exists to surface.

---

## 4. Components that can gain a variant instead of being replaced

- **`Card`** — add an optional `emphasis` (e.g. `"primary" | "default" | "subtle"`) defaulting to current behavior. `primary` for the Queue's Requests card and the Review summary card; `subtle` for optional/deferred sections (Content Requirements/Supporting materials, the OpenQuestionsPanel). No change to Card's existing title/subtitle/actions contract.
- **`InfoBanner`** — add a `role` or lower-emphasis `note` variant, visually quieter than the current alert-box treatment, for internal/product-facing copy ("Assumption: validate with Gowri") so it stops competing with real user-facing status and validation messages. Existing `info`/`warning`/`success`/`error` variants stay as-is for genuine user-facing signal.
- **`Button`** — the variant system already exists (`primary`/`outline`/`ghost`/`text`/`success`); the gap is usage discipline, not a new variant — e.g. reserving `outline` for one clear secondary action per screen rather than 2-3 competing outline buttons in the same view (Import CSV step, Content Requirements section).
- **`Table`** — allow an optional "emphasized column" treatment (heavier weight/color on one designated column, e.g. Title) so the Queue, Product Lookup, and Bulk Review tables can each give their identity column real visual priority without restructuring the table markup.
- **`SummaryRow`** (currently local to `RequestSummaryCard`) — split into a "primary" row style (Title, Description) and the existing muted style for secondary metadata, still built from the same label/value shape.
- **`WizardStepper`** — a slightly stronger "current step" treatment (e.g. an accent bar or larger label) layered on the existing done/current/future logic, no change to its `steps`/`currentStep` contract.

---

## 5. Page-composition changes (visual only, zero behavior change)

- **Queue:** visually separate the metric tiles as a distinct "at a glance" zone (e.g. `Card emphasis="subtle"` or no card chrome at all, just a light background band) from the Requests table, which becomes the `emphasis="primary"` container. Promote "New Request" out of the Card header into a page-level primary action next to the H1.
- **Manual Details (VizID/Brand + Innovation):** wrap Content Requirements / Supporting materials in `Card emphasis="subtle"` (or a tinted panel) so it visually recedes relative to the required fields above/around it, reinforcing "optional, can be done later" — which the copy already says but the visuals currently contradict.
- **Innovation step:** give the Item Inputs section its own stronger section treatment (heavier header weight, maybe a light background) so it visually leads Supporting materials, matching the product's own "item inputs are the primary object" framing.
- **Review & Create:** promote RequestSummaryCard to `emphasis="primary"`, demote the retailer-groups/item-inputs detail table to a supporting/secondary treatment beneath it, so the hierarchy reads "here's the summary (primary), here's the backing detail (supporting)."
- **Bulk flow (all three steps):** move `OpenQuestionsPanel` below the step content (or into a lower-emphasis, collapsed-by-default treatment) so it stops outranking the WizardStepper and the actual task on every screen.
- **Bulk Confirm:** pull "rows uploaded / ready / excluded" out of banner prose into 2-3 small stat tiles (reusing the QueueMetricCards visual language), with the existing explanatory paragraph and type-breakdown badges underneath.
- **Bulk Review:** strengthen the issue-row signal (e.g. a slightly stronger left border or tint on rows needing attention) so the table's core job — "spot what needs fixing before Confirm" — is legible at a glance, not just on close reading.

---

## Prioritized, low-risk visual improvements

1. **Split InfoBanner's "user-facing" vs "internal/dev-note" treatment.** Immediately fixes the Bulk Review "Assumption: validate with Gowri" note competing with real status messages, and is a single new variant, zero markup changes elsewhere required beyond swapping which variant a few banners use.
2. **Reposition/demote OpenQuestionsPanel below the WizardStepper (or default-collapsed, lower emphasis) on all three Bulk screens.** One-line change in composition order/styling; removes the single biggest "wrong thing is winning visual priority" issue in the app.
3. **Add a `Card emphasis` variant and apply it to: Queue's Requests card (primary), Review & Create's RequestSummaryCard (primary), Content Requirements/Supporting materials sections (subtle).** Directly fixes the most repeated flatness complaint (every Card looks the same) with one small, additive prop.
4. **Give Bulk Review's issue rows a stronger visual signal** (border-left accent or stronger tint) — small CSS-only change, directly improves the screen's actual job (spotting rows needing attention).
5. **Convert Bulk Confirm's prose stats into small stat tiles**, reusing QueueMetricCards' existing visual pattern — consistent language across the app, no new primitive needed, just reuse.
6. **Emphasize the "Title"/"Request title" column** in the Queue and Bulk Review tables (and Product Description in Product Lookup) with a small weight/color bump — cheap, high-impact scanability win.
7. **Promote "New Request" to a page-level primary action** on the Queue (out of the Card header) — small composition change, meaningfully improves "where do I start" clarity.
8. **Differentiate Request title / Task description from Assignee / Content type in ManualDetailsForm and RequestSummaryCard** via weight, not new fields — reinforces which inputs are the request's actual identity.
9. **Strengthen WizardStepper's "current step" treatment** (accent bar or size bump) so the primary navigation device outranks the InfoBanners beneath it on first glance.
10. **Introduce a StatTile primitive** (extracted from QueueMetricCards) as the one reusable "numbers that matter" pattern, so future screens don't reinvent it.

---

## Proposed minimal set of Galileo presentation primitives

Deliberately small — additive variants and one or two new components layered on the existing DaisyUI base, not a parallel design system.

1. **`Card` emphasis variant** (`primary | default | subtle`) — the single highest-leverage addition; resolves most of the "everything is a Card" flatness across every screen in the audit.
2. **`InfoBanner` role split** (user-facing `info/warning/success/error`, unchanged, plus a quiet `note` treatment for internal/dev-facing copy).
3. **`StatTile`** — extracted from `QueueMetricCards`, reusable anywhere a small set of "numbers that matter" needs an at-a-glance treatment (Queue metrics today; Bulk Confirm's rows-uploaded/ready/excluded tomorrow).
4. **`SectionHeader`** — a consistent title + helper-copy + optional emphasis pattern, so "primary section" (Item Inputs, RequestSummaryCard) and "supporting section" (Content Requirements, Supporting materials) can be visually distinguished without inventing new copy or structure each time.
5. **Table "emphasized column" utility** — a single class/prop convention for giving one column (Title, Request title, Product Description) real typographic weight relative to its row, reused across all three tables in the app (Queue, Product Lookup, Bulk Review).
6. **WizardStepper current-step accent** — a small visual bump (not a new component) so the app's primary in-flow navigation device reads with appropriate authority.

Everything above is additive: default prop values preserve exactly the current visual output, so adopting them can happen incrementally, screen by screen, with zero risk to the underlying logic, state, validation, or navigation this audit was scoped to leave untouched.
