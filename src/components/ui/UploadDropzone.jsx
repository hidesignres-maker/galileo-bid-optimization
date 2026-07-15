import { useRef, useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

/**
 * UploadDropzone — simulated CSV upload target.
 * No real file parsing: onFileSelected(fileName) fires with the picked
 * file's name so the caller can swap in mocked import results.
 *
 * Shows an explicit "Browse files" button (not just a click-anywhere box),
 * matching the reference internal-app pattern — the whole box is still
 * click/drag-drop-able for convenience, but the button makes the control
 * visibly obvious instead of relying on an implicit click target.
 */
export function UploadDropzone({
  label = "Drag and drop CSV file here or",
  browseLabel = "Browse files",
  hint,
  onFileSelected,
  accept = ".csv",
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleFiles = (files) => {
    if (files && files.length > 0) {
      setFileName(files[0].name);
      onFileSelected?.(files[0].name);
    }
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div
      className={`rounded-box border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
        dragOver ? "border-primary bg-primary/5" : "border-base-300 bg-base-200"
      }`}
      onClick={openPicker}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <ArrowUpTrayIcon className="w-6 h-6 text-base-content/40 mx-auto mb-2" />
      {fileName ? (
        <p className="text-sm font-semibold text-base-content">Selected: {fileName}</p>
      ) : (
        <>
          <p className="text-sm text-base-content/70">{label}</p>
          <button
            type="button"
            className="btn btn-sm btn-outline mt-3"
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
          >
            {browseLabel}
          </button>
        </>
      )}
      {hint && <p className="text-xs text-base-content/50 mt-2">{hint}</p>}
    </div>
  );
}
