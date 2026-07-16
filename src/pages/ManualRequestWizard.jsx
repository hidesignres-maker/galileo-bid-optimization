import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { WizardStepper } from "../components/WizardStepper";
import { RequestTypeSelector } from "../components/RequestTypeSelector";
import { ManualDetailsForm } from "../components/ManualDetailsForm";
import { ProductLookupTable } from "../components/ProductLookupTable";
import { InnovationItemInputForm, makeBlankItem } from "../components/InnovationItemInputForm";
import { RetailerDatesStep } from "../components/RetailerDatesStep";
import { ManualReviewStep } from "../components/ManualReviewStep";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { InfoBanner } from "../components/ui/InfoBanner";
import { mockProducts } from "../data/mockProducts";
import { getDetailsValidationErrors, isItemRowValid } from "../lib/businessRules";
import { groupProductsByRetailer } from "../lib/groupByRetailer";
import { createRequest } from "../lib/models";

const STEPS_BY_TYPE = {
  vizId: ["Details", "Products", "Retailers", "Review"],
  brandRequest: ["Details", "Products", "Retailers", "Review"],
  // Innovation skips Retailers entirely — retailer is captured per item in
  // the Details & Item Inputs step. Reaching a separate Retailers step here
  // was the previous prototype's bug (explicit stakeholder feedback).
  innovation: ["Details & Item Inputs", "Review"],
};

const initialFormData = {
  title: "",
  description: "",
  defaultDate: "",
  contentTypes: [],
  assignee: "",
  // Content requirements — Manual-only (see ManualDetailsForm). No notes
  // field by design: Task description already covers task context.
  contentRequirements: { files: [], referenceLink: "" },
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
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [errors, setErrors] = useState({});

  const steps = requestType ? STEPS_BY_TYPE[requestType] : [];
  const isInnovation = requestType === "innovation";

  const retailerGroups = useMemo(() => {
    if (!requestType || isInnovation) return [];
    return groupProductsByRetailer(products, formData.defaultDate);
  }, [requestType, isInnovation, products, formData.defaultDate]);

  const patchField = (field, value) => setFormData((f) => ({ ...f, [field]: value }));

  const toggleProduct = (id) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addSelectedProducts = () => {
    const toAdd = mockProducts.filter(
      (p) => selectedProductIds.has(p.id) && !products.some((existing) => existing.id === p.id)
    );
    setProducts((prev) => [...prev, ...toAdd]);
    setSelectedProductIds(new Set());
  };

  const updateGroupDate = (retailer, oldDate, newDate) => {
    setProducts((prev) =>
      prev.map((p) => {
        const productDate = p.launchDate || formData.defaultDate;
        const touchesRetailer = (p.retailers ?? []).includes(retailer);
        return touchesRetailer && productDate === oldDate ? { ...p, launchDate: newDate } : p;
      })
    );
  };

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
    if (steps[currentStep] === "Details" || steps[currentStep] === "Details & Item Inputs") {
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
      // clarification) — files/referenceLink are Manual's own fields;
      // referenceLinks/assetLinks/contentNotes stay empty here since those
      // are Bulk CSV's per-row fields (see bulkRowToRequest in models.js).
      contentRequirements: {
        files: formData.contentRequirements.files,
        referenceLink: formData.contentRequirements.referenceLink,
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
      <WizardStepper steps={steps} currentStep={currentStep} furthestStep={steps.length - 1} />

      {(stepName === "Details" || stepName === "Details & Item Inputs") && (
        <Card title={stepName}>
          <div className="flex flex-col gap-6">
            <ManualDetailsForm
              requestType={requestType}
              formData={formData}
              errors={errors}
              onFieldChange={patchField}
              showDate={!isInnovation}
            />
            {isInnovation && (
              <>
                <InnovationItemInputForm items={itemInputs} onChangeItems={setItemInputs} />
                {errors.items && <InfoBanner variant="error">{errors.items}</InfoBanner>}
              </>
            )}
          </div>
        </Card>
      )}

      {stepName === "Products" && (
        <div className="flex flex-col gap-4">
          <ProductLookupTable
            selectedProductIds={selectedProductIds}
            onToggleProduct={toggleProduct}
            onAddSelected={addSelectedProducts}
          />
          {products.length > 0 && (
            <InfoBanner variant="info">
              {products.length} product{products.length === 1 ? "" : "s"} added to this request.
            </InfoBanner>
          )}
        </div>
      )}

      {stepName === "Retailers" && (
        <RetailerDatesStep
          requestType={requestType}
          groups={retailerGroups}
          onUpdateGroupDate={updateGroupDate}
          onRemoveGroup={removeGroup}
        />
      )}

      {stepName === "Review" && (
        <ManualReviewStep
          requestType={requestType}
          formData={formData}
          products={products}
          itemInputs={itemInputs}
          retailerGroups={retailerGroups}
        />
      )}

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
        {stepName === "Review" ? (
          <Button variant="success" onClick={handleCreateRequest}>
            Create Request
          </Button>
        ) : (
          <Button
            icon={ArrowRightIcon}
            onClick={handleNext}
            disabled={stepName === "Products" && itemsValidCount === 0}
          >
            Continue to {steps[currentStep + 1]}
          </Button>
        )}
      </div>
    </div>
  );
}
