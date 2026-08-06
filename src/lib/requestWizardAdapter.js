import { mockAssignees } from "../data/formOptions";
import { createRequest } from "./models";

/**
 * requestWizardAdapter — the only place a persisted Request (models.js) is
 * translated into ManualRequestWizard's own state shapes, and back again.
 * Used exclusively by the Edit MVP (RequestDetail's "Edit Request" action
 * -> ManualRequestWizard mode="edit" -> Save changes); the create path is
 * untouched and doesn't import anything from this file.
 *
 * Every "to wizard" function below returns defensive copies — new arrays,
 * new object references for every array element — so editing the wizard's
 * own state (toggling a product, editing a retailer date, adding a file)
 * can never mutate the persisted request sitting in App.jsx's `requests`
 * array before Save.
 */

/**
 * ManualDetailsForm's Assignee <Select> stores/reads the option *value*
 * (e.g. "priya.nair"), not its label ("Priya Nair") — that's what a live
 * Created request's `assignee` field actually contains. This prototype's
 * hand-written seed data (mockRequests.js) instead stores the friendly
 * label directly, which is fine for plain-text display (Queue, Detail,
 * the summary cards) but would show the Assignee dropdown as blank on
 * hydration if passed through unchanged. This best-effort reverse lookup
 * resolves a known label back to its option value; anything unrecognized
 * (or already a valid value) passes through unchanged rather than being
 * silently dropped.
 */
function toAssigneeOptionValue(assignee) {
  if (!assignee) return "";
  const match = mockAssignees.find((a) => a.label === assignee || a.value === assignee);
  return match ? match.value : assignee;
}

/**
 * requestToWizardFormData — Request -> ManualDetailsForm's `formData` shape.
 *
 * `defaultDate` uses the same `launchDate` (falling back to `dueDate`)
 * precedence already used by RequestDetail's own read-only summary adapter
 * and by handleCreateRequest's own write side (both fields are always set
 * together, to the same value, for VizID/Brand Request; Innovation never
 * populates either at the request level, so this stays "" for Innovation
 * unless a request happens to carry one — see the Known Gaps note in the
 * Edit MVP report about Innovation's stale seed dueDate/launchDate values).
 */
export function requestToWizardFormData(request) {
  const cr = request.contentRequirements ?? {};
  return {
    title: request.title ?? "",
    description: request.description ?? "",
    defaultDate: request.launchDate ?? request.dueDate ?? "",
    contentTypes: [...(request.contentTypes ?? [])],
    assignee: toAssigneeOptionValue(request.assignee),
    contentRequirements: {
      files: (cr.files ?? []).map((f) => ({ ...f })),
      referenceLink: cr.referenceLink ?? "",
      notes: cr.notes ?? "",
    },
  };
}

/** requestToWizardProducts — defensive per-product shallow copy, preserving every stable id and any existing per-product `launchDate` override. */
export function requestToWizardProducts(request) {
  return (request.products ?? []).map((p) => ({ ...p }));
}

/**
 * requestToWizardItemInputs — defensive per-item shallow copy, preserving
 * every stable `id` and field value untouched. Returns `null` (not `[]`)
 * when the request has no items yet, so the caller can decide its own
 * "at least one row" fallback the same way create mode already does,
 * rather than this adapter guessing at wizard-specific defaults.
 */
export function requestToWizardItemInputs(request) {
  const items = request.itemInputs ?? [];
  return items.length > 0 ? items.map((item) => ({ ...item })) : null;
}

/**
 * buildUpdatedRequest — the Save side. Runs the exact same createRequest()
 * serialization ManualRequestWizard's own handleCreateRequest uses (so the
 * resulting shape is identical to a freshly created request), then
 * overwrites the identity/lifecycle fields a Save must never change:
 * `id`, `requestType`, `createdAt`, and provenance (`isPlaceholder`,
 * `sourceBatchId`). `status` is passed into createRequest() as part of the
 * draft itself (from `originalRequest.status`) rather than defaulted to
 * "needs_action" the way a brand-new create does — there is no confirmed
 * rule anywhere in this prototype that changes status on edit, so it is
 * always preserved as-is.
 */
export function buildUpdatedRequest({
  originalRequest,
  requestType,
  formData,
  products,
  itemInputs,
  retailers,
  isInnovation,
}) {
  const cr = originalRequest.contentRequirements ?? {};

  const draft = createRequest({
    requestType,
    creationMethod: originalRequest.creationMethod,
    title: formData.title,
    description: formData.description,
    assignee: formData.assignee,
    dueDate: formData.defaultDate || null,
    launchDate: formData.defaultDate || null,
    contentTypes: formData.contentTypes,
    retailers,
    products: isInnovation ? [] : products,
    itemInputs: isInnovation ? itemInputs : [],
    contentRequirements: {
      files: formData.contentRequirements.files,
      referenceLink: formData.contentRequirements.referenceLink,
      notes: formData.contentRequirements.notes,
      // Bulk-only fields this wizard never edits — carried over from the
      // original request untouched, same as handleCreateRequest leaves
      // them empty for a brand-new Manual request.
      referenceLinks: cr.referenceLinks ?? "",
      assetLinks: cr.assetLinks ?? "",
      contentNotes: cr.contentNotes ?? "",
    },
    status: originalRequest.status,
  });

  return {
    ...draft,
    id: originalRequest.id,
    requestType: originalRequest.requestType,
    createdAt: originalRequest.createdAt,
    isPlaceholder: originalRequest.isPlaceholder,
    sourceBatchId: originalRequest.sourceBatchId,
  };
}
