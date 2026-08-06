import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

/**
 * MoreMenu — small overflow-action menu for Request Detail's operational
 * header (Corrected Approved Scope, Aug 2026: "More" menu holding Copy
 * request link / View full history / Archive request — explicitly NOT
 * Duplicate request, per the resolved decision).
 *
 * No dropdown/menu pattern existed anywhere else in this codebase to
 * reuse (confirmed by search), so this is a new, minimal component — kept
 * local to `components/detail/` rather than promoted to `ui/`, since
 * nothing else in the app needs an overflow menu yet and generalizing it
 * now would be scope creep beyond what was asked for.
 *
 * Built on DaisyUI's own `dropdown`/`menu` classes (already a project
 * dependency, used everywhere else in this app) rather than hand-rolled
 * click-outside/keyboard-trap logic — DaisyUI's dropdown is pure CSS
 * (`:focus-within`), so the trigger button, the menu, and Escape-to-close
 * (native blur) all work with zero extra JS. Each item blurs itself on
 * click so the menu closes immediately after a selection.
 *
 * `items` — plain array of `{ label, onSelect, disabled, destructive }`.
 * This component owns no action logic itself — every `onSelect` is
 * supplied by the caller (RequestDetailHeader), which is what actually
 * calls into copy-link / tab-switch / archive-confirm behavior.
 */
export function MoreMenu({ items = [], "aria-label": ariaLabel = "More actions" }) {
  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        className="btn btn-ghost btn-sm btn-square"
        aria-label={ariaLabel}
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu z-10 mt-2 w-56 rounded-box bg-base-100 border border-base-300 shadow-sm p-1"
      >
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              disabled={item.disabled}
              className={item.destructive ? "text-error" : ""}
              onClick={(e) => {
                e.currentTarget.blur();
                item.onSelect();
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
