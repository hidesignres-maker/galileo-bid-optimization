import { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CreationMethodSelector } from "../components/CreationMethodSelector";

/**
 * NewRequestEntry — Content Request Queue → New Request lands here first.
 * The user must choose a creation method before any request-type form is
 * shown. This is the fix for the previous prototype, which showed the full
 * manual form with "Input Method" buried as a toggle inside it.
 */
export function NewRequestEntry({ onChooseMethod, onCancel }) {
  const [method, setMethod] = useState(null);

  return (
    <Card title="New Request" subtitle="Choose how you'd like to create this request.">
      <div className="flex flex-col gap-5">
        <CreationMethodSelector value={method} onChange={setMethod} />
        <div className="flex items-center justify-between border-t border-base-300 pt-4">
          <Button variant="text" className="text-error" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            icon={ArrowRightIcon}
            disabled={!method}
            onClick={() => onChooseMethod(method)}
          >
            Continue
          </Button>
        </div>
      </div>
    </Card>
  );
}
