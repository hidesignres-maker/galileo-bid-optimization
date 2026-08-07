import { InformationCircleIcon } from "@heroicons/react/24/outline";

/**
 * FieldInfoTooltip — small info icon + hover/focus tooltip for a field label.
 *
 * No dedicated Tooltip/Popover component existed anywhere in this app before
 * this (confirmed by repo search) — the only prior "info" precedents were a
 * static InformationCircleIcon inside a banner (ImportCsvStep.jsx) and
 * CustomBadge's native `title=` hover tooltip. Rather than introduce a new
 * tooltip library or hand-rolled positioning/JS, this reuses two things
 * already present: the same Heroicon, and DaisyUI's own CSS-only `tooltip`
 * component (`tooltip` + `data-tip`, already available since daisyUI is the
 * app's theme engine) — no extra JS, keyboard/hover accessible for free.
 *
 * Usage: place inline next to a field's label text, e.g.
 *   <span>Request title <FieldInfoTooltip text="…" /></span>
 * or via the opt-in `labelInfo` prop on `Input`/`Select`.
 */
export function FieldInfoTooltip({ text }) {
  return (
    <span className="tooltip tooltip-top" data-tip={text}>
      <InformationCircleIcon
        className="w-3.5 h-3.5 text-base-content/40 hover:text-base-content/70 cursor-help"
        aria-hidden="true"
      />
      <span className="sr-only">{text}</span>
    </span>
  );
}
