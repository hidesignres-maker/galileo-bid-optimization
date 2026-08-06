/**
 * SelectionCard — shared, reusable Galileo "selectable option card"
 * primitive: a bordered container that renders a radio control, a
 * title, and supporting description, with the entire card acting as one
 * real radio label (not a decorative box wrapping a separately-clickable
 * radio, and not a card whose "selected" look can drift out of sync with
 * the actual radio input's checked state — both are driven by the same
 * `selected` prop, so there is exactly one source of truth).
 *
 * Extracted this pass from CreationMethodSelector.jsx, which had already
 * built this exact card treatment but with Create-Request-specific
 * naming/data baked in — this component is deliberately generic (no
 * "creation method" or "request" language anywhere in it) so any future
 * "pick one bordered option" UI can reuse it instead of re-deriving the
 * same markup a third time.
 *
 * Anatomy: one `<label>` (the whole clickable/focusable surface) wrapping
 * a real `<input type="radio">` plus a title + optional description.
 * `name`/`value`/`checked`(`selected`)/`onChange`(`onSelect`) map
 * directly onto the underlying radio input, so real radio-group
 * semantics and native keyboard behavior (arrow-key movement within a
 * group sharing one `name`, Space/click to select, Tab to move between
 * groups) are unchanged from a plain radio input — nothing here
 * intercepts or reimplements that.
 *
 * Selected state: `border-primary bg-primary/5 ring-1 ring-primary`.
 * Unselected: `border-base-300 bg-base-100`, with a neutral hover state
 * (`hover:border-base-content/30`) so an unselected card still reads as
 * interactive.
 *
 * Use when: the user must pick exactly one option from a small set (2-4
 * is typical), and each option needs more explanation than a plain radio
 * row can carry (a title plus a supporting sentence). Do not use when:
 * options are numerous, or each option needs only a short label with no
 * supporting copy — a plain radio row (see RequestTypeSelector.jsx) is
 * lighter-weight and reads better for that case.
 */
export function SelectionCard({ name, value, selected, title, description, onSelect, className = "" }) {
  return (
    <label
      className={`flex items-start gap-3 rounded-box border p-5 cursor-pointer transition-colors ${
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-base-300 bg-base-100 hover:border-base-content/30"
      } ${className}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        className="radio radio-primary radio-sm mt-0.5"
        checked={selected}
        onChange={onSelect}
      />
      <div>
        <div className="text-sm font-bold text-base-content">{title}</div>
        {description && <div className="text-xs text-base-content/60 mt-1">{description}</div>}
      </div>
    </label>
  );
}
