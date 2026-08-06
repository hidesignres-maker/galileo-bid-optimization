import { todayIso } from "./format";
import { getAssigneeLabel } from "../data/formOptions";

/**
 * requestHistory — small, pure helpers for generating History events at
 * runtime (Part F). No backend audit model, no field-level change tracking
 * beyond what's cheap and reliable to compute from two plain Request
 * objects (original vs. updated) — exactly what the task calls for
 * ("concise events only for meaningful changed fields").
 *
 * CURRENT_USER — this prototype has no real signed-in-user concept
 * anywhere (no auth). Per explicit instruction, a neutral placeholder label
 * is used for every runtime-generated event and for Comments' current-user
 * placeholder, rather than inventing a specific real employee identity.
 */
export const CURRENT_USER = "Current user";

let historySeq = 0;
function nextHistoryId(prefix) {
  historySeq += 1;
  return `${prefix}-${Date.now()}-${historySeq}`;
}

/** makeHistoryEvent — one display-only History entry. */
export function makeHistoryEvent(actor, description, at = todayIso()) {
  return { id: nextHistoryId("HIST"), actor, description, at };
}

/**
 * diffRequestForHistory — compares the pre-edit request to the just-saved
 * one and returns a short list of plain-English change descriptions, one
 * per meaningfully-changed field. Only fields both a user and a reviewer
 * would recognize as a real edit are checked; unrelated internal fields
 * (id, createdAt, isPlaceholder, sourceBatchId, products/itemInputs arrays)
 * are intentionally not diffed here — Products/Item Inputs changes are
 * already visible in their own sections, and diffing arrays field-by-field
 * would drift toward a backend audit model, which is explicitly out of
 * scope.
 *
 * Falls back to a single generic "edited the request" event when a Save
 * happened but none of the tracked fields actually changed (e.g. only
 * product/date-group edits) — so History still shows *something* happened
 * without fabricating false specifics.
 */
export function diffRequestForHistory(original, updated) {
  if (!original || !updated) return [];
  const changes = [];

  if (original.assignee !== updated.assignee) {
    const label = getAssigneeLabel(updated.assignee) || "Unassigned";
    changes.push(`${CURRENT_USER} changed Assignee to ${label}`);
  }
  if ((original.title ?? "") !== (updated.title ?? "")) {
    changes.push(`${CURRENT_USER} updated Request title`);
  }
  if ((original.description ?? "") !== (updated.description ?? "")) {
    changes.push(`${CURRENT_USER} updated Description`);
  }
  const originalDate = original.launchDate ?? original.dueDate ?? "";
  const updatedDate = updated.launchDate ?? updated.dueDate ?? "";
  if (originalDate !== updatedDate) {
    changes.push(`${CURRENT_USER} changed the effective date`);
  }
  const originalTypes = JSON.stringify([...(original.contentTypes ?? [])].sort());
  const updatedTypes = JSON.stringify([...(updated.contentTypes ?? [])].sort());
  if (originalTypes !== updatedTypes) {
    changes.push(`${CURRENT_USER} updated Content Type`);
  }

  if (changes.length === 0) {
    changes.push(`${CURRENT_USER} edited the request`);
  }
  return changes;
}
