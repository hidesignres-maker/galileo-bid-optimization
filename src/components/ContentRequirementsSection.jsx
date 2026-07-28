import { ArrowUpTrayIcon, LinkIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "./ui/Input";
import { InfoBanner } from "./ui/InfoBanner";

// Mock file names for the "Browse files" simulation below — no real upload
// exists anywhere in this prototype. Rotates through a short list so
// repeated clicks add varied, plausible-looking filenames.
const MOCK_FILE_NAMES = ["packaging-mockup.jpg", "brand-reference.pdf", "lifestyle-shot.png", "spec-sheet.pdf"];
let mockFileSeq = 0;
function makeMockFile() {
  mockFileSeq += 1;
  return {
    id: `file-${Date.now()}-${mockFileSeq}`,
    name: MOCK_FILE_NAMES[(mockFileSeq - 1) % MOCK_FILE_NAMES.length],
  };
}

/**
 * ContentRequirementsSection — Reference link + Upload files, Manual-only
 * (see models.js / ImportCsvStep for why Bulk has no equivalent global
 * uploader). Extracted out of ManualDetailsForm so it can be mounted in a
 * different position in the form depending on request type — VizID
 * Change / Brand Request keep it inline at the end of Details (unchanged
 * position); Innovation renders it after Item Inputs instead (see
 * ManualRequestWizard).
 *
 * `value` is the wizard's `formData.contentRequirements` object
 * ({ files: [], referenceLink: "", notes: "" }); `onChange(next)` replaces
 * it wholesale (caller does `onFieldChange("contentRequirements", next)`).
 *
 * `notes` ("Notes for supporting materials") is a request-level, optional,
 * free-text field — distinct from Bulk CSV's per-row `contentNotes` (see
 * models.js). It is never required and has no character limit, matching
 * every other field in this section.
 */
export function ContentRequirementsSection({ requestType, value, onChange }) {
  const isInnovation = requestType === "innovation";
  const contentRequirements = value ?? { files: [], referenceLink: "", notes: "" };

  const updateContentRequirements = (patch) => {
    onChange({ ...contentRequirements, ...patch });
  };

  const addMockFile = () => {
    updateContentRequirements({ files: [...contentRequirements.files, makeMockFile()] });
  };

  const removeFile = (id) => {
    updateContentRequirements({ files: contentRequirements.files.filter((f) => f.id !== id) });
  };

  // TEMP ASSUMPTION: Manual Innovation keeps multiple item inputs grouped
  // in one request, and supporting materials are shared at request level
  // until product confirms whether item-level attachments or
  // one-ticket-per-item behavior is required.
  //
  // Heading is now uniform ("Supporting materials (optional)") across both
  // flows per Add Details Pattern v1 — previously Brand/VizID used
  // "Content requirements" while Innovation used "Supporting materials";
  // the "(optional)" suffix plus the helper copy below now makes clear
  // this whole section can be skipped. Helper copy stays per-type (kept
  // from before) since Innovation's items-in-this-request framing is still
  // accurate and worth preserving.
  const sectionTitle = "Supporting materials (optional)";
  const sectionHelper = isInnovation
    ? "Add shared files or reference links for the items in this request, if helpful. You can continue without adding any."
    : "Add supporting files or reference links needed to process this request, if helpful. You can continue without adding any.";
  const referenceLinkPlaceholder = isInnovation
    ? "Paste a setup sheet, SharePoint tracker, brand asset folder, or reference URL."
    : "Paste SharePoint tracker, brand asset, PDP link, or reference URL";
  const uploadHelper = isInnovation
    ? "Images, videos, PDFs, setup docs, or reference files that apply to this request."
    : "Images, videos, PDFs, or reference files.";

  return (
    <div className="flex flex-col gap-4 border-t border-base-300 pt-5">
      <div>
        <h3 className="text-sm font-bold text-base-content">{sectionTitle}</h3>
        <p className="text-xs text-base-content/50 mt-0.5">{sectionHelper}</p>
      </div>

      <InfoBanner variant="info">
        You can add more details, assets, assignee, and comments later in the request detail view.
      </InfoBanner>

      <Input
        label="Reference link"
        icon={LinkIcon}
        value={contentRequirements.referenceLink}
        onChange={(e) => updateContentRequirements({ referenceLink: e.target.value })}
        placeholder={referenceLinkPlaceholder}
        hint="Add any relevant links to help the team understand the request. Optional."
      />

      <div className="form-control w-full">
        <label className="label pb-1">
          <span className="label-text text-sm font-semibold text-base-content">
            Notes for supporting materials
          </span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          rows={3}
          value={contentRequirements.notes ?? ""}
          onChange={(e) => updateContentRequirements({ notes: e.target.value })}
          placeholder="Add any notes about the files or links above — formats, versions, or anything reviewers should know."
        />
        <span className="text-xs text-base-content/50 mt-1">Optional.</span>
      </div>

      <div className="form-control w-full">
        <label className="label pb-1">
          <span className="label-text text-sm font-semibold text-base-content">Upload files</span>
        </label>
        <p className="text-xs text-base-content/50 mb-2">{uploadHelper}</p>

        {/* Figma geometry: white surface, 1px dashed border, 8px radius,
            182px target height. Hand-rolled (not UploadDropzone.jsx, which
            is CSV-only) — same simulated add/remove behavior as before,
            just restyled. */}
        <div className="h-[182px] rounded-[8px] border border-dashed border-base-300 bg-base-100 flex flex-col items-center justify-center text-center px-6">
          <ArrowUpTrayIcon className="w-5 h-5 text-base-content/40 mx-auto mb-2" />
          <p className="text-sm text-base-content/70">Drag and drop files here or</p>
          <button type="button" className="btn btn-sm btn-outline mt-3" onClick={addMockFile}>
            Browse files
          </button>
          <p className="text-xs text-base-content/40 mt-3">Maximum 10 files · Up to 500MB each</p>
        </div>

        {contentRequirements.files.length > 0 && (
          <ul className="flex flex-col gap-1.5 mt-3">
            {contentRequirements.files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between gap-2 text-sm bg-base-200 rounded-box px-3 py-2"
              >
                <span className="text-base-content/80 truncate">{file.name}</span>
                <button
                  type="button"
                  className="text-base-content/40 hover:text-error shrink-0"
                  onClick={() => removeFile(file.id)}
                  aria-label={`Remove ${file.name}`}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
