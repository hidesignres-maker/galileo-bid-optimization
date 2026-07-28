import { Card } from "../ui/Card";
import { FileThumb } from "../ui/FileThumb";

/**
 * SupportingMaterialsReview — shared right-rail surface, used by both
 * Brand/VizID and Innovation review bodies via ManualReviewStep. Built
 * entirely from formData.contentRequirements ({ files, referenceLink,
 * notes }) — the only supporting-materials data the Manual flow actually
 * collects (see ContentRequirementsSection.jsx).
 *
 * Shows the actual referenceLink value as read-only review content
 * (truncated visually for long URLs, full value available via the
 * native `title` tooltip on hover/focus) — not a clickable link, no
 * href/onClick added, and the contentRequirements data itself is only
 * read here, never written.
 *
 * Each file entry renders via the shared FileThumb (real image preview
 * when the file has a `previewUrl`, a neutral placeholder icon otherwise
 * — including pre-existing `{id, name}`-only entries, which still render
 * safely with no mimeType/sizeLabel line). No delete affordance or upload
 * entry point here — Review is read-only.
 */
export function SupportingMaterialsReview({ contentRequirements }) {
  const files = contentRequirements?.files ?? [];
  const referenceLink = contentRequirements?.referenceLink ?? "";
  const hasLink = Boolean(referenceLink);
  const hasContent = files.length > 0 || hasLink;

  return (
    <Card title="Supporting Materials">
      {!hasContent ? (
        <p className="text-sm text-base-content/50">No supporting materials added.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {hasLink && (
            <div>
              <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                Reference link
              </div>
              <div className="text-sm text-base-content truncate" title={referenceLink}>
                {referenceLink}
              </div>
            </div>
          )}
          {files.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1.5">
                Files ({files.length})
              </div>
              <ul className="flex flex-col gap-1.5">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-2 text-sm bg-base-200 rounded-box px-3 py-2"
                  >
                    <FileThumb previewUrl={file.previewUrl} mimeType={file.mimeType} size="w-8 h-8" />
                    <div className="flex-1 min-w-0">
                      <p className="text-base-content/80 truncate">{file.name}</p>
                      {(file.mimeType || file.sizeLabel) && (
                        <p className="text-xs text-base-content/40 truncate">
                          {[file.mimeType, file.sizeLabel].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * ReviewNotesPanel — the Review shell's dedicated notes surface. Reads
 * `contentRequirements.notes` ("Notes for supporting materials", see
 * ContentRequirementsSection.jsx) — Manual's own request-level field,
 * distinct from Bulk CSV's per-row `contentNotes`.
 *
 * Defensively defaults to "" so requests created before this field existed
 * (mockRequests seed data, or any request whose contentRequirements was
 * built without `notes`) still render safely instead of throwing. Shows a
 * neutral empty state when there's nothing to show — no invented default
 * notes text.
 */
export function ReviewNotesPanel({ contentRequirements }) {
  const notes = contentRequirements?.notes ?? "";
  const hasNotes = Boolean(notes.trim());

  return (
    <Card title="Notes">
      {hasNotes ? (
        <p className="text-sm text-base-content whitespace-pre-wrap">{notes}</p>
      ) : (
        <p className="text-sm text-base-content/40 italic">No notes added for this request.</p>
      )}
    </Card>
  );
}
