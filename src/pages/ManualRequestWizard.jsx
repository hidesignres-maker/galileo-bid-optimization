import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { WizardStepper } from "../components/WizardStepper";
import { RequestTypeSelector } from "../components/RequestTypeSelector";
import { ManualDetailsForm } from "../components/ManualDetailsForm";
import { ProductLookupTable } from "../components/ProductLookupTable";
import { InnovationItemInputForm, makeBlankItem } from "../components/InnovationItemInputForm";
import { InnovationItemTable } from "../components/product-input/InnovationItemTable";
import { ManualReviewStep } from "../components/ManualReviewStep";
import { RequestHistory } from "../components/detail/RequestHistory";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { InfoBanner } from "../components/ui/InfoBanner";
import { mockProducts } from "../data/mockProducts";
import { getDetailsValidationErrors, isItemRowValid } from "../lib/businessRules";
import { groupProductsByRetailer } from "../lib/groupByRetailer";
import { createRequest } from "../lib/models";
import {
  requestToWizardFormData,
  requestToWizardProducts,
  requestToWizardItemInputs,
  buildUpdatedRequest,
} from "../lib/requestWizardAdapter";

// Confirmed product decision: Brand Request / VizID Change are a 3-step
// flow — the separate Retailers step is no longer part of the visible
// wizard. Retailer grouping/date-editing/removal (groupProductsByRetailer,
// updateGroupDate, removeGroup — all unchanged below) now happens inside
// Review & Create instead of its own step.
//
// Innovation Flow B (InnovationItemTable) is now the primary Innovation
// input experience, per the approved Figma audit — a 3-step flow of its
// own: Add Details (shares the exact Brand/VizID Add Details composition,
// including Supporting Materials/Notes) → Item Inputs (a dedicated step,
// no longer merged with Details) → Review and Submit. Flow A
// (InnovationItemInputForm) is preserved as an alternate presentation
// reachable via the "Test option A" toggle inside the Item Inputs step
// (see the Item Inputs render block below) — it is not a separate step
// count or a separate item model, just a different editor over the same
// itemInputs array.
const STEPS_BY_TYPE = {
  vizId: ["Add Details", "Select Products", "Review & Create"],
  brandRequest: ["Add Details", "Select Products", "Review & Create"],
  innovation: ["Add Details", "Item Inputs", "Review and Submit"],
};

const initialFormData = {
  title: "",
  description: "",
  defaultDate: "",
  contentTypes: [],
  assignee: "",
  // Content requirements — Manual-only (see ManualDetailsForm). `notes`
  // ("Notes for supporting materials") is optional, request-level free
  // text, distinct from Bulk CSV's per-row contentNotes (see models.js).
  contentRequirements: { files: [], referenceLink: "", notes: "" },
};

/**
 * ManualRequestWizard — always creates exactly ONE Request.
 *
 * Flow: Select Request Type (gate, not part of the stepper) → per-type
 * steps → Create Request. Request Type used to be folded into Step 1 of one
 * generic wizard; it's now its own screen, since it determines which steps
 * exist at all (Innovation's step list is a different length).
 *
 * `initialRequestType` — optional. CreateRequestLauncher (the Queue's "New
 * Request" modal) now collects Request Type up front for Manual, since
 * Manual creates exactly one request and the type can't be deferred. When
 * provided, the in-page type gate below is skipped entirely and the correct
 * step list renders immediately. When omitted (e.g. this component is used
 * directly, or the launcher is bypassed), the old gate remains as a
 * fallback so the component still works on its own. Ignored in edit mode
 * (see below) — an existing request's own type is always the source of
 * truth there.
 *
 * EDIT MVP — three new, optional, backward-compatible props. Every
 * existing create caller (CreateRequestLauncher's flow, via App.jsx) omits
 * all three, so `mode` defaults to "create" and nothing below behaves any
 * differently than before:
 *
 * `mode` ("create", default | "edit") — which final Review action / save
 * path is active. Read once at the top; nothing else in this component
 * branches on the request-type-selector gate becoming reachable in edit
 * mode, because `requestType` is already hydrated below whenever
 * `initialRequestData` is present, so that gate is simply never reached.
 *
 * `initialRequestData` — the persisted Request being edited (only
 * meaningful when `mode === "edit"`). Used exactly once, at mount, via
 * lazy `useState` initializers below (requestToWizardFormData/Products/
 * ItemInputs — see requestWizardAdapter.js) — never re-read after that.
 * This is deliberate: a lazy initializer function only runs on the very
 * first render, so the wizard hydrates from the request once and then
 * behaves as fully independent local state from then on, exactly like
 * create mode's blank defaults do. There is no effect anywhere in this
 * file that re-syncs state from `initialRequestData` on a later render.
 *
 * `onUpdateRequest` — called instead of `onCreateRequest` when saving in
 * edit mode (see handleSaveChanges). `onCreateRequest` itself is simply
 * not passed by the edit-mode caller and is never invoked in that mode.
 *
 * `history` — optional, edit-mode-only. Plain pass-through from App.jsx's
 * own history state (keyed by `initialRequestData.id`) — this wizard holds
 * none of that data itself, exactly like RequestDetail doesn't either.
 * Create mode never passes it (there's no persisted request id yet to key
 * it by), so History simply never renders outside edit mode.
 *
 * Comments are deliberately NOT accepted here (product correction: Comments
 * must not appear anywhere inside the Edit wizard — Comments remain a
 * READ-only surface, via RequestDetail). App.jsx's comment state/handler
 * are untouched; this component just never reads them.
 */
export function ManualRequestWizard({
  onCreateRequest,
  onCancel,
  initialRequestType = null,
  initialRequestData = null,
  mode = "create",
  onUpdateRequest,
  history = [],
}) {
  const isEditMode = mode === "edit" && Boolean(initialRequestData);

  const [requestType, setRequestType] = useState(() =>
    isEditMode ? initialRequestData.requestType : initialRequestType
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() =>
    isEditMode ? requestToWizardFormData(initialRequestData) : initialFormData
  );
  const [products, setProducts] = useState(() =>
    isEditMode && initialRequestData.requestType !== "innovation"
      ? requestToWizardProducts(initialRequestData)
      : []
  );
  const [itemInputs, setItemInputs] = useState(() => {
    if (isEditMode && initialRequestData.requestType === "innovation") {
      return requestToWizardItemInputs(initialRequestData) ?? [makeBlankItem()];
    }
    return [makeBlankItem()];
  });
  const [errors, setErrors] = useState({});

  // Presentation-only Innovation input mode — "table" (Flow B, primary) or
  // "form" (Flow A, reached via the temporary "Test option A" toggle in
  // the Item Inputs step). Never persisted in the Request payload; both
  // modes read/write the exact same itemInputs array, so no conversion is
  // ever needed when switching.
  const [innovationInputMode, setInnovationInputMode] = useState("table");

  const steps = requestType ? STEPS_BY_TYPE[requestType] : [];
  const isInnovation = requestType === "innovation";

  // Supporting Materials' file previews use URL.createObjectURL for real,
  // browser-selected image files (see ContentRequirementsSection.jsx).
  // Those blob URLs are revoked immediately when a file is removed, but a
  // file can also just be abandoned by leaving the wizard entirely
  // (Discard, or after a successful Create Request) — this wizard is the
  // actual long-lived owner of formData across every step, so it's the
  // right place to sweep up any remaining preview URLs on unmount. This
  // deliberately does NOT run on every re-render/step change — only once,
  // when the wizard itself unmounts — since revoking on intermediate step
  // navigation would break previews the user could still navigate back to.
  const contentRequirementsRef = useRef(formData.contentRequirements);
  contentRequirementsRef.current = formData.contentRequirements;
  useEffect(() => {
    return () => {
      (contentRequirementsRef.current?.files ?? []).forEach((file) => {
        if (file.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, []);

  const retailerGroups = useMemo(() => {
    if (!requestType || isInnovation) return [];
    return groupProductsByRetailer(products, formData.defaultDate);
  }, [requestType, isInnovation, products, formData.defaultDate]);

  const patchField = (field, value) => setFormData((f) => ({ ...f, [field]: value }));

  // Product-first selection: checking a row in ProductLookupTable adds/
  // removes it directly in `products` (the wizard's own, already-persistent
  // state used by Review's retailer grouping/request creation). There is no
  // separate staging Set anymore — selection is `products` itself, so it
  // can never be lost by changing search, retailer filter, or view within
  // the Select Products step (see ProductLookupTable.jsx for the
  // interaction).
  const toggleProduct = (id) => {
    setProducts((prev) => {
      if (prev.some((p) => p.id === id)) return prev.filter((p) => p.id !== id);
      const product = mockProducts.find((p) => p.id === id);
      return product ? [...prev, product] : prev;
    });
  };

  const clearAllProducts = () => setProducts([]);

  const updateGroupDate = (retailer, oldDate, newDate) => {
    setProducts((prev) =>
      prev.map((p) => {
        const productDate = p.launchDate || formData.defaultDate;
        const touchesRetailer = (p.retailers ?? []).includes(retailer);
        return touchesRetailer && productDate === oldDate ? { ...p, launchDate: newDate } : p;
      })
    );
  };

  // No visible remove action anywhere in Review (removed per instruction —
  // see ManualReviewStep/BrandVizReviewBody). This handler is intentionally
  // kept, not deleted: grep confirms it currently has no consumers, but
  // deleting it wasn't explicitly requested, so it stays available rather
  // than being removed speculatively.
  const removeGroup = (retailer, date) => {
    setProducts((prev) =>
      prev.map((p) => {
        const productDate = p.launchDate || formData.defaultDate;
        if (productDate !== date) return p;
        return { ...p, retailers: (p.retailers ?? []).filter((r) => r !== retailer) };
      })
    );
  };

  const handleNext = () => {
    const step = steps[currentStep];

    // Add Details validation — title/date/content type — same rule set as
    // before, now shared verbatim by Brand/VizID and Innovation, since
    // Innovation's Add Details is the same step (and same composition) as
    // Brand/VizID's, just with showDate=false.
    if (step === "Add Details") {
      const validationErrors = getDetailsValidationErrors(formData, { requireDate: !isInnovation });
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
    }

    // Item Inputs validation — Innovation only, now its own dedicated step
    // (previously merged with Details). Same rule, same trigger point
    // relative to "leaving the step that owns itemInputs": UPC, Retailer,
    // Customer ID, Product Title, Brand, On Sale Date always required;
    // Start Ship Date required when Retailer is AMZ (isItemRowValid,
    // businessRules.js, unchanged). A single invalid row — from either
    // Flow A or Flow B, since both write the same itemInputs array —
    // blocks Continue to Review.
    if (step === "Item Inputs") {
      const validationErrors = {};
      if (itemInputs.some((item) => !isItemRowValid(item))) {
        validationErrors.items =
          "Some item inputs are missing required fields. Complete all required fields before continuing.";
      }
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
    }

    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleCreateRequest = () => {
    const distinctRetailers = isInnovation
      ? Array.from(new Set(itemInputs.map((i) => i.retailer).filter(Boolean)))
      : Array.from(new Set(retailerGroups.map((g) => g.retailer)));

    const request = createRequest({
      requestType,
      creationMethod: "manual",
      title: formData.title,
      description: formData.description,
      assignee: formData.assignee,
      dueDate: formData.defaultDate || null,
      launchDate: formData.defaultDate || null,
      contentTypes: formData.contentTypes,
      retailers: distinctRetailers,
      products: isInnovation ? [] : products,
      itemInputs: isInnovation ? itemInputs : [],
      // Content requirements collected at creation time (Gowri's
      // clarification) — files/referenceLink/notes are Manual's own fields;
      // referenceLinks/assetLinks/contentNotes stay empty here since those
      // are Bulk CSV's per-row fields (see bulkRowToRequest in models.js).
      contentRequirements: {
        files: formData.contentRequirements.files,
        referenceLink: formData.contentRequirements.referenceLink,
        notes: formData.contentRequirements.notes,
        referenceLinks: "",
        assetLinks: "",
        contentNotes: "",
      },
      status: "needs_action",
    });
    onCreateRequest(request);
  };

  // EDIT MVP — the Save path. Builds the updated request via the shared
  // requestWizardAdapter (same createRequest() serialization
  // handleCreateRequest above uses, plus identity/lifecycle preservation —
  // see buildUpdatedRequest's own doc comment), then hands it to the
  // caller. Never calls onCreateRequest and never touches
  // initialRequestData itself — the wizard's own products/itemInputs/
  // formData are the only things read here, and they've been local,
  // independent draft state since the one-time hydration above.
  const handleSaveChanges = () => {
    const distinctRetailers = isInnovation
      ? Array.from(new Set(itemInputs.map((i) => i.retailer).filter(Boolean)))
      : Array.from(new Set(retailerGroups.map((g) => g.retailer)));

    const updatedRequest = buildUpdatedRequest({
      originalRequest: initialRequestData,
      requestType,
      formData,
      products,
      itemInputs,
      retailers: distinctRetailers,
      isInnovation,
    });

    onUpdateRequest(updatedRequest);
  };

  const stepName = steps[currentStep];
  const itemsValidCount = isInnovation ? itemInputs.length : products.length;
  // Both request-type families now use a differently-worded final step
  // name ("Review & Create" for Brand/VizID, "Review and Submit" for
  // Innovation's new 3-step Flow B topology) — this just generalizes the
  // exact-string checks that used to only match "Review & Create".
  const isReviewStep = stepName === "Review & Create" || stepName === "Review and Submit";

  // The persistent Edit-layout sidebar (History only — no Details, no
  // Comments) applies to Edit mode's non-Review steps (Add Details, Item
  // Inputs, Select Products). The Review step is handled separately below:
  // ManualReviewStep/ReviewShell already have their own proven two-column
  // composition (Request Summary + Products by Retailer/Innovation items
  // on the left, Supporting Materials + Notes on the right), and per
  // instruction that composition must be preserved rather than
  // reconstructed manually here — so Review never uses this outer sidebar
  // grid at all. Instead, History is threaded into ManualReviewStep's own
  // `extraRightContent` slot (see below), landing in the SAME right column
  // as Supporting Materials/Notes, directly beneath them. Create mode never
  // sets this true, so create mode's layout is byte-for-byte unaffected.
  const showEditSidebar = isEditMode && !isReviewStep;

  // Fluid, responsive outer grid for Edit's non-Review steps: main column
  // flexes (minmax(0,1fr)) and the History column is a fixed 320px. Single
  // column below the `md` breakpoint (History stacks below the main
  // content on narrow widths — no horizontal scrolling, no fixed/absolute
  // positioning anywhere).
  const editSidebarGridClass = "grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start";

  // Gate: request type must be chosen before any step-specific form shows.
  if (!requestType) {
    return (
      <Card title="Build manually" subtitle="Select a request type to continue.">
        <div className="flex flex-col gap-5">
          <RequestTypeSelector value={requestType} onChange={setRequestType} />
          <div className="flex items-center justify-between border-t border-base-300 pt-4">
            <Button variant="text" className="text-error" onClick={onCancel}>
              Cancel
            </Button>
            <Button icon={ArrowRightIcon} disabled onClick={() => {}}>
              Select a request type
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Main step content + its footer — unchanged markup/handlers from before
  // this pass, just extracted into a variable so it can render either
  // directly (create mode, and edit mode's Review step) or inside the new
  // two-column Edit-layout grid (edit mode's non-Review steps) without
  // duplicating any of it.
  const stepBody = (
    <>
      {/* Add Details — explicit Figma-aligned composition (Add Details
          Pattern v1): centered 778px work surface in create mode ("Request
          details" card title, 24px padding), full-width within the grid's
          left column in Edit mode (showEditSidebar) instead — same card,
          same fields, just no fixed width/centering once it's already
          constrained by the grid column. Now shared verbatim by Brand/VizID
          AND Innovation Flow B/A alike — Innovation's Add Details step uses
          this exact same composition (no request-level date, per
          showDate={!isInnovation}, but Supporting Materials/Notes/mock file
          previews DO render here now for Innovation too, since Add Details
          is where they live for every request type in this pattern — see
          ManualDetailsForm's own showContentRequirements default of true).
          Assignee renders here in both Create and Edit — Edit must closely
          mirror Create with every currently-supported editable field
          available in the main flow; the Edit sidebar has no Assignee
          control of its own (it shows History only), so there is exactly
          one Assignee input, never a second, competing one. */}
      {stepName === "Add Details" && (
        <div className={showEditSidebar ? "" : "w-[778px] mx-auto"}>
          <Card title="Request details" headerClassName="px-6 pt-6" bodyClassName="p-6">
            <ManualDetailsForm
              requestType={requestType}
              formData={formData}
              errors={errors}
              onFieldChange={patchField}
              showDate={!isInnovation}
            />
          </Card>
        </div>
      )}

      {/* Innovation Item Inputs — its own dedicated step (Flow B topology),
          no longer merged with Add Details. Renders whichever editor
          `innovationInputMode` selects: InnovationItemTable (Flow B,
          default/primary) or InnovationItemInputForm (Flow A, preserved
          as-is, reached via the temporary "Test option A" toggle below).
          Both read/write the exact same wizard-owned itemInputs array —
          no conversion, no second item model, no data loss when toggling. */}
      {stepName === "Item Inputs" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <label className="flex items-center gap-2 text-xs text-base-content/60 cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-sm"
                checked={innovationInputMode === "form"}
                onChange={(e) => setInnovationInputMode(e.target.checked ? "form" : "table")}
              />
              Test option A
            </label>
          </div>

          {innovationInputMode === "form" ? (
            <InnovationItemInputForm items={itemInputs} onChangeItems={setItemInputs} />
          ) : (
            <InnovationItemTable items={itemInputs} onChangeItems={setItemInputs} />
          )}

          {errors.items && <InfoBanner variant="error">{errors.items}</InfoBanner>}
        </div>
      )}

      {stepName === "Select Products" && (
        <ProductLookupTable
          selectedProducts={products}
          onToggleProduct={toggleProduct}
          onClearAll={clearAllProducts}
        />
      )}

      {/* Review — ManualReviewStep/ReviewShell are used unmodified for
          BOTH modes (never reconstructed manually here), preserving their
          existing two-column composition: Request Summary + Products by
          Retailer/Innovation items on the left, Supporting Materials +
          Notes on the right, footer below. Edit mode's only addition is
          `extraRightContent` — a small, backward-compatible slot
          ManualReviewStep now supports (default null, so create mode is
          byte-for-byte unaffected) that renders directly below Notes, in
          that SAME right column. This is how History reaches the Review
          step without a second outer sidebar and without ever appearing
          above the Review content or below the footer. Every handler
          passed below is the exact same wizard-owned handler create mode
          already uses — no business logic, validation, or Save behavior
          changed. */}
      {isReviewStep && (
        <ManualReviewStep
          requestType={requestType}
          formData={formData}
          products={products}
          itemInputs={itemInputs}
          retailerGroups={retailerGroups}
          onBack={handleBack}
          onDiscard={onCancel}
          onCreateRequest={handleCreateRequest}
          onUpdateGroupDate={updateGroupDate}
          mode={isEditMode ? "edit" : "create"}
          onSaveChanges={handleSaveChanges}
          extraRightContent={isEditMode ? <RequestHistory events={history} /> : null}
        />
      )}

      {/* Add Details footer — Figma-aligned: anchored to the same 778px
          work-surface boundary in create mode (no fixed width in Edit
          mode's grid column), 40px action row, no full-width top border.
          Copy is type-specific ("Continue to products" for Brand/VizID,
          "Continue to item inputs" for Innovation) since Add Details is now
          the shared first step for both. Back never shows here anyway (Add
          Details is always step 0), so dropping it changes nothing
          functionally. Same handleNext/onCancel handlers, same click-time
          validation — only the JSX shell differs. */}
      {stepName === "Add Details" ? (
        <div className={`${showEditSidebar ? "" : "w-[778px] mx-auto"} flex items-center justify-between h-10`}>
          <Button variant="text" className="text-error" onClick={onCancel}>
            Discard
          </Button>
          <Button icon={ArrowRightIcon} onClick={handleNext}>
            {isInnovation ? "Continue to item inputs" : "Continue to products"}
          </Button>
        </div>
      ) : (
        /* Review steps render their own footer (ReviewFooter, inside
           ManualReviewStep's ReviewShell) with the same handlers passed
           above — Back/Discard/Create Request are still wizard-owned, only
           the button JSX moved. Every other step (Select Products,
           Innovation's Item Inputs) keeps this shared footer unchanged.
           Item Inputs gets the exact copy "Continue to review" instead of
           the dynamic next-step-name template, since the next step's real
           name ("Review and Submit") reads awkwardly here. */
        !isReviewStep && (
          <div className="flex items-center justify-between border-t border-base-300 pt-4">
            <div className="flex items-center gap-2">
              <Button variant="text" className="text-error" onClick={onCancel}>
                Discard
              </Button>
              {currentStep > 0 && (
                <Button variant="ghost" onClick={handleBack}>
                  Back
                </Button>
              )}
            </div>
            <Button
              icon={ArrowRightIcon}
              onClick={handleNext}
              disabled={stepName === "Select Products" && itemsValidCount === 0}
            >
              {stepName === "Item Inputs" ? "Continue to review" : `Continue to ${steps[currentStep + 1]}`}
            </Button>
          </div>
        )
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <WizardStepper
        steps={steps}
        currentStep={currentStep}
        furthestStep={steps.length - 1}
        variant="manualCreate"
      />

      {/* Edit layout: a persistent right-sidebar with ONLY History, next to
          the editable flow content — active on Edit's non-Review steps
          (Add Details, Item Inputs, Select Products). The Review step
          never reaches this branch (showEditSidebar excludes it) — History
          gets there instead via ManualReviewStep's own `extraRightContent`
          slot, inside its existing Supporting Materials/Notes column (see
          the Review block above), so it never needs a second outer
          sidebar. Create mode always falls through to the plain `stepBody`
          render below, completely unchanged. The left ("main") column
          renders `stepBody` unmodified; it gets `min-w-0` so it can shrink
          inside the fluid `minmax(0,1fr)` track instead of overflowing.

          No Details, no Comments here either — Details was removed pending
          final design (Details still renders in READ, via
          RequestDetail.jsx, untouched), Comments stay READ-only. Assignee
          lives exclusively in the main form (stepBody, via
          ManualDetailsForm), same as every other editable field. */}
      {showEditSidebar ? (
        <div className={editSidebarGridClass}>
          <div className="min-w-0 flex flex-col gap-6">{stepBody}</div>
          <div className="min-w-0">
            <RequestHistory events={history} />
          </div>
        </div>
      ) : (
        stepBody
      )}
    </div>
  );
}
