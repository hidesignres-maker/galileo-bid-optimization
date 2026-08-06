import { PhotoIcon } from "@heroicons/react/24/outline";

/**
 * ProductImageThumb — reusable product-image thumbnail for READ views
 * (Brand/VizID product rows today; any future product-facing surface can
 * reuse it the same way).
 *
 * Mirrors FileThumb's exact visual treatment (same rounded/border-base-300
 * placeholder box, same centered Heroicon at the same size/color) rather
 * than inventing a new placeholder style — this is a product-specific
 * sibling of FileThumb, not a replacement for it.
 *
 * `src` is optional and, today, always absent in this prototype's mock
 * data — no real or fetched image URLs have been added yet, only the
 * plumbing to display one once a real `imageUrl` exists on a product. Every
 * row therefore currently renders the neutral placeholder, which is the
 * expected, safe default: no `src` never breaks a row, it just shows the
 * placeholder instead of throwing or leaving an empty gap.
 *
 * `alt` should be the product's own description when available; the
 * placeholder marks itself with the same text via aria-label (so a screen
 * reader still gets a meaningful description) rather than exposing it as a
 * decorative, unlabeled image.
 */
export function ProductImageThumb({ src, alt = "", size = "w-10 h-10" }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${size} rounded object-cover shrink-0 border border-base-300`}
      />
    );
  }

  return (
    <div
      className={`${size} rounded shrink-0 border border-base-300 bg-base-200 flex items-center justify-center`}
      role="img"
      aria-label={alt ? `No image available for ${alt}` : "No product image available"}
    >
      <PhotoIcon className="w-4 h-4 text-base-content/40" aria-hidden="true" />
    </div>
  );
}
