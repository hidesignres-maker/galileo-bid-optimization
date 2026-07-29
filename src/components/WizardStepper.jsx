import { CheckIcon } from "@heroicons/react/24/solid";

/**
 * WizardStepper — numbered circle badges connected by a line, label below.
 *
 * `steps` is now a required prop (not hardcoded) because Manual and Bulk CSV
 * are genuinely different flows with different step counts/labels:
 *   Manual, VizID/Brand Request:  Details, Products, Retailers, Review & Create
 *   Manual, Innovation:           Details & Item Inputs, Review & Create
 *   Bulk CSV:                     Import CSV, Review, Confirm
 * Reusing one fixed 4-label stepper for all of these was the bug in the
 * previous version — Innovation was forced through a "Retailers" step it
 * doesn't need, and Bulk was jammed into the Manual wizard's step 2.
 *
 * `variant` ("default" | "manualCreate") — opt-in visual variant for the
 * Add Details Pattern v1 create-flow shell. "default" renders byte-
 * identical output to before this prop existed (same classes, same order),
 * so Bulk CSV's stepper (which never passes variant) is untouched.
 * "manualCreate" is used only by ManualRequestWizard: 32px indicators
 * (down from 40px), 8px pill connector bars (up from a 1px hairline),
 * 16/28 labels (up from text-sm), and the whole stepper capped at 780px
 * and centered — which lines up with the 778px Add Details work surface
 * (roughly a 200px inset on each side within the 1180px page canvas).
 * Active/inactive color logic (bg-primary vs bg-base-300) is unchanged by
 * either variant.
 */
export function WizardStepper({
  steps,
  currentStep,
  furthestStep = currentStep,
  onStepClick,
  variant = "default",
}) {
  const isManualCreate = variant === "manualCreate";
  const indicatorSize = isManualCreate ? "w-8 h-8" : "w-10 h-10";
  const connectorClass = isManualCreate ? "h-2 rounded-full mt-3" : "h-px mt-5";
  const labelClass = isManualCreate ? "text-base leading-7" : "text-sm";

  return (
    <ol className={`flex items-start w-full ${isManualCreate ? "max-w-[780px] mx-auto" : ""}`}>
      {steps.map((label, i) => {
        const isDone = i < currentStep;
        const isCurrent = i === currentStep;
        const isReachable = i <= furthestStep;
        const isLast = i === steps.length - 1;

        return (
          <li key={label} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div
              className="flex flex-col items-center gap-2"
              onClick={() => isReachable && onStepClick?.(i)}
              style={{ cursor: isReachable && onStepClick ? "pointer" : "default" }}
            >
              <div
                className={`${indicatorSize} rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                  isDone || isCurrent
                    ? "bg-primary text-primary-content"
                    : "bg-base-300 text-base-content/60"
                }`}
              >
                {isDone ? <CheckIcon className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={`${labelClass} whitespace-nowrap ${
                  isCurrent ? "font-semibold text-base-content" : "text-base-content/60"
                }`}
              >
                {label}
              </span>
            </div>

            {!isLast && (
              <div className={`flex-1 ${connectorClass} mx-3 ${isDone ? "bg-primary" : "bg-base-300"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
