import { useState } from "react";
import { ArrowLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ContentRequestQueue } from "./pages/ContentRequestQueue";
import { NewRequestEntry } from "./pages/NewRequestEntry";
import { ManualRequestWizard } from "./pages/ManualRequestWizard";
import { BulkCsvWizard } from "./pages/BulkCsvWizard";
import { mockRequests } from "./data/mockRequests";

const BREADCRUMB_BY_VIEW = {
  queue: [["Content Request Queue"]],
  entry: [["Content Request", "queue"], ["New Request"]],
  manual: [["Content Request", "queue"], ["New Request", "entry"], ["Build Manually"]],
  bulk: [["Content Request", "queue"], ["New Request", "entry"], ["Bulk CSV Import"]],
};

/**
 * App — view state machine (no router; this is still a static prototype).
 * Holds the in-memory "requests database" so requests created by either
 * wizard immediately show up back in the Queue.
 *
 * queue -> entry -> manual | bulk -> (create) -> back to queue
 */
export default function App() {
  const [view, setView] = useState("queue");
  const [requests, setRequests] = useState(mockRequests);

  const goTo = (v) => setView(v);

  const handleRequestCreated = (request) => {
    setRequests((prev) => [request, ...prev]);
    setView("queue");
  };

  const handleRequestsCreated = (newRequests) => {
    setRequests((prev) => [...newRequests, ...prev]);
    setView("queue");
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
              onClick={() => goTo(view === "manual" || view === "bulk" ? "entry" : "queue")}
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
            <ContentRequestQueue requests={requests} onNewRequest={() => goTo("entry")} />
          </>
        )}

        {view === "entry" && (
          <>
            <h1 className="text-2xl font-bold text-base-content mb-6">New Request</h1>
            <NewRequestEntry
              onChooseMethod={(method) => goTo(method === "manual" ? "manual" : "bulk")}
              onCancel={() => goTo("queue")}
            />
          </>
        )}

        {view === "manual" && (
          <>
            <h1 className="text-2xl font-bold text-base-content mb-6">Build Manually</h1>
            <ManualRequestWizard onCreateRequest={handleRequestCreated} onCancel={() => goTo("queue")} />
          </>
        )}

        {view === "bulk" && (
          <>
            <h1 className="text-2xl font-bold text-base-content mb-6">Bulk CSV Import</h1>
            <BulkCsvWizard onRequestsCreated={handleRequestsCreated} onCancel={() => goTo("queue")} />
          </>
        )}
      </main>
    </div>
  );
}
