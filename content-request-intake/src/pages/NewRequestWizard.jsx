import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { WizardStepper } from "../components/WizardStepper";
import { StepDetails } from "../components/StepDetails";
import { ProductLookupTable } from "../components/ProductLookupTable";
import { ItemInputTable, makeBlankItemRow } from "../components/ItemInputTable";
import { CsvUploadPanel } from "../components/CsvUploadPanel";
import { RetailerDateGroups } from "../components/RetailerDateGroups";
import { RequestSummaryCard } from "../components/RequestSummaryCard";
import { ReviewGroups } from "../components/ReviewGroups";
import { OpenQuestionsPanel } from "../components/OpenQuestionsPanel";
import { Button } from "../components/ui/Button";
import { InfoBanner } from "../components/ui/InfoBanner";
import { mockProducts } from "../data/mockProducts";
import { mockInnovationItems } from "../data/mockInnovationItems";
import { REQUEST_TYPE_LABELS } from "../data/formOptions";
import {
  groupProductsByRetailer,
  groupItemsByRetailer,
} from "../lib/groupByRetailer";
import { getDetailsValidationErrors } from "../lib/businessRules";

const initialState = {
  currentStep: 0,
  requestType: "vizId",
  inputMethod: "manual",
  formData: {
    title: "",
    description: "",
    defaultDate: "",
    contentTypes: [],
    assignee: "",
  },
  products: [],
  itemInputs: [],
};

export function NewRequestWizard() {
  const [state, setState] = useState(initialState);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const { currentStep, requestType, inputMethod, formData, products, itemInputs } = state;

  const retailerGroups = useMemo(() => {
    return requestType === "innovation"
      ? groupItemsByRetailer(itemInputs)
      : groupProductsByRetailer(products, formData.defaultDate);
  }, [requestType, products, itemInputs, formData.defaultDate]);

  const patch = (partial) => setState((s) => ({ ...s, ...partial }));
  const patchFormData = (field, value) =>
    setState((s) => ({ ...s, formData: { ...s.formData, [field]: value } }));

  const handleRequestTypeChange = (type) => {
    if (type === requestType) return;
    setState((s) => ({
      ...s,
      requestType: type,
      products: [],
      itemInputs: [],
      formData: { ...s.formData, contentTypes: [] },
    }));
    setSelectedProductIds(new Set());
  };

  const handleInputMethodChange = (method) => {
    if (method === inputMethod) return;
    setState((s) => ({ ...s, inputMethod: method, products: [], itemInputs: [] }));
    setSelectedProductIds(new Set());
  };

  const handleLoadSample = () => {
    if (requestType === "innovation") {
      patch({ itemInputs: mockInnovationItems.map((r) => ({ ...r })) });
    } else {
      patch({ products: mockProducts.slice(0, 4).map((p) => ({ ...p })) });
    }
  };

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
    patch({ products: [...products, ...toAdd] });
    setSelectedProductIds(new Set());
  };

  const handleCsvImportComplete = (rows) => {
    if (requestType === "innovation") {
      patch({ itemInputs: rows.map((r) => ({ ...r })) });
    } else {
      patch({ products: rows.map((r) => ({ ...r })) });
    }
    goToStep(2);
  };

  const updateGroupDate = (retailer, oldDate, newDate) => {
    if (requestType === "innovation") {
      patch({
        itemInputs: itemInputs.map((item) =>
          item.retailer === retailer && item.onSaleDate === oldDate
            ? { ...item, onSaleDate: newDate }
            : item
        ),
      });
    } else {
      patch({
        products: products.map((p) => {
          const productDate = p.launchDate || formData.defaultDate;
          const touchesRetailer = (p.retailers ?? []).includes(retailer);
          return touchesRetailer && productDate === oldDate ? { ...p, launchDate: newDate } : p;
        }),
      });
    }
  };

  const removeGroup = (retailer, date) => {
    if (requestType === "innovation") {
      patch({
        itemInputs: itemInputs.filter(
          (item) => !(item.retailer === retailer && item.onSaleDate === date)
        ),
      });
    } else {
      patch({
        products: products.map((p) => {
          const productDate = p.launchDate || formData.defaultDate;
          if (productDate !== date) return p;
          return { ...p, retailers: (p.retailers ?? []).filter((r) => r !== retailer) };
        }),
      });
    }
  };

  const goToStep = (step) => {
    setState((s) => ({ ...s, currentStep: step }));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      const validationErrors = getDetailsValidationErrors(formData);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
    }
    goToStep(Math.min(currentStep + 1, 3));
  };

  const handleBack = () => goToStep(Math.max(currentStep - 1, 0));

  const handleSubmit = () => {
    setSubmitted({
      id: `REQ-${Math.floor(2000 + Math.random() * 900)}`,
      submittedOn: new Date().toISOString().slice(0, 10),
    });
  };

  const handleStartAnother = () => {
    setState(initialState);
    setSelectedProductIds(new Set());
    setErrors({});
    setSubmitted(null);
  };

  const handleDiscard = () => {
    if (window.confirm("Discard this request? Unsaved changes will be lost.")) {
      handleStartAnother();
    }
  };

  const itemCount = requestType === "innovation" ? itemInputs.length : products.length;
  const step1NextDisabled = itemCount === 0;

  const continueLabel = {
    0: `Continue to ${requestType === "innovation" ? "Item Inputs" : "Products"}`,
    1: "Continue to Retailers",
    2: "Continue to Review",
  }[currentStep];

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center flex flex-col items-center gap-4">
        <div className="badge badge-success badge-lg">Submitted</div>
        <h1 className="text-xl font-bold text-base-content">Request {submitted.id} submitted</h1>
        <p className="text-sm text-base-content/60">
          {REQUEST_TYPE_LABELS[requestType]} · submitted {submitted.submittedOn}. This is a
          front-end prototype — nothing was sent to a backend.
        </p>
        <Button variant="outline" onClick={handleStartAnother}>
          Start another request
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <OpenQuestionsPanel />

      <WizardStepper currentStep={currentStep} furthestStep={3} onStepClick={goToStep} />

      {currentStep === 0 && (
        <StepDetails
          requestType={requestType}
          inputMethod={inputMethod}
          formData={formData}
          errors={errors}
          onRequestTypeChange={handleRequestTypeChange}
          onInputMethodChange={handleInputMethodChange}
          onFieldChange={patchFormData}
        />
      )}

      {currentStep === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-base-content">
              {requestType === "innovation" ? "Item Inputs" : "Products"}
            </h2>
            <button type="button" className="btn btn-ghost btn-xs" onClick={handleLoadSample}>
              Load sample data
            </button>
          </div>

          {inputMethod === "bulkCsv" ? (
            <CsvUploadPanel requestType={requestType} onImportComplete={handleCsvImportComplete} />
          ) : requestType === "innovation" ? (
            <ItemInputTable
              rows={itemInputs.length ? itemInputs : [makeBlankItemRow()]}
              onChangeRows={(rows) => patch({ itemInputs: rows })}
              onContinue={() => goToStep(2)}
            />
          ) : (
            <ProductLookupTable
              selectedProductIds={selectedProductIds}
              onToggleProduct={toggleProduct}
              onAddSelected={addSelectedProducts}
            />
          )}

          {inputMethod === "manual" && requestType !== "innovation" && products.length > 0 && (
            <InfoBanner variant="info">
              {products.length} product{products.length === 1 ? "" : "s"} added to this request.
            </InfoBanner>
          )}
        </div>
      )}

      {currentStep === 2 && (
        <RetailerDateGroups
          requestType={requestType}
          groups={retailerGroups}
          onUpdateGroupDate={updateGroupDate}
          onRemoveGroup={removeGroup}
        />
      )}

      {currentStep === 3 && (
        <div className="flex flex-col gap-4">
          <RequestSummaryCard
            requestType={requestType}
            formData={formData}
            products={products}
            itemInputs={itemInputs}
            retailerGroups={retailerGroups}
          />
          <ReviewGroups requestType={requestType} groups={retailerGroups} />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-base-300 pt-4">
        <div className="flex items-center gap-2">
          <Button variant="text" className="text-error" onClick={handleDiscard}>
            Discard
          </Button>
          {currentStep > 0 && (
            <Button variant="ghost" onClick={handleBack}>
              Back
            </Button>
          )}
        </div>
        {currentStep < 3 ? (
          <Button
            icon={ArrowRightIcon}
            onClick={handleNext}
            disabled={currentStep === 1 && step1NextDisabled}
          >
            {continueLabel}
          </Button>
        ) : (
          <Button variant="success" onClick={handleSubmit}>
            Submit Request
          </Button>
        )}
      </div>
    </div>
  );
}
