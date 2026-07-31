import { useEffect, useState } from "react";
import { ArrowLeftIcon, ChevronRightIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import { ContentRequestQueue } from "./pages/ContentRequestQueue";
import { ManualRequestWizard } from "./pages/ManualRequestWizard";
import { BulkCsvWizard } from "./pages/BulkCsvWizard";
import { ProductSelectionDemo } from "./pages/ProductSelectionDemo";
import { RequestDetail, RequestNotFound } from "./pages/RequestDetail";
import { CreateRequestLauncher } from "./components/CreateRequestLauncher";
import { AppShell } from "./components/AppShell";
import { Button } from "./components/ui/Button";
import { mockRequests } from "./data/mockRequests";
import { REQUEST_TYPE_LABELS } from "./data/formOptions";
import { isRequestEditable } from "./lib/editability";
import { handleInternalNavClick } from "./lib/clientNav";

// Lightest possible route handling for this static prototype: no router
// dependency, just a pathname check read once at module load. There is no
// client-side navigation *into* "/product-selection" from within the full
// app (it's a separate stakeholder-testing entry point, reached by opening
// or refreshing that URL directly), so this value never needs to change
// during a mounted App's lifetime — safe to branch on before any hooks run.
const isProductSelectionDemo =
  typeof window !== "undefined" &&
  window.location.pathname.replace(/\/+$/, "") === "/product-selection";

// Same lightweight approach, extended with one capture group for the
// request ID — still no router dependency, just a regex. Unlike
// isProductSelectionDemo, this route needs to change *without* a full page
// reload (so in-memory `requests` state survives Queue <-> Detail
// navigation), so the match itself is computed from reactive `currentPath`
// state inside App() (see below) rather than read once at module load.
const REQUEST_DETAIL_PATH = /^\/request\/([^/]+)\/?$/;

// Edit MVP — one more capture-group regex, same lightweight approach. This
// never collides with REQUEST_DETAIL_PATH above: matching "/request/REQ-1"
// (no trailing "/edit") against this pattern fails since `[^/]+` can't
// consume the literal "/edit" segment, and matching "/request/REQ-1/edit"
// against REQUEST_DETAIL_PATH also fails for the same reason in reverse —
// each pathname matches exactly one of the two.
const REQUEST_EDIT_PATH = /^\/request\/([^/]+)\/edit\/?$/;

// Edit-page title copy, mirroring MANUAL_TITLE_BY_TYPE's own convention
// below but built from REQUEST_TYPE_LABELS directly rather than a second
// hand-written string map — this page's title only ever needs "Edit
// request : <type label>", no per-flow copy variation like create mode's
// "flow A" suffix.
const editPageTitle = (requestType) => `Edit request : ${REQUEST_TYPE_LABELS[requestType] ?? "Request"}`;

const BREADCRUMB_BY_VIEW = {
  queue: [["Content Request Queue"]],
  // Simplified for the manual create/review flow per the approved Figma
  // create-flow shell: "Content Request / New Request", no third
  // "Build Manually" crumb. Bulk's breadcrumb is untouched.
  manual: [["Content Request", "queue"], ["New Request"]],
  bulk: [["Content Request", "queue"], ["New Request", "queue"], ["Bulk CSV Import"]],
};

// Request-type-specific page titles for the manual create/review flow,
// replacing the previous flat "Build Manually" title. Keys are the same
// requestType identifiers already used everywhere else (RequestTypeSelector,
// STEPS_BY_TYPE, REQUEST_TYPE_LABELS, createRequest) — no new identifiers
// introduced. Falls back to a generic title in the rare case this view is
// reached without a type yet selected (ManualRequestWizard's own in-page
// fallback gate — see initialManualRequestType's doc comment below).
const MANUAL_TITLE_BY_TYPE = {
  vizId: "New Request : VizID change",
  brandRequest: "New Request : Brand request",
  innovation: "New Request : Innovation - flow A",
};

/**
 * App — view state machine (no router; this is still a static prototype).
 * Holds the in-memory "requests database" so requests created by either
 * wizard immediately show up back in the Queue.
 *
 * queue -> (New Request opens CreateRequestLauncher modal) -> manual | bulk
 *   -> (create) -> back to queue
 *
 * The old separate "entry" page (NewRequestEntry) has been replaced by the
 * CreateRequestLauncher modal, which now also collects Manual's Request
 * Type up front (Manual creates exactly one request, so the type can't be
 * deferred). Bulk CSV never asks for a request type here — each CSV row
 * carries its own Request_Type column, so Bulk goes straight to
 * BulkCsvWizard once "Bulk CSV import" is chosen.
 */
export default function App() {
  // Isolated Product Selection demo short-circuits before any of the full
  // prototype's state/hooks are set up — the existing queue/manual/bulk
  // view machine below is completely untouched for "/".
  if (isProductSelectionDemo) {
    return <ProductSelectionDemo onNavigateHome={() => { window.location.href = "/"; }} />;
  }

  const [view, setView] = useState("queue");
  const [requests, setRequests] = useState(mockRequests);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [initialManualRequestType, setInitialManualRequestType] = useState(null);

  // Lightweight client-side "router" state — just the current pathname,
  // initialized from the real URL so a direct load / refresh of
  // "/request/:id" still works exactly as before. `navigate` pushes a new
  // history entry (so the address bar and Back/Forward both behave
  // correctly) and updates this state directly, without ever calling
  // location.reload() or location.href — no full page reload, so
  // `requests`/`view`/etc. above are never reset by an in-app navigation.
  const [currentPath, setCurrentPath] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (path) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, "", path);
    }
    setCurrentPath(path);
  };

  // Edit MVP — replaces the matching request in place (by id), preserving
  // array order and never mutating the previous array (map returns a new
  // one) or appending a duplicate. Navigates to the plain Detail route
  // afterward so the updated Detail page renders immediately from the
  // freshly replaced request in this same `requests` state.
  const handleUpdateRequest = (updatedRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === updatedRequest.id ? updatedRequest : r)));
    navigate(`/request/${updatedRequest.id}`);
  };

  // Edit route — checked before the plain Detail route below (though, per
  // the regex comment above, the two patterns never actually overlap).
  // Looks up the same in-memory `requests` array; three possible outcomes,
  // matching the READ MVP's own found/not-found handling plus one new
  // editability guard:
  //  - unknown id -> RequestNotFound (same component the Detail route uses)
  //  - known id but no longer editable -> a protected, read-only state —
  //    the wizard is never rendered for a read-only request, so there is
  //    no way to reach a mutation control for one via a direct URL either
  //  - known id and editable -> ManualRequestWizard, hydrated from it
  const requestEditMatch = currentPath.match(REQUEST_EDIT_PATH);
  const isRequestEditRoute = Boolean(requestEditMatch);
  const requestEditId = requestEditMatch ? decodeURIComponent(requestEditMatch[1]) : null;

  if (isRequestEditRoute) {
    const matchedRequest = requests.find((r) => r.id === requestEditId) ?? null;

    if (!matchedRequest) {
      return <RequestNotFound requestId={requestEditId} onNavigate={navigate} />;
    }

    if (!isRequestEditable(matchedRequest)) {
      return (
        <AppShell showSectionTabs={false}>
          <main className="max-w-screen-xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-3">
            <h1 className="text-xl font-bold text-base-content">This request is read-only</h1>
            <p className="text-sm text-base-content/60 max-w-md">
              "{matchedRequest.title || "Untitled request"}" can no longer be edited — every
              effective launch date has already passed.
            </p>
            <a
              href={`/request/${matchedRequest.id}`}
              onClick={(e) => handleInternalNavClick(e, `/request/${matchedRequest.id}`, navigate)}
              className="btn btn-outline mt-2"
            >
              Back to request
            </a>
          </main>
        </AppShell>
      );
    }

    return (
      <AppShell showSectionTabs={false}>
        <main className="max-w-screen-xl mx-auto px-6 py-8">
          <a
            href={`/request/${matchedRequest.id}`}
            onClick={(e) => handleInternalNavClick(e, `/request/${matchedRequest.id}`, navigate)}
            className="flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content w-fit mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to request
          </a>
          <h1 className="text-xl font-bold text-base-content mb-6">
            {editPageTitle(matchedRequest.requestType)}
          </h1>
          <ManualRequestWizard
            mode="edit"
            initialRequestData={matchedRequest}
            onUpdateRequest={handleUpdateRequest}
            onCancel={() => navigate(`/request/${matchedRequest.id}`)}
          />
        </main>
      </AppShell>
    );
  }

  // Request Detail (READ MVP) — matched from reactive `currentPath` (not
  // the module-level, load-time-only pattern isProductSelectionDemo still
  // uses above, since that route is never entered via in-app navigation).
  // Looks up by id in the same in-memory array the Queue/wizards already
  // share; a miss (unknown id) or a route that didn't parse to an id at
  // all both render RequestDetail's own not-found state rather than
  // crashing or falling through to the queue.
  const requestDetailMatch = currentPath.match(REQUEST_DETAIL_PATH);
  const isRequestDetailRoute = Boolean(requestDetailMatch);
  const requestDetailId = requestDetailMatch ? decodeURIComponent(requestDetailMatch[1]) : null;

  if (isRequestDetailRoute) {
    const matchedRequest = requests.find((r) => r.id === requestDetailId) ?? null;
    return <RequestDetail request={matchedRequest} requestId={requestDetailId} onNavigate={navigate} />;
  }

  const goTo = (v) => setView(v);

  const handleRequestCreated = (request) => {
    setRequests((prev) => [request, ...prev]);
    setView("queue");
  };

  const handleRequestsCreated = (newRequests) => {
    setRequests((prev) => [...newRequests, ...prev]);
    setView("queue");
  };

  const handleLauncherContinue = (method, requestType) => {
    if (method === "manual") {
      setInitialManualRequestType(requestType);
      setView("manual");
    } else {
      setInitialManualRequestType(null);
      setView("bulk");
    }
    setIsCreateModalOpen(false);
  };

  const crumbs = BREADCRUMB_BY_VIEW[view];

  return (
    <div data-theme="corporate" className="min-h-screen bg-base-200 text-base-content">
      {/* AppShell adds presentation chrome only (nav rail / module header /
          section tabs) around the existing breadcrumb + view content below.
          Nothing inside <main> changes shape, width, or behavior.
          showSectionTabs is false only for the manual create/review flow —
          Queue and Bulk keep the module tabs row exactly as before. */}
      <AppShell showSectionTabs={view !== "manual"}>
        <main className={view === "queue" ? "w-full px-6 py-8" : "max-w-screen-xl mx-auto px-6 py-8"}>
          {/* Breadcrumb is intentionally not rendered for the Home/Queue
              view (per Figma) — it's the root screen, nothing to trace
              back through. Manual/Bulk/internal flows keep their full
              breadcrumb + back-arrow, unchanged. */}
          {view !== "queue" && (
            <div className="flex items-center gap-1.5 text-sm text-base-content/60 mb-6">
              <button type="button" className="mr-0.5" onClick={() => goTo("queue")} aria-label="Back">
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              {crumbs.map(([label, target], i) => (
                <span key={label} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRightIcon className="w-3.5 h-3.5" />}
                  {target ? (
                    <button type="button" className="hover:text-base-content" onClick={() => goTo(target)}>
                      {label}
                    </button>
                  ) : (
                    <span className="text-base-content font-medium">{label}</span>
                  )}
                </span>
              ))}
            </div>
          )}

          {view === "queue" && (
            <>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-xl font-bold text-base-content">Content Request Queue</h1>
                  <p className="text-sm text-base-content/60 mt-1">
                    Brand, innovation, and VizID requests across retailers
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant="outline"
                    icon={CalendarDaysIcon}
                    iconPosition="leading"
                    iconClassName="w-5 h-5"
                  >
                    Calendar View
                  </Button>
                  <Button icon={PlusIcon} iconPosition="leading" onClick={() => setIsCreateModalOpen(true)}>
                    New Request
                  </Button>
                </div>
              </div>
              <ContentRequestQueue requests={requests} onNavigate={navigate} />
            </>
          )}

          {view === "manual" && (
            <>
              <h1 className="text-xl font-bold text-base-content mb-6">
                {MANUAL_TITLE_BY_TYPE[initialManualRequestType] ?? "New Request"}
              </h1>
              <ManualRequestWizard
                initialRequestType={initialManualRequestType}
                onCreateRequest={handleRequestCreated}
                onCancel={() => goTo("queue")}
              />
            </>
          )}

          {view === "bulk" && (
            <>
              <h1 className="text-xl font-bold text-base-content mb-6">Bulk CSV Import</h1>
              <BulkCsvWizard onRequestsCreated={handleRequestsCreated} onCancel={() => goTo("queue")} />
            </>
          )}
        </main>
      </AppShell>

      {isCreateModalOpen && (
        <CreateRequestLauncher
          onCancel={() => setIsCreateModalOpen(false)}
          onContinue={handleLauncherContinue}
        />
      )}
    </div>
  );
}
