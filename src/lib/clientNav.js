/**
 * clientNav — shared guard for the small number of internal links in this
 * prototype that want instant, non-reloading navigation (Queue's request
 * title, RequestDetailHeader/Footer's "Back to requests") while still
 * being real `<a href>` elements — not buttons with only an onClick.
 *
 * Every one of these links keeps its real `href`, so:
 *  - keyboard/screen-reader users get a real link, not a button pretending
 *    to be one
 *  - right-click "copy link address" / "open in new tab" works
 *  - Cmd/Ctrl/Shift/Alt-click and middle-click all fall through to the
 *    browser's own native handling (new tab/window), completely untouched
 *  - a target other than the link's own tab (`target="_blank"` etc.) is
 *    never intercepted either
 *
 * Only a plain, unmodified left-click gets intercepted, and only then is
 * the default navigation prevented and the app's own `onNavigate` (backed
 * by `window.history.pushState`, see App.jsx) called instead — no reload,
 * no loss of in-memory `requests` state.
 *
 * This mirrors the same modifier/target checks React Router's own `<Link>`
 * uses internally, without adding that dependency.
 */
export function handleInternalNavClick(event, href, onNavigate) {
  if (!onNavigate) return; // no client-side navigator available — let the browser handle it natively
  if (event.defaultPrevented) return;
  if (event.button !== 0) return; // not the primary/left button (e.g. middle-click)
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const linkTarget = event.currentTarget.target;
  if (linkTarget && linkTarget !== "_self") return; // e.g. target="_blank"

  event.preventDefault();
  onNavigate(href);
}
