import { Tab } from "../ui/Tab";
import { RequestCommentsBody } from "./RequestComments";
import { RequestHistoryBody } from "./RequestHistory";

/**
 * RequestConversationPanel — combined Comments/History right-rail surface
 * (Corrected Approved Scope, Aug 2026: "Comments/History share one panel").
 *
 * Replaces the two separate `RequestComments`/`RequestHistory` cards
 * previously stacked in Request Detail's right rail with one card that
 * tab-switches between the exact same two bodies (`RequestCommentsBody`/
 * `RequestHistoryBody`, extracted from those same components without
 * changing a line of their internal logic — see each file's own doc
 * comment). No history event migration, no new fields on comments or
 * history events, no change to how either is stored in App.jsx — this is
 * a presentational merge of two existing surfaces, not a new data model.
 *
 * `activeTab` ("comments" | "history") / `onTabChange` — controlled from
 * the parent (Request Detail) rather than local state, so the header's
 * "View full history" More-menu action can switch this panel to the
 * History tab from outside it.
 *
 * Reuses the shared `Tab` primitive (ui/Tab.jsx) for the tab strip — the
 * same underline-tab visual already used by the module nav / Queue status
 * tabs / Product Selection tabs — rather than inventing a new tab look.
 * Card's own `title`/`actions` header slot doesn't fit a tab-strip header,
 * so this hand-builds the same `bg-base-100 border border-base-300
 * shadow-sm` card shell Card.jsx itself uses, exactly like
 * RetailerGroupPanel already does for its own custom interactive header.
 */
export function RequestConversationPanel({
  activeTab,
  onTabChange,
  comments = [],
  onAddComment,
  history = [],
}) {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="flex items-center gap-1 border-b border-base-300 px-4" role="tablist" aria-label="Comments and history">
        <Tab
          role="tab"
          aria-selected={activeTab === "comments"}
          active={activeTab === "comments"}
          onClick={() => onTabChange("comments")}
        >
          {`Comments${comments.length ? ` (${comments.length})` : ""}`}
        </Tab>
        <Tab
          role="tab"
          aria-selected={activeTab === "history"}
          active={activeTab === "history"}
          onClick={() => onTabChange("history")}
        >
          History
        </Tab>
      </div>
      <div className="card-body p-4">
        {activeTab === "history" ? (
          <RequestHistoryBody events={history} />
        ) : (
          <RequestCommentsBody comments={comments} onAddComment={onAddComment} />
        )}
      </div>
    </div>
  );
}
