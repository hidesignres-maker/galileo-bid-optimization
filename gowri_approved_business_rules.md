# Content Request Intake — Gowri-Approved Business Rules

_Last updated: July 15, 2026_

This document captures the latest business-rule updates approved by Gowri for the Content Request Intake prototype. These rules sit on top of the original PRD. They do not invalidate the PRD; they clarify and update the product architecture.

---

## 1. Manual vs Bulk is decided at the start

Before showing any request form, the user must choose how they want to create requests:

```text
Build manually
Bulk CSV import
```

This decision determines the flow structure.

---

## 2. Manual creates one request

```text
Manual = 1 request / task
```

When the user chooses **Build manually**, they complete a form and the system creates exactly one request.

---

## 3. Bulk creates multiple requests

```text
Bulk CSV = N rows → N requests / tasks
```

Each row in the uploaded CSV can become an independent request/task in the queue.

---

## 4. Bulk can mix request types

Bulk does **not** use one global request type for the whole upload.

Each CSV row defines its own request type using a column such as:

```text
Request_Type
```

Example:

| Row | Request Type |
|---:|---|
| 1 | Viz ID Change |
| 2 | Brand Request |
| 3 | Innovation |

---

## 5. Request Type is required for Manual

Because Manual creates a single request, the user must select one request type:

```text
Viz ID Change
Brand Request
Innovation
```

This selection determines the manual flow and fields shown.

---

## 6. Request Type is not selected globally for Bulk

For Bulk CSV, request type lives in the CSV row, not in the modal or form-level selection.

Recommended UI copy:

```text
Bulk CSV supports mixed request types. Each row defines its own request type using the Request_Type column.
```

---

## 7. Bulk has a separate stepper

Bulk CSV import should not use the manual request wizard.

Bulk flow:

```text
Download Template → Upload Template → Review → Confirm
```

---

## 8. Manual flows vary by request type

### Manual Viz ID Change

```text
Details → Products → Retailers → Review
```

### Manual Brand Request

```text
Details → Products → Retailers → Review
```

### Manual Innovation

```text
Details & Item Inputs → Review
```

---

## 9. Manual Innovation skips the Retailers step

Innovation captures retailer information inside the item inputs. Therefore, Innovation does not need the separate Retailers step.

Correct:

```text
Innovation → Review
```

Avoid:

```text
Innovation → Retailers → Review
```

---

## 10. Brand Request keeps its name

Use the label:

```text
Brand Request
```

Do not rename it to:

```text
Content Update
```

Reason: Gowri confirmed that **Brand Request** is how the team identifies this request type.

---

## 11. Bulk can create placeholder tasks

Bulk is used for workload planning from calendars or future planning files.

Some requests may be created as placeholders and completed later with:

```text
assignee
details
assets
images / videos / links
comments
```

This supports planning ahead before all execution details are known.

---

## 12. Queue / Calendar supports workload planning

The queue is not only a submission list. It should help managers and operators understand team workload.

It should support visibility into:

```text
In Progress
Due This Period
Completed
Needs Action
workload by date / month
future placeholder tasks
```

---

## 13. Create CTA reflects request count

Manual:

```text
Create Request
```

Bulk:

```text
Create Requests
Create N Requests
```

The CTA should communicate whether the action creates one request or multiple requests.

---

## 14. Relationship to original PRD

The original PRD remains useful for:

- request types
- required fields
- queue and status behavior
- comments, assignee, and status tracking
- replacing Monday.com forms

However, these rules update the flow architecture:

```text
Manual = one task
Bulk = many tasks
Bulk request type = per row
Innovation skips Retailers
```

---

## Current product model summary

```text
Content Request Queue
  ↓
Create Request launcher
  ├── Build manually
  │     ├── Viz ID Change → Details → Products → Retailers → Review → Create Request
  │     ├── Brand Request → Details → Products → Retailers → Review → Create Request
  │     └── Innovation → Details & Item Inputs → Review → Create Request
  │
  └── Bulk CSV import
        └── Download Template → Upload Template → Review rows → Confirm → Create N Requests
```

---

## Open questions to keep visible

1. Which fields are required per request type inside the mixed Bulk CSV template?
2. How are assets, links, images, and videos handled in Bulk: per row URL, batch-level upload, or later in detail view?
3. What fields are required for placeholder tasks?
4. Can bulk-created placeholder requests be edited later in request detail?
5. Does Bulk validation support partial success or is it all-or-nothing?
6. Should Start Ship Date be required only for AMZ?
7. Should eComm Pack Details be structured fields or one text field?

