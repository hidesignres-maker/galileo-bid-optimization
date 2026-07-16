import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Checkbox } from "./ui/Checkbox";
import { InfoBanner } from "./ui/InfoBanner";
import { CONTENT_TYPE_OPTIONS_BY_FLOW, DATE_FIELD_LABEL_BY_FLOW, mockAssignees } from "../data/formOptions";

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
 * ManualDetailsForm — Request title / Task description / Content Type /
 * Assignee / Content requirements, shared by all three manual flows.
 * Request Type is chosen on the screen before this (ManualRequestWizard's
 * "Select Request Type" step, or the CreateRequestLauncher modal before
 * that), and creation method was already decided before the wizard even
 * mounts — so this form doesn't carry either of those selectors.
 *
 * `showDate` lets Innovation skip the request-level default date, since
 * On Sale Date / Start Ship Date are captured per item in
 * InnovationItemInputForm instead.
 *
 * Content requirements (Reference link + Upload files) — added per Gowri's
 * clarification that Manual requests should support adding supporting
 * content at creation time, not only later in a request detail view. This
 * is Manual-only: Bulk CSV intentionally has no global uploader (see
 * ImportCsvStep / models.js) since one CSV upload creates many separate
 * requests, and a batch-level file would be ambiguous about which row it
 * belongs to. There is no Content notes field here on purpose — Task
 * description already covers task context, so a second free-text field
 * would just be extra exposure debt across review/detail/export without a
 * clear product need for it.
 */
export function ManualDetailsForm({ requestType, formData, errors, onFieldChange, showDate = true }) {
  const contentTypeOptions = CONTENT_TYPE_OPTIONS_BY_FLOW[requestType] ?? [];
  const dateLabel = DATE_FIELD_LABEL_BY_FLOW[requestType] ?? "Default Date";
  const isInnovation = requestType === "innovation";

  const contentRequirements = formData.contentRequirements ?? { files: [], referenceLink: "" };

  const toggleContentType = (value) => {
    const current = formData.contentTypes ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFieldChange("contentTypes", next);
  };

  const updateContentRequirements = (patch) => {
    onFieldChange("contentRequirements", { ...contentRequirements, ...patch });
  };

  const addMockFile = () => {
    updateContentRequirements({ files: [...contentRequirements.files, makeMockFile()] });
  };

  const removeFile = (id) => {
    updateContentRequirements({ files: contentRequirements.files.filter((f) => f.id !== id) });
  };

  const sectionTitle = isInnovation ? "Supporting materials" : "Content requirements";
  const sectionHelper = isInnovation
    ? "Add files or reference links needed for item setup."
    : "Add supporting files or reference links needed to process this request.";
  const referenceLinkPlaceholder = isInnovation
    ? "Paste item setup sheet, SharePoint tracker, brand asset, or reference URL"
    : "Paste SharePoint tracker, brand asset, PDP link, or reference URL";
  const uploadHelper = isInnovation
    ? "Images, videos, PDFs, item setup docs, or reference files."
    : "Images, videos, PDFs, or reference files.";

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Request title"
        required
        value={formData.title}
        error={errors.title}
        onChange={(e) => onFieldChange("title", e.target.value)}
        placeholder="e.g. Q3 VizID refresh — GreenValley Snacks"
      />

      <div className="form-control w-full">
        <label className="label pb-1">
          <span className="label-text text-sm font-semibold text-base-content">Task description</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          rows={3}
          value={formData.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          placeholder="Add context for reviewers…"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
        {showDate && (
          <Input
            type="date"
            label={dateLabel}
            required
            value={formData.defaultDate}
            error={errors.defaultDate}
            onChange={(e) => onFieldChange("defaultDate", e.target.value)}
          />
        )}

        <Select
          label="Assignee"
          options={mockAssignees}
          value={formData.assignee}
          onChange={(e) => onFieldChange("assignee", e.target.value)}
          hint="Optional"
        />

        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text text-sm font-semibold text-base-content">
              Content type
              <span className="text-error ml-0.5">*</span>
            </span>
          </label>
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
            {contentTypeOptions.map((opt) => (
              <Checkbox
                key={opt.value}
                label={opt.label}
                checked={(formData.contentTypes ?? []).includes(opt.value)}
                onChange={() => toggleContentType(opt.value)}
              />
            ))}
          </div>
          {errors.contentTypes && (
            <span className="text-xs text-error mt-1 block">{errors.contentTypes}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-base-300 pt-5">
        <div>
          <h3 className="text-sm font-bold text-base-content">{sectionTitle}</h3>
          <p className="text-xs text-base-content/50 mt-0.5">{sectionHelper}</p>
        </div>

        <InfoBanner variant="info">
          You can add more details, assets, assignee, and comments later in the request detail
          view.
        </InfoBanner>

        <Input
          label="Reference link"
          value={contentRequirements.referenceLink}
          onChange={(e) => updateContentRequirements({ referenceLink: e.target.value })}
          placeholder={referenceLinkPlaceholder}
          hint="Add any relevant links to help the team understand the request. Optional."
        />

        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text text-sm font-semibold text-base-content">Upload files</span>
          </label>
          <p className="text-xs text-base-content/50 mb-2">{uploadHelper}</p>

          <div className="rounded-box border-2 border-dashed border-base-300 bg-base-200 p-6 text-center">
            <ArrowUpTrayIcon className="w-5 h-5 text-base-content/40 mx-auto mb-2" />
            <p className="text-sm text-base-content/70">Drag and drop files here or</p>
            <button type="button" className="btn btn-sm btn-outline mt-3" onClick={addMockFile}>
              Browse files
            </button>
            <p className="text-xs text-base-content/40 mt-3">Max 10 files · Up to 500MB each</p>
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
    </div>
  );
}
