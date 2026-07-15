import { RequestTypeSelector } from "./RequestTypeSelector";
import { UploadMethodSelector } from "./UploadMethodSelector";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Checkbox } from "./ui/Checkbox";
import { Card } from "./ui/Card";
import {
  CONTENT_TYPE_OPTIONS_BY_FLOW,
  DATE_FIELD_LABEL_BY_FLOW,
  mockAssignees,
} from "../data/formOptions";

/**
 * StepDetails — Step 1 of the wizard, single "Request details" card
 * matching the reference UI: Request Type (radios) → Task Title →
 * Description → Upload data (cards) → Default due / Assignee / Content type.
 */
export function StepDetails({
  requestType,
  inputMethod,
  formData,
  errors,
  onRequestTypeChange,
  onInputMethodChange,
  onFieldChange,
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
    <Card title="Request details">
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-semibold text-base-content mb-2">Request Type</h2>
          <RequestTypeSelector value={requestType} onChange={onRequestTypeChange} />
        </div>

        <Input
          label="Task Title"
          required
          value={formData.title}
          error={errors.title}
          onChange={(e) => onFieldChange("title", e.target.value)}
          placeholder="e.g. Q3 Viz ID refresh — GreenValley Snacks"
        />

        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text text-sm font-semibold text-base-content">
              Description
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            value={formData.description}
            onChange={(e) => onFieldChange("description", e.target.value)}
            placeholder="Add context for reviewers…"
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-base-content mb-2">Upload data</h2>
          <UploadMethodSelector
            requestType={requestType}
            value={inputMethod}
            onChange={onInputMethodChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          <Input
            type="date"
            label={dateLabel}
            required
            value={formData.defaultDate}
            error={errors.defaultDate}
            onChange={(e) => onFieldChange("defaultDate", e.target.value)}
          />

          <Select
            label="Assignee"
            required
            value={formData.assignee}
            error={errors.assignee}
            options={mockAssignees}
            onChange={(e) => onFieldChange("assignee", e.target.value)}
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
      </div>
    </Card>
  );
}
