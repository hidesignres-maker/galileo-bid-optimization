import { ChevronDownIcon } from "@heroicons/react/24/outline";

/**
 * SelectField — shared "label inside control" select primitive (Galileo
 * design system). The approved Figma treatment for a compact filter
 * control shows the field name and its current value combined inside one
 * 40px-tall control ("Request Type   All"), not a separate label row
 * above a select. `Select` (ui/Select.jsx) already covers the
 * traditional external-label pattern and stays the right choice for
 * stacked form fields (e.g. Create/Edit); this is a separate, additive
 * primitive for the combined toolbar treatment, not a replacement.
 *
 * Implementation note: DaisyUI v5's own `.select` class does support a
 * label-plus-select composition (`<label class="select"><span
 * class="label">…</span><select>…</select></label>`), but its nested
 * `& select` rule stretches the native <select> to the full width of the
 * wrapper via a negative-margin trick so the whole box stays clickable —
 * verified against the compiled DaisyUI source (select.css) rather than
 * assumed. Rebuilding that exact trick here would fight the same
 * component for a result no more correct than composing the pieces
 * directly, so this primitive lays out its own flex row (label span,
 * native <select>, chevron icon) using the same border/height/radius
 * tokens the rest of the app's fields already use, keeping the actual
 * <select> element fully native (full keyboard support, native focus,
 * native option list) rather than visually hidden or replaced.
 *
 * `label` — static field name rendered before the value, regular weight,
 * muted (`text-base-content/60`). Not itself focusable/interactive.
 * `aria-label` (defaults to `label`) is set directly on the <select> so
 * the accessible name is stable regardless of future label copy changes.
 *
 * `value`/`onChange`/`options`/`placeholder` behave exactly like `Select`
 * (ui/Select.jsx): the placeholder option is value="" and disabled — it
 * displays as the current state but cannot be re-selected from the list
 * (matching Select's existing behavior), so "returning to All" stays the
 * Reset-filters button's job, not a dropdown option, exactly as before.
 *
 * Use when: a compact filter/toolbar control should present its name and
 * current value together in one 40px control (e.g. the Queue toolbar).
 * Do not use when: the control is one of several stacked fields in a
 * form and needs a conventional external label for scannability — use
 * `Select` there instead.
 */
export function SelectField({
  label,
  options = [],
  placeholder = "All",
  value,
  onChange,
  className = "",
  "aria-label": ariaLabel,
  ...props
}) {
  return (
    <label
      className={`h-10 w-full flex items-center gap-1.5 px-3 bg-base-100 border border-base-300 rounded-field cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${className}`}
    >
      <span className="text-sm font-normal text-base-content/60 shrink-0">{label}</span>
      <select
        className="flex-1 min-w-0 bg-transparent border-none outline-none p-0 text-sm font-normal text-base-content appearance-none cursor-pointer"
        value={value}
        onChange={onChange}
        aria-label={ariaLabel || label}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* The native <select> above is appearance-none (no browser-default
          arrow), so the dropdown affordance is restored explicitly with
          the same Heroicons Outline set already used everywhere else in
          this app (see BrandVizReviewBody.jsx/InnovationItemInputForm.jsx
          for the same ChevronDownIcon), sized/muted like Input.jsx's own
          leading icons (w-4 h-4, text-base-content/40). */}
      <ChevronDownIcon className="w-4 h-4 text-base-content/40 shrink-0 pointer-events-none" aria-hidden="true" />
    </label>
  );
}
