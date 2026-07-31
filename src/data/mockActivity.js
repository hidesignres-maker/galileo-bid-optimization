/**
 * mockActivity — seed Comments and History, kept entirely OUTSIDE the
 * Request object on purpose (per explicit product direction for this
 * functional expansion pass). Keyed by request id, composed into
 * RequestDetail via props from App.jsx — never nested inside a Request's
 * own payload, since nothing in createRequest()/buildUpdatedRequest()
 * forwards arbitrary extra keys, so anything nested on the Request itself
 * would silently vanish on the very next Save.
 *
 * Comment shape: { id, authorName, text, createdAt (ISO date string) }.
 * History shape: { id, actor, description, at (ISO date string) }.
 *
 * Both are optional per request — only a few seed requests get realistic
 * mock entries here, illustrating the two source types History combines
 * (seeded here + generated at runtime by App.jsx's handlers). Every other
 * request simply has no entry in these maps and renders each panel's own
 * empty state.
 */
export const mockCommentsByRequestId = {
  "REQ-2031": [
    {
      id: "CMT-2031-1",
      authorName: "Priya Nair",
      text: "Confirmed the Walmart reset date with the retail team — prioritizing that crop first per the brief.",
      createdAt: "2026-07-18",
    },
    {
      id: "CMT-2031-2",
      authorName: "Diego Alvarez",
      text: "Updated FOP file is attached. Target/Kroger crops queued next.",
      createdAt: "2026-07-22",
    },
  ],
  "REQ-2007": [
    {
      id: "CMT-2007-1",
      authorName: "Priya Nair",
      text: "Reset already ran at Sam's Club and Costco — flagging this for reassignment or closure.",
      createdAt: "2026-07-05",
    },
  ],
  "REQ-2028": [
    {
      id: "CMT-2028-1",
      authorName: "Mariana Perez",
      text: "Launch confirmed live across all three retailers. Closing out.",
      createdAt: "2026-06-16",
    },
  ],
};

export const mockHistoryByRequestId = {
  "REQ-2031": [
    { id: "HIST-2031-1", actor: "Priya Nair", description: "Request created", at: "2026-07-10" },
    { id: "HIST-2031-2", actor: "Priya Nair", description: "Status changed to In Progress", at: "2026-07-15" },
    { id: "HIST-2031-3", actor: "Priya Nair", description: "Comment added", at: "2026-07-18" },
    { id: "HIST-2031-4", actor: "Diego Alvarez", description: "Comment added", at: "2026-07-22" },
  ],
  "REQ-2007": [
    { id: "HIST-2007-1", actor: "Priya Nair", description: "Request created", at: "2026-06-01" },
    { id: "HIST-2007-2", actor: "Priya Nair", description: "Comment added", at: "2026-07-05" },
  ],
  "REQ-2028": [
    { id: "HIST-2028-1", actor: "Mariana Perez", description: "Request created", at: "2026-05-20" },
    { id: "HIST-2028-2", actor: "Mariana Perez", description: "Status changed to Completed", at: "2026-06-15" },
    { id: "HIST-2028-3", actor: "Mariana Perez", description: "Comment added", at: "2026-06-16" },
  ],
  "REQ-2030": [{ id: "HIST-2030-1", actor: "Diego Alvarez", description: "Request created", at: "2026-07-08" }],
};
