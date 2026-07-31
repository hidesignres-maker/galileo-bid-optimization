import { Card } from "../ui/Card";
import { fmtDate } from "../../lib/format";

/**
 * RequestHistory — reusable, display-only History panel (Part F).
 *
 * `events` — plain array of { id, actor, description, at }, already merged
 * by the caller (RequestDetail) from two sources: optional seeded entries
 * (src/data/mockActivity.js) and events generated at runtime by App.jsx's
 * handlers (Save changes, Assignee change, Archive, Add comment — see
 * lib/requestHistory.js). This component has no opinion about where an
 * event came from; it only renders them in the order given, oldest first,
 * matching how App.jsx appends new events to the end of each request's
 * list.
 *
 * Rendered as an ordered list (`<ol>`) since sequence is meaningful here —
 * a real chronological record, not an unordered set of facts.
 */
export function RequestHistory({ events = [] }) {
  return (
    <Card title="History">
      {events.length === 0 ? (
        <p className="text-sm text-base-content/40 italic">No history recorded yet.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {events.map((event) => (
            <li key={event.id} className="border-l-2 border-base-300 pl-3">
              <p className="text-sm text-base-content">{event.description}</p>
              <p className="text-xs text-base-content/40 mt-0.5">
                {event.actor} · {fmtDate(event.at)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
