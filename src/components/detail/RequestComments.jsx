import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { fmtDate } from "../../lib/format";

/** Up to two initials from a display name, for the avatar-fallback circle. Never crashes on an empty/odd name — falls back to "?". */
function initialsFor(name) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * RequestComments — reusable Comments panel (Part E).
 *
 * `comments` — plain array of { id, authorName, text, createdAt }, owned
 * and persisted by App.jsx (keyed by request id, see App.jsx's `comments`
 * state and src/data/mockActivity.js for optional seed data). This
 * component itself holds no comment data in state — only the local
 * add-comment draft text — so comments persist across navigation within
 * the session exactly as long as App.jsx's own state does, and are lost on
 * a full reload along with the rest of that in-memory state (acceptable,
 * per instruction).
 *
 * `onAddComment(text)` — called with already-trimmed, non-empty text only;
 * this component itself enforces "blank comments cannot be submitted" and
 * clears its own draft field immediately after calling it (optimistic —
 * App.jsx is expected to synchronously append the new comment to `comments`
 * on every call, exactly like every other handler in this prototype).
 */
export function RequestComments({ comments = [], onAddComment }) {
  const [draft, setDraft] = useState("");
  const trimmed = draft.trim();
  const canSubmit = trimmed.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAddComment(trimmed);
    setDraft("");
  };

  return (
    <Card title="Comments">
      <div className="flex flex-col gap-4">
        {comments.length === 0 ? (
          <p className="text-sm text-base-content/40 italic">No comments yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full bg-base-200 border border-base-300 flex items-center justify-center text-xs font-semibold text-base-content/70 shrink-0"
                  aria-hidden="true"
                >
                  {initialsFor(c.authorName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-base-content">{c.authorName || "Unknown"}</span>
                    <span className="text-xs text-base-content/40">{fmtDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-base-content mt-0.5 whitespace-pre-wrap break-words">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2 border-t border-base-300 pt-3">
          <label htmlFor="new-comment-input" className="label-text text-xs font-semibold text-base-content/50">
            Add a comment
          </label>
          <textarea
            id="new-comment-input"
            className="textarea textarea-bordered w-full text-sm"
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Write a comment…"
          />
          <div className="flex justify-end">
            <Button size="sm" disabled={!canSubmit} onClick={handleSubmit} aria-label="Send comment">
              Send
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
