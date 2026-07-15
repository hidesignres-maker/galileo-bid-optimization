import { CheckIcon } from "@heroicons/react/24/solid";

/**
 * WizardStepper — numbered circle badges connected by a line, label below.
 *
 * `steps` is now a required prop (not hardcoded) because Manual and Bulk CSV
 * are genuinely different flows with different step counts/labels:
 *   Manual, Viz ID/Brand Request: Details, Products, Retailers, Review
 *   Manual, Innovation:           Details & Item Inputs, Review
 *   Bulk CSV:                     Download Template, Upload Template, Review, Confirm
 * Reusing one fixed 4-label stepper for all of these was the bug in the
 * previous version — Innovation was forced through a "Retailers" step it
 * doesn't need, and Bulk was jammed into the Manual wizard's step 2.
 */
export function WizardStepper({ steps, currentStep, furthestStep = currentStep, onStepClick }) {
  return (
    <ol className="flex items-start w-full">
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
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                  isDone || isCurrent
                    ? "bg-primary text-primary-content"
                    : "bg-base-300 text-base-content/60"
                }`}
              >
                {isDone ? <CheckIcon className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={`text-sm whitespace-nowrap ${
                  isCurrent ? "font-semibold text-base-content" : "text-base-content/60"
                }`}
              >
                {label}
              </span>
            </div>

            {!isLast && (
              <div className={`flex-1 h-px mx-3 mt-5 ${isDone ? "bg-primary" : "bg-base-300"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
