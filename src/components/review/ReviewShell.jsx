/**
 * ReviewShell — shared, slot-based layout for the Manual wizard's final
 * Review & Create step. Product-agnostic: it renders whatever it's given
 * and knows nothing about request types, products, or item inputs. The
 * per-request-type composition (BrandVizReviewBody / InnovationReviewBody)
 * and the data live entirely in ManualReviewStep and its children.
 *
 * Visual composition (approved):
 *  - 1180px content boundary, centered.
 *  - Heading + guidance line above the two-column grid.
 *  - Two-column grid: left 779px / gap 24px / right 377px
 *    (779 + 24 + 377 = 1180, so the grid exactly fills the boundary).
 *  - `footer` renders below the grid — callers supply their own footer
 *    content (see ReviewFooter) rather than this shell hardcoding one.
 */
export function ReviewShell({ heading, guidance, left, right, footer }) {
  return (
    <div className="max-w-[1180px] mx-auto flex flex-col gap-6">
      <div>
        {heading && <h2 className="text-lg font-bold text-base-content">{heading}</h2>}
        {guidance && <p className="text-sm text-base-content/60 mt-1">{guidance}</p>}
      </div>

      <div className="grid grid-cols-[779px_377px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">{left}</div>
        <div className="flex flex-col gap-6 min-w-0">{right}</div>
      </div>

      {footer}
    </div>
  );
}
