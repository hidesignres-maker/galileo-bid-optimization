import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { ReviewShell } from "../components/review/ReviewShell";
import { BrandVizReviewBody } from "../components/review/BrandVizReviewBody";
import { InnovationReviewBody } from "../components/review/InnovationReviewBody";
import { BulkCsvReviewBody } from "../components/review/BulkCsvReviewBody";
import { SupportingMaterialsReview, ReviewNotesPanel } from "../components/review/SupportingMaterialsReview";
import { RequestDetailHeader } from "../components/detail/RequestDetailHeader";
import { RequestConversationPanel } from "../components/detail/RequestConversationPanel";
import { groupProductsByRetailer } from "../lib/groupByRetailer";
import { canEditRequest } from "../lib/editability";
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
 * RequestDetail — READ-only Request Detail (Corrected Approved Scope, Aug
 * 2026 pass).
 *
 * Still the same thin-dispatcher shape as before: pick the right explicit
 * review body for `request.requestType` and assemble it inside the shared
 * `ReviewShell` (two-column grid). This pass changes the composition
 * around that reused core, not the core itself:
 *
 *  - Header is now the full operational header (breadcrumb, title, latest
 *    activity, Status quick-control, Edit, More) — see
 *    RequestDetailHeader's own doc comment. It absorbs the primary
 *    actions (Edit, Archive) that used to live in the now-retired
 *    `RequestDetailFooter`, plus Copy link / View full history.
 *  - `RequestDetailsCard` (the old right-rail metadata card) and
 *    `RequestDetailFooter` are no longer rendered here — confirmed unused
 *    anywhere else in the app before removal (grep). The approved right
 *    rail is exactly three things: Supporting Materials, Notes, and the
 *    combined Comments/History panel.
 *  - `BrandVizRequestSummary`/`InnovationRequestSummary` (rendered inside
 *    the two review bodies) now render with `hideTitle` — the title lives
 *    once, in the header — and, when the request is editable, a real
 *    `onAssigneeChange` wired to `onUpdateAssignee`.
 *  - The two former separate Comments/History cards are replaced by one
 *    `RequestConversationPanel`, tab-controlled from `activeTab` state
 *    here so the header's "View full history" action can switch it.
 *
 * Everything else — the `formData` adapter, `retailerGroups` derivation,
 * `readOnly` wiring into `BrandVizReviewBody`, the not-found guard — is
 * unchanged from before.
 *
 * Information-architecture pass (Aug 2026): every body below now renders
 * with `variant="detail"` (see `BrandVizRequestSummary`/
 * `InnovationRequestSummary`'s own doc comments) — Request Overview's
 * approved READ field order (Description, Request type, Content type,
 * [Launch Date], Assignee), not the wizard Review step's original order.
 * A third dispatch branch is added ahead of the existing
 * innovation/Brand-VizID split: `request.creationMethod === "bulkCsv"`
 * renders `BulkCsvReviewBody`, the item-centered layout for a
 * provisionally-imported row, regardless of that row's own `requestType`
 * (Decision A) — Request type in its Overview still shows the real
 * `requestType` label; only the body beneath it (item detail instead of
 * retailer groups / an item table) changes for a bulk-imported request.
 */
export function RequestDetail({
  request,
  requestId,
  onNavigate,
  comments = [],
  history = [],
  onAddComment,
  onArchive,
  onUpdateStatus,
  onUpdateAssignee,
}) {
  const [activeTab, setActiveTab] = useState("comments");

  if (!request) {
    return <RequestNotFound requestId={requestId} onNavigate={onNavigate} />;
  }

  const isInnovation = request.requestType === "innovation";
  const isBulkImport = request.creationMethod === "bulkCsv";
  const bulkItem = isBulkImport ? (request.itemInputs?.[0] ?? null) : null;
  // Editable now folds in the Archive lifecycle check (canEditRequest)
  // alongside the pre-existing date rule (isRequestEditable, untouched) —
  // an archived request is always read-only regardless of its dates.
  const editable = canEditRequest(request);

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

  // Assignee quick-edit is only wired in when the request is actually
  // editable — an archived/date-locked request renders Assignee as plain
  // text (onAssigneeChange omitted), same gating rule `canEditRequest`
  // already applies to Status/Edit elsewhere on this page.
  const handleAssigneeChange = editable
    ? (newAssignee) => onUpdateAssignee?.(request.id, newAssignee)
    : undefined;

  return (
    <AppShell showSectionTabs={false}>
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <RequestDetailHeader
          request={request}
          requestId={request.id}
          isEditable={editable}
          history={history}
          onNavigate={onNavigate}
          onUpdateStatus={onUpdateStatus}
          onArchive={onArchive}
          onViewFullHistory={() => setActiveTab("history")}
        />

        <ReviewShell
          left={
            isBulkImport ? (
              <BulkCsvReviewBody
                requestType={request.requestType}
                formData={formData}
                item={bulkItem}
                onAssigneeChange={handleAssigneeChange}
              />
            ) : isInnovation ? (
              <InnovationReviewBody
                formData={formData}
                itemInputs={request.itemInputs ?? []}
                hideTitle
                variant="detail"
                onAssigneeChange={handleAssigneeChange}
              />
            ) : (
              <BrandVizReviewBody
                requestType={request.requestType}
                formData={formData}
                products={request.products ?? []}
                retailerGroups={retailerGroups}
                readOnly
                hideTitle
                variant="detail"
                onAssigneeChange={handleAssigneeChange}
              />
            )
          }
          right={
            // Right rail (approved scope): exactly three things —
            // Supporting Materials, Notes, and the combined Comments/
            // History panel. No Details/Overview/metadata card.
            <>
              <SupportingMaterialsReview contentRequirements={request.contentRequirements} variant="detail" />
              <ReviewNotesPanel contentRequirements={request.contentRequirements} variant="detail" />
              <RequestConversationPanel
                activeTab={activeTab}
                onTabChange={setActiveTab}
                comments={comments}
                onAddComment={(text) => onAddComment?.(request.id, text)}
                history={history}
              />
            </>
          }
        />
      </main>
    </AppShell>
  );
}
