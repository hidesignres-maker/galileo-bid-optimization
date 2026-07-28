import { PhotoIcon, DocumentIcon } from "@heroicons/react/24/outline";

/**
 * FileThumb — small thumbnail-or-placeholder tile for a mock/simulated
 * Supporting Materials file entry. Shared by ContentRequirementsSection's
 * (Add Details) file list and SupportingMaterialsReview's (Review) file
 * list, so both surfaces render the exact same visual logic:
 *
 *   - if `previewUrl` is present, render the real image (a local, in-memory
 *     `URL.createObjectURL(...)` blob URL created from a genuinely
 *     browser-selected image file — never a remote URL, never uploaded).
 *   - otherwise, render a neutral placeholder icon: PhotoIcon when
 *     `mimeType` looks like an image (a real image file that, for whatever
 *     reason, has no previewUrl yet), DocumentIcon for everything else —
 *     including pre-existing {id, name}-only file entries that predate
 *     this feature and carry no mimeType at all.
 *
 * Purely presentational: no upload, no persistence, no network calls, and
 * no assumption about backend/storage behavior.
 */
export function FileThumb({ previewUrl, mimeType, size = "w-9 h-9" }) {
  const isImageType = typeof mimeType === "string" && mimeType.startsWith("image/");

  if (previewUrl) {
    return (
      <img
        src={previewUrl}
        alt=""
        className={`${size} rounded object-cover shrink-0 border border-base-300`}
      />
    );
  }

  const Icon = isImageType ? PhotoIcon : DocumentIcon;
  return (
    <div
      className={`${size} rounded shrink-0 border border-base-300 bg-base-200 flex items-center justify-center`}
    >
      <Icon className="w-4 h-4 text-base-content/40" />
    </div>
  );
}
