import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Checkbox } from "./ui/Checkbox";
import { ContentRequirementsSection } from "./ContentRequirementsSection";
import { CONTENT_TYPE_OPTIONS_BY_FLOW, DATE_FIELD_LABEL_BY_FLOW, mockAssignees } from "../data/formOptions";

/**
 * ManualDetailsForm — Request title / Task description / Content Type /
 * Assignee, shared by all three manual flows. Request Type is chosen on
 * the screen before this (ManualRequestWizard's "Select Request Type"
 * step, or the CreateRequestLauncher modal before that), and creation
 * method was already decided before the wizard even mounts — so this form
 * doesn't carry either of those selectors.
 *
 * `showDate` lets Innovation skip the request-level default date, since
 * On Sale Date / Start Ship Date are captured per item in
 * InnovationItemInputForm instead.
 *
 * `showContentRequirements` (default true) controls whether this component
 * renders the Content Requirements / Supporting materials section inline,
 * right after the fields above. VizID Change / Brand Request keep it here
 * (unchanged position). Innovation passes `false` — ManualRequestWizard
 * renders ContentRequirementsSection itself, positioned after Item Inputs
 * instead, per a temporary product assumption that item inputs are
 * Innovation's primary object and should be entered before shared
 * supporting materials (see ManualRequestWizard for the TEMP ASSUMPTION
 * comment).
 */
export function ManualDetailsForm({
  requestType,
  formData,
  errors,
  onFieldChange,
  showDate = true,
  showContentRequirements = true,
}) {
  const contentTypeOptions = CONTENT_TYPE_OPTIONS_BY_FLOW[requestType] ?? [];
  const dateLabel = DATE_FIELD_LABEL_BY_FLOW[requestType] ?? "Default Date";

  const toggleContentType = (value) => {
    const current = formData.contentTypes ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFieldChange("contentTypes", next);
  };

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

      {showContentRequirements && (
        <ContentRequirementsSection
          requestType={requestType}
          value={formData.contentRequirements}
          onChange={(next) => onFieldChange("contentRequirements", next)}
        />
      )}
    </div>
  );
}
