import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { WizardStepper } from "../components/WizardStepper";
import { RequestTypeSelector } from "../components/RequestTypeSelector";
import { ManualDetailsForm } from "../components/ManualDetailsForm";
import { ProductLookupTable } from "../components/ProductLookupTable";
import { InnovationItemInputForm, makeBlankItem } from "../components/InnovationItemInputForm";
import { InnovationItemTable } from "../components/product-input/InnovationItemTable";
import { ManualReviewStep } from "../components/ManualReviewStep";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { InfoBanner } from "../components/ui/InfoBanner";
import { mockProducts } from "../data/mockProducts";
import { getDetailsValidationErrors, isItemRowValid } from "../lib/businessRules";
import { groupProductsByRetailer } from "../lib/groupByRetailer";
import { createRequest } from "../lib/models";

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
 * fallback so the component still works on its own.
 */
export function ManualRequestWizard({ onCreateRequest, onCancel, initialRequestType = null }) {
  const [requestType, setRequestType] = useState(initialRequestType);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [products, setProducts] = useState([]);
  const [itemInputs, setItemInputs] = useState([makeBlankItem()]);
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

  const stepName = steps[currentStep];
  const itemsValidCount = isInnovation ? itemInputs.length : products.length;
  // Both request-type families now use a differently-worded final step
  // name ("Review & Create" for Brand/VizID, "Review and Submit" for
  // Innovation's new 3-step Flow B topology) — this just generalizes the
  // exact-string checks that used to only match "Review & Create".
  const isReviewStep = stepName === "Review & Create" || stepName === "Review and Submit";

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

  return (
    <div className="flex flex-col gap-6">
      <WizardStepper
        steps={steps}
        currentStep={currentStep}
        furthestStep={steps.length - 1}
        variant="manualCreate"
      />

      {/* Add Details — explicit Figma-aligned composition (Add Details
          Pattern v1): centered 778px work surface, "Request details" card
          title (not the raw step name), 24px padding. Now shared verbatim
          by Brand/VizID AND Innovation Flow B/A alike — Innovation's Add
          Details step uses this exact same composition (no request-level
          date, per showDate={!isInnovation}, but Supporting
          Materials/Notes/mock file previews DO render here now for
          Innovation too, since Add Details is where they live for every
          request type in this pattern — see ManualDetailsForm's own
          showContentRequirements default of true). */}
      {stepName === "Add Details" && (
        <div className="w-[778px] mx-auto">
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
        />
      )}

      {/* Add Details footer — Figma-aligned: anchored to the same 778px
          work-surface boundary, 40px action row, no full-width top
          border. Copy is type-specific ("Continue to products" for
          Brand/VizID, "Continue to item inputs" for Innovation) since Add
          Details is now the shared first step for both. Back never shows
          here anyway (Add Details is always step 0), so dropping it
          changes nothing functionally. Same handleNext/onCancel handlers,
          same click-time validation — only the JSX shell differs. */}
      {stepName === "Add Details" ? (
        <div className="w-[778px] mx-auto flex items-center justify-between h-10">
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
    </div>
  );
}
