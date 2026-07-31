import { AppShell } from "../components/AppShell";
import { ReviewShell } from "../components/review/ReviewShell";
import { BrandVizReviewBody } from "../components/review/BrandVizReviewBody";
import { InnovationReviewBody } from "../components/review/InnovationReviewBody";
import { SupportingMaterialsReview, ReviewNotesPanel } from "../components/review/SupportingMaterialsReview";
import { RequestDetailHeader } from "../components/detail/RequestDetailHeader";
import { RequestDetailFooter } from "../components/detail/RequestDetailFooter";
import { groupProductsByRetailer } from "../lib/groupByRetailer";
import { isRequestEditable } from "../lib/editability";
import { handleInternalNavClick } from "../lib/clientNav";

/**
 * RequestNotFound — shown when the parsed :requestId doesn't match any
 * request currently in App.jsx's in-memory `requests` state, or when the
 * route couldn't be parsed into an ID at all. Never crashes: `requestId`
 * may be null/empty here, and the copy adapts accordingly.
 *
 * Exported so App.jsx's `/request/:id/edit` route can reuse the exact same
 * not-found presentation for an unknown edit-route id, instead of a second,
 * duplicated not-found component.
 */
export function RequestNotFound({ requestId, onNavigate }) {
  return (
    <AppShell showSectionTabs={false}>
      <main className="max-w-screen-xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-3">
        <h1 className="text-xl font-bold text-base-content">Request not found</h1>
        <p className="text-sm text-base-content/60 max-w-md">
          {requestId
            ? `No request matches "${requestId}". It may have been removed, or the link may be incorrect.`
            : "No request ID was provided in this link."}
        </p>
        <a
          href="/"
          onClick={(e) => handleInternalNavClick(e, "/", onNavigate)}
          className="btn btn-outline mt-2"
        >
          Back to requests
        </a>
      </main>
    </AppShell>
  );
}

/**
 * RequestDetail — READ-only Request Detail MVP.
 *
 * Thin dispatcher, deliberately mirroring ManualReviewStep's proven shape
 * rather than inventing a new one: pick the right explicit review body for
 * `request.requestType` and assemble it inside the same shared ReviewShell
 * (two-column grid + footer slot) Review already uses. This is not a
 * second, parallel Review implementation — it's the same body components,
 * reused, fed from a persisted Request instead of live wizard state.
 *
 * Data flow: `request` is consumed read-only. Nothing here holds it in
 * local state, copies it into an editable form, or calls back into
 * App.jsx to change it — there is no mutation path from this page at all
 * in this slice.
 *
 * `formData` adapter: BrandVizRequestSummary / InnovationRequestSummary
 * (rendered inside the two review bodies) expect wizard-style field names
 * (`title`, `defaultDate`, `description`, `assignee`, `contentTypes`) —
 * not the persisted Request's own field names (`launchDate`/`dueDate`
 * instead of `defaultDate`). Building this small adapter object here means
 * neither summary component's contract has to change. `request.launchDate
 * ?? request.dueDate` mirrors the same fallback the wizard itself used when
 * originally writing `launchDate`/`dueDate` from the same `formData.
 * defaultDate` value at creation time (see ManualRequestWizard.
 * handleCreateRequest).
 *
 * Retailer/date grouping: re-derived from the persisted `products` +
 * `launchDate` via the exact same `groupProductsByRetailer` the wizard's
 * Review step uses — not a new grouping rule, not stored on the request
 * itself. Innovation needs no equivalent call here: InnovationReviewBody
 * already groups nothing (flat item table), it just reads `itemInputs`
 * directly.
 *
 * `BrandVizReviewBody` is rendered with `readOnly` and no
 * `onUpdateGroupDate` — there is nothing for it to call. `InnovationReviewBody`
 * is rendered completely unchanged; it already has no editable controls,
 * regardless of whether the request was originally created via Flow A
 * (per-item accordion) or Flow B (item table) — both produce the same
 * `itemInputs` shape, so Detail can't tell (and doesn't need to tell) which
 * one was used.
 */
export function RequestDetail({ request, requestId, onNavigate }) {
  if (!request) {
    return <RequestNotFound requestId={requestId} onNavigate={onNavigate} />;
  }

  const isInnovation = request.requestType === "innovation";
  const editable = isRequestEditable(request);

  const formData = {
    title: request.title,
    defaultDate: request.launchDate ?? request.dueDate,
    description: request.description,
    assignee: request.assignee,
    contentTypes: request.contentTypes,
  };

  const retailerGroups = isInnovation
    ? []
    : groupProductsByRetailer(request.products ?? [], request.launchDate);

  return (
    <AppShell showSectionTabs={false}>
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <RequestDetailHeader request={request} isEditable={editable} onNavigate={onNavigate} />

        <ReviewShell
          left={
            isInnovation ? (
              <InnovationReviewBody formData={formData} itemInputs={request.itemInputs ?? []} />
            ) : (
              <BrandVizReviewBody
                requestType={request.requestType}
                formData={formData}
                products={request.products ?? []}
                retailerGroups={retailerGroups}
                readOnly
              />
            )
          }
          right={
            <>
              <SupportingMaterialsReview contentRequirements={request.contentRequirements} />
              <ReviewNotesPanel contentRequirements={request.contentRequirements} />
            </>
          }
          footer={<RequestDetailFooter isEditable={editable} onNavigate={onNavigate} requestId={request.id} />}
        />
      </main>
    </AppShell>
  );
}
