import { useRef } from "react";
import { ArrowUpTrayIcon, LinkIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "./ui/Input";
import { InfoBanner } from "./ui/InfoBanner";
import { FileThumb } from "./ui/FileThumb";

// "Maximum 10 files" is enforced here, not just displayed as copy — see
// handleFilesSelected below.
const MAX_FILES = 10;

function formatFileSize(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

/**
 * Builds one file entry from a real, browser-selected File object (the
 * user's own file-picker selection — still no real upload anywhere in this
 * prototype: nothing is sent over the network or persisted).
 *
 * `previewUrl` is only set for images, via `URL.createObjectURL(file)` — a
 * temporary, local, in-memory blob URL. It's revoked the moment its file is
 * removed (see removeFile below), and on the wizard's own unmount (see
 * ManualRequestWizard, the actual long-lived owner of this state across
 * step navigation — revoking here instead would incorrectly break the
 * preview if the user merely navigates to another step and back).
 *
 * Non-image files (or files whose type the browser can't determine) get no
 * previewUrl — FileThumb renders a neutral placeholder icon for those.
 */
function createFileEntry(file) {
  const isImage = typeof file.type === "string" && file.type.startsWith("image/");
  return {
    id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    mimeType: file.type || undefined,
    sizeLabel: formatFileSize(file.size),
    previewUrl: isImage ? URL.createObjectURL(file) : undefined,
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
 * Each file entry is `{ id, name }` at minimum, plus optional `mimeType`,
 * `sizeLabel`, and `previewUrl` (see createFileEntry below) — the optional
 * fields are additive, so any pre-existing `{ id, name }`-only entry still
 * renders safely (see FileThumb's placeholder fallback).
 *
 * `notes` ("Notes for supporting materials") is a request-level, optional,
 * free-text field — distinct from Bulk CSV's per-row `contentNotes` (see
 * models.js). It is never required and has no character limit, matching
 * every other field in this section.
 */
export function ContentRequirementsSection({ requestType, value, onChange }) {
  const isInnovation = requestType === "innovation";
  const contentRequirements = value ?? { files: [], referenceLink: "", notes: "" };
  const fileInputRef = useRef(null);

  const updateContentRequirements = (patch) => {
    onChange({ ...contentRequirements, ...patch });
  };

  const openFilePicker = () => fileInputRef.current?.click();

  // Real browser file selection — still no real upload (nothing leaves the
  // browser). Caps the total at MAX_FILES; extra picks beyond that are
  // silently ignored rather than adding new error UI not asked for here.
  const handleFilesSelected = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const remainingSlots = MAX_FILES - contentRequirements.files.length;
    if (remainingSlots <= 0) return;
    const newEntries = Array.from(fileList).slice(0, remainingSlots).map(createFileEntry);
    updateContentRequirements({ files: [...contentRequirements.files, ...newEntries] });
  };

  // Revokes this file's own blob preview immediately on removal (freeing it
  // right away, rather than waiting for wizard unmount).
  const removeFile = (id) => {
    const target = contentRequirements.files.find((f) => f.id === id);
    if (target?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(target.previewUrl);
    }
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
            is CSV-only). Browse files now opens a real, hidden file input —
            still no drag-and-drop wiring and still no real upload (nothing
            is sent anywhere); this only lets the browser hand us real File
            objects so image previews can be generated locally. */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            handleFilesSelected(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="h-[182px] rounded-[8px] border border-dashed border-base-300 bg-base-100 flex flex-col items-center justify-center text-center px-6">
          <ArrowUpTrayIcon className="w-5 h-5 text-base-content/40 mx-auto mb-2" />
          <p className="text-sm text-base-content/70">Drag and drop files here or</p>
          <button type="button" className="btn btn-sm btn-outline mt-3" onClick={openFilePicker}>
            Browse files
          </button>
          <p className="text-xs text-base-content/40 mt-3">Maximum 10 files · Up to 500MB each</p>
        </div>

        {contentRequirements.files.length > 0 && (
          <ul className="flex flex-col gap-1.5 mt-3">
            {contentRequirements.files.map((file) => (
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
