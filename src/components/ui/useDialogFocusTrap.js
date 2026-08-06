import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * useDialogFocusTrap — shared overlay accessibility behavior, extracted
 * from Modal.jsx (Aug 2026 Drawer pass) so a new overlay pattern (Drawer)
 * gets the exact same, already-tested focus/keyboard behavior instead of
 * a second hand-rolled trap. Modal.jsx's own behavior is unchanged by
 * this extraction — same effect, same dependencies, same cleanup, just
 * moved into one place two components can both call.
 *
 * On mount: focuses the first focusable element inside `panelRef`'s node
 * (or the panel itself if none exist). While mounted: Tab/Shift+Tab wrap
 * within the panel's own focusable elements instead of escaping to the
 * page behind the overlay; Escape calls `onCancel`.
 */
export function useDialogFocusTrap(panelRef, onCancel) {
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = () => Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR));
    (focusable()[0] || panel).focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel?.();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panelRef, onCancel]);
}
