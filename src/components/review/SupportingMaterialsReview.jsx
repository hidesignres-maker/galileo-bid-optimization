import { Card } from "../ui/Card";

/**
 * SupportingMaterialsReview — shared right-rail surface, used by both
 * Brand/VizID and Innovation review bodies via ManualReviewStep. Built
 * entirely from formData.contentRequirements ({ files: [{id,name}],
 * referenceLink }) — the only supporting-materials data the Manual flow
 * actually collects (see ContentRequirementsSection.jsx).
 *
 * Shows the actual referenceLink value as read-only review content
 * (truncated visually for long URLs, full value available via the
 * native `title` tooltip on hover/focus) — not a clickable link, no
 * href/onClick added, and the contentRequirements data itself is only
 * read here, never written.
 *
 * No thumbnails, file type, file size, delete affordance, or upload entry
 * point — none of that data or behavior exists in this prototype (files
 * only ever carry {id, name} — see ContentRequirementsSection.jsx's mock
 * file generator). Inventing any of it would misrepresent what's actually
 * modeled.
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
                    className="text-sm text-base-content/80 bg-base-200 rounded-box px-3 py-2 truncate"
                  >
                    {file.name}
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
 * ReviewNotesPanel — the Review shell's "separate notes surface." There is
 * no notes field anywhere in the Manual flow's data model (formData /
 * Request / contentRequirements) — contentNotes exists only on Bulk CSV
 * rows, a different creation path entirely. Rather than invent a notes
 * field to populate this panel, it renders as a clearly-labeled, always-
 * empty placeholder: the composition (a dedicated notes surface next to
 * Supporting Materials) is preserved without fabricating data behind it.
 */
export function ReviewNotesPanel() {
  return (
    <Card title="Notes">
      <p className="text-sm text-base-content/40 italic">No notes added for this request.</p>
    </Card>
  );
}
