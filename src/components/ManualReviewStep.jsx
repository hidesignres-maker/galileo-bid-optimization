import { ReviewShell } from "./review/ReviewShell";
import { ReviewFooter } from "./review/ReviewFooter";
import { SupportingMaterialsReview, ReviewNotesPanel } from "./review/SupportingMaterialsReview";
import { BrandVizReviewBody } from "./review/BrandVizReviewBody";
import { InnovationReviewBody } from "./review/InnovationReviewBody";

// Brand Request / VizID Change guidance — verified Figma copy, used
// exactly as given.
const BRAND_VIZ_GUIDANCE =
  "Review the request details, confirm retailer launch dates, and verify the selected products and supporting materials before creating the request.";

// Innovation has no verified Figma guidance string yet — keeping the
// existing neutral copy as a placeholder rather than reusing the Brand/Viz
// line (which references retailer launch dates and product selection,
// neither of which apply to Innovation's flat item-input flow).
const INNOVATION_GUIDANCE = "Review the details below, then create the request. You can go back to make changes before creating it.";

/**
 * ManualReviewStep — thin dispatcher only. It owns no state and no
 * business logic: it picks the right explicit review body for the current
 * requestType and assembles the shared ReviewShell (heading, two-column
 * grid, Supporting Materials + Notes rail, footer) around it.
 *
 * All data (formData, products, itemInputs, retailerGroups) and all
 * handlers (onBack, onDiscard, onCreateRequest, onUpdateGroupDate) are
 * passed straight through from ManualRequestWizard, which remains the
 * sole owner of wizard state and every callback — including retailer-date
 * editing, surfaced inside BrandVizReviewBody's accordion instead of a
 * separate Retailers step. No onRemoveGroup here — there is no visible
 * remove action anywhere in Review (removed per instruction); the
 * underlying removeGroup handler still exists in ManualRequestWizard but
 * is no longer threaded through this component.
 *
 * Heading is the literal "Review and submit" for both request-type
 * branches — App.jsx's page-level title is now the request-type-specific
 * one ("New Request : VizID change" / "Brand request" / "Innovation -
 * flow A"), so this internal heading intentionally does not repeat the
 * request type, to avoid showing it twice on the same screen.
 */
export function ManualReviewStep({
  requestType,
  formData,
  products,
  itemInputs,
  retailerGroups,
  onBack,
  onDiscard,
  onCreateRequest,
  onUpdateGroupDate,
}) {
  const isInnovation = requestType === "innovation";

  return (
    <ReviewShell
      heading="Review and submit"
      guidance={isInnovation ? INNOVATION_GUIDANCE : BRAND_VIZ_GUIDANCE}
      left={
        isInnovation ? (
          <InnovationReviewBody formData={formData} itemInputs={itemInputs} />
        ) : (
          <BrandVizReviewBody
            requestType={requestType}
            formData={formData}
            products={products}
            retailerGroups={retailerGroups}
            onUpdateGroupDate={onUpdateGroupDate}
          />
        )
      }
      right={
        <>
          <SupportingMaterialsReview contentRequirements={formData.contentRequirements} />
          <ReviewNotesPanel />
        </>
      }
      footer={<ReviewFooter onBack={onBack} onDiscard={onDiscard} onCreateRequest={onCreateRequest} />}
    />
  );
}
