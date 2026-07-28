import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { WizardStepper } from "../components/WizardStepper";
import { RequestTypeSelector } from "../components/RequestTypeSelector";
import { ManualDetailsForm } from "../components/ManualDetailsForm";
import { ProductLookupTable } from "../components/ProductLookupTable";
import { InnovationItemInputForm, makeBlankItem } from "../components/InnovationItemInputForm";
import { ContentRequirementsSection } from "../components/ContentRequirementsSection";
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
// Review & Create instead of its own step. Innovation is untouched: it
// already skips a separate Retailers step entirely, since retailer is
// captured per item in Details & Item Inputs.
const STEPS_BY_TYPE = {
  vizId: ["Add Details", "Select Products", "Review & Create"],
  brandRequest: ["Add Details", "Select Products", "Review & Create"],
  innovation: ["Details & Item Inputs", "Review & Create"],
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

  const steps = requestType ? STEPS_BY_TYPE[requestType] : [];
  const isInnovation = requestType === "innovation";

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
    if (steps[currentStep] === "Add Details" || steps[currentStep] === "Details & Item Inputs") {
      const validationErrors = getDetailsValidationErrors(formData, { requireDate: !isInnovation });

      // Blocking validation for Innovation item inputs — UPC, Retailer,
      // Customer ID, Product Title, Brand, On Sale Date always required;
      // Start Ship Date required when Retailer is AMZ (isItemRowValid,
      // businessRules.js). A single invalid row blocks Continue to Review.
      if (isInnovation && itemInputs.some((item) => !isItemRowValid(item))) {
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

      {/* Brand/VizID Add Details — explicit Figma-aligned composition
          (Add Details Pattern v1): centered 778px work surface, "Request
          details" card title (not the raw step name), 24px padding. This
          branch never renders for Innovation — STEPS_BY_TYPE.innovation
          never contains "Add Details", only "Details & Item Inputs". */}
      {stepName === "Add Details" && (
        <div className="w-[778px] mx-auto">
          <Card title="Request details" headerClassName="px-6 pt-6" bodyClassName="p-6">
            <ManualDetailsForm
              requestType={requestType}
              formData={formData}
              errors={errors}
              onFieldChange={patchField}
              showDate={!isInnovation}
              showContentRequirements={!isInnovation}
            />
          </Card>
        </div>
      )}

      {/* Innovation Details & Item Inputs — deliberately kept structurally
          explicit, not folded into the Brand/VizID card composition above:
          no request-level date, item inputs stay in their existing
          location, Supporting Materials stays after item inputs. */}
      {stepName === "Details & Item Inputs" && (
        <Card title={stepName}>
          <div className="flex flex-col gap-6">
            <ManualDetailsForm
              requestType={requestType}
              formData={formData}
              errors={errors}
              onFieldChange={patchField}
              showDate={!isInnovation}
              showContentRequirements={!isInnovation}
            />
            <InnovationItemInputForm items={itemInputs} onChangeItems={setItemInputs} />
            {errors.items && <InfoBanner variant="error">{errors.items}</InfoBanner>}

            {/* TEMP ASSUMPTION: Manual Innovation keeps multiple item
                inputs grouped in one request, and supporting materials
                are shared at request level until product confirms
                whether item-level attachments or one-ticket-per-item
                behavior is required. Rendered here (after Item Inputs,
                not inside ManualDetailsForm) because item inputs are
                Innovation's primary object — users should enter items
                before adding shared supporting materials. */}
            <ContentRequirementsSection
              requestType={requestType}
              value={formData.contentRequirements}
              onChange={(next) => patchField("contentRequirements", next)}
            />
          </div>
        </Card>
      )}

      {stepName === "Select Products" && (
        <ProductLookupTable
          selectedProducts={products}
          onToggleProduct={toggleProduct}
          onClearAll={clearAllProducts}
        />
      )}

      {stepName === "Review & Create" && (
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

      {/* Brand/VizID Add Details footer — Figma-aligned: anchored to the
          same 778px work-surface boundary, 40px action row, exact copy
          "Continue to products" (not the dynamic "Continue to {next
          step}" used elsewhere), no full-width top border. Back never
          shows here anyway (Add Details is always step 0), so dropping it
          changes nothing functionally. Same handleNext/onCancel handlers,
          same click-time validation — only the JSX shell differs. */}
      {stepName === "Add Details" ? (
        <div className="w-[778px] mx-auto flex items-center justify-between h-10">
          <Button variant="text" className="text-error" onClick={onCancel}>
            Discard
          </Button>
          <Button icon={ArrowRightIcon} onClick={handleNext}>
            Continue to products
          </Button>
        </div>
      ) : (
        /* Review & Create renders its own footer (ReviewFooter, inside
           ManualReviewStep's ReviewShell) with the same handlers passed
           above — Back/Discard/Create Request are still wizard-owned, only
           the button JSX moved. Every other step (including Innovation's
           Details & Item Inputs) keeps this shared footer unchanged. */
        stepName !== "Review & Create" && (
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
              Continue to {steps[currentStep + 1]}
            </Button>
          </div>
        )
      )}
    </div>
  );
}
