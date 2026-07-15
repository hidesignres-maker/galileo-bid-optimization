import { useState } from "react";
import { ArrowLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ContentRequestQueue } from "./pages/ContentRequestQueue";
import { ManualRequestWizard } from "./pages/ManualRequestWizard";
import { BulkCsvWizard } from "./pages/BulkCsvWizard";
import { CreateRequestLauncher } from "./components/CreateRequestLauncher";
import { mockRequests } from "./data/mockRequests";

const BREADCRUMB_BY_VIEW = {
  queue: [["Content Request Queue"]],
  manual: [["Content Request", "queue"], ["New Request", "queue"], ["Build Manually"]],
  bulk: [["Content Request", "queue"], ["New Request", "queue"], ["Bulk CSV Import"]],
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
  const [view, setView] = useState("queue");
  const [requests, setRequests] = useState(mockRequests);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [initialManualRequestType, setInitialManualRequestType] = useState(null);

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
    <div data-theme="corporate" className="min-h-screen bg-base-200 font-sans text-base-content">
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex items-center gap-1.5 text-sm text-base-content/60 mb-4">
          {view !== "queue" && (
            <button
              type="button"
              className="mr-0.5"
              onClick={() => goTo("queue")}
              aria-label="Back"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
          )}
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

        {view === "queue" && (
          <>
            <h1 className="text-2xl font-bold text-base-content mb-6">Content Request Queue</h1>
            <ContentRequestQueue requests={requests} onNewRequest={() => setIsCreateModalOpen(true)} />
          </>
        )}

        {view === "manual" && (
          <>
            <h1 className="text-2xl font-bold text-base-content mb-6">Build Manually</h1>
            <ManualRequestWizard
              initialRequestType={initialManualRequestType}
              onCreateRequest={handleRequestCreated}
              onCancel={() => goTo("queue")}
            />
          </>
        )}

        {view === "bulk" && (
          <>
            <h1 className="text-2xl font-bold text-base-content mb-6">Bulk CSV Import</h1>
            <BulkCsvWizard onRequestsCreated={handleRequestsCreated} onCancel={() => goTo("queue")} />
          </>
        )}
      </main>

      {isCreateModalOpen && (
        <CreateRequestLauncher
          onCancel={() => setIsCreateModalOpen(false)}
          onContinue={handleLauncherContinue}
        />
      )}
    </div>
  );
}
