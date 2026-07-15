# Content Request Intake — Working Definition

> Working project definition based on evolving conversations with Gowri/Gary. This is not final PRD language yet; it captures the current understanding, assumptions, and open questions as the workflow is being shaped in real time.

---

## 1. Project framing

The project appears to be a **Content / Merchandising Request Intake system** inside Galileo.

The system is intended to replace or reduce dependency on external Monday.com forms by creating a structured intake and tracking experience for content-related requests.

The experience behaves less like a simple “product selection wizard” and more like a **task/request generator**, similar in concept to Monday or Jira:

- Marketing / Brand / Sales teams submit requests.
- The system creates one or more operational tasks.
- The content / merchandising operations team processes those tasks in a queue.
- Requests move through statuses such as Needs Action, In Progress, Shipped, On Hold, and Archive.

---

## 2. Updated mental model

### Previous assumption

The earlier working model was:

```text
One request contains many products/items.
```

Example:

```text
Create one Viz ID request
→ select 100 products
→ submit one request with 100 products inside
```

### New possible understanding

The emerging model may be:

```text
Manual = create one request/task.
Bulk = create many requests/tasks from CSV rows.
```

Example:

```text
Manual submission
→ one form
→ one request/task created
```

```text
Bulk CSV upload
→ 100 rows
→ 100 requests/tasks created
```

This is a major product logic shift and should be validated.

---

## 3. Primary creation paths

The new flow may begin with the user choosing the **creation method** first:

```text
New Request
  ↓
Choose creation method
  ├── Manual
  └── Bulk
```

Then the flow changes based on whether the user is creating one request manually or generating many requests from a CSV.

---

## 4. Manual path

### Definition

Manual means the user is creating **one request/task**.

```text
Manual = 1 submission = 1 request/task
```

### Possible flow

```text
New Request
  ↓
Choose Manual
  ↓
Select Request Type
  ├── Viz ID
  ├── Brand Request
  └── Innovation
  ↓
Complete request form
  ↓
Review
  ↓
Create Request
```

### Manual request form should include

The form should capture both the task metadata and the actual execution requirements.

Likely fields:

```text
Task name
Task description
Request type
Retailer / customer
Product or item details
Content requirements
Files / assets / links
Assignee, if applicable
Date fields
```

### Important correction

The form is not only metadata. It must also capture the **requirements for the work to be executed**, such as:

```text
Images
Video
Copy/text
URL/link
Files
Supporting documentation
```

This is important because the intake system is replacing Monday-style request forms, not just selecting products.

---

## 5. Bulk path

### Definition

Bulk means the user is generating multiple requests/tasks from a CSV.

Potential rule:

```text
Each CSV row = one request/task
```

This is a key change from the earlier assumption that a CSV imports many products into one request.

### Possible flow

```text
New Request
  ↓
Choose Bulk
  ↓
Upload CSV
  ↓
Review imported rows
  ↓
Create N Requests
```

### Critical open question

```text
Does each CSV row create one request/task, or does one CSV upload create one request containing many rows?
```

Current emerging understanding from Gary/Gowri conversation:

```text
Each row may be saved as its own request/task in the platform.
```

This needs confirmation.

---

## 6. Request types

The system supports three request types:

```text
Viz ID
Brand Request
Innovation
```

### A. Viz ID

Likely used for changes related to existing products, visual identifiers, packaging, imagery, or product content.

Earlier assumption:

```text
Viz ID uses existing product lookup.
```

Potential new interpretation:

```text
Viz ID can be created manually as one task, or in bulk as multiple tasks generated from CSV rows.
```

### B. Brand Request

Gowri prefers the label **Brand Request**, because this is how the team identifies the work.

Likely used for brand-requested content updates to existing products.

Earlier assumption:

```text
Brand Request uses a similar existing-product pattern as Viz ID.
```

Potential new interpretation:

```text
Brand Request manual = one brand-requested task.
Brand Request bulk = multiple brand-requested tasks from CSV rows.
```

### C. Innovation

Used for new item setup, new product launches, or eComm packs.

Innovation may require fields such as:

```text
UPC
Retailer
Customer ID
Product Title
Brand
Start Ship Date
On Sale Date
eComm Pack Details
```

Known Gowri feedback:

```text
Remove ID Type.
Move Retailer to the second column.
```

Recommended Innovation item order:

```text
UPC
Retailer
Customer ID
Product Title
Brand
Start Ship Date
On Sale Date
eComm Pack Details
```

---

## 7. Key change: assets and requirements belong in the form

A major missing piece in the earlier model:

The request form itself should allow the user to provide the content/material requirements, not only product selection.

Examples:

```text
Upload image
Upload video
Paste text/copy
Add content URL
Add supporting link
Attach file
```

This means the form should support both:

```text
What is the task?
```

and:

```text
What assets/instructions are needed to complete the task?
```

---

## 8. Impact on Step 3 / Retailers

The earlier flow included a shared Step 3:

```text
Retailers
```

But this may not apply equally to every flow.

### For Viz ID and Brand Request

The retailer step may still make sense if the system needs to confirm:

```text
Retailers
Launch date / due date per retailer
Retailer grouping
```

### For Innovation

Step 3 may become redundant if retailer/date fields are already captured in the Innovation form or row:

```text
Retailer
Customer ID
Start Ship Date
On Sale Date
```

Potential adjusted Innovation flow:

```text
Manual Innovation
  → Complete form / item setup
  → Review
  → Create Request
```

```text
Bulk Innovation
  → Upload CSV
  → Review rows
  → Create Requests
```

Open question:

```text
Should Innovation skip the Retailers step because retailer/date data is already captured in the item setup fields?
```

---

## 9. Design impact

### What changes significantly

The big change is request granularity:

```text
Old model:
One request contains many products/items.

New possible model:
Manual creates one request.
Bulk creates many requests.
```

This affects:

```text
Review copy
CSV success states
Table labels
Request count
Queue behavior
Request detail pages
```

### What can still be reused

Even if the logic changes, many UI pieces still apply:

```text
Request type selection
Manual vs bulk branching
CSV upload states
CSV review table
Request summary card
Review screen
Product/item tables
Status queue
Request detail shell
Comments
Assignee
History / audit trail placeholder
```

---

## 10. Revised review language

If bulk creates multiple requests, avoid copy like:

```text
100 products imported
```

Use:

```text
100 requests will be created
```

or:

```text
100 rows reviewed
100 tasks ready to create
```

If manual creates one task:

```text
Create Request
```

If bulk creates many tasks:

```text
Create Requests
```

---

## 11. Critical open questions

These should be validated with Gowri/Gary/Tanya before finalizing the prototype logic.

### Bulk behavior

```text
In Bulk CSV, does each row create a separate request/task?
Or does the upload create one request containing many rows?
```

### Request type in bulk

```text
For Bulk, is request type selected once for the entire upload?
Or does each CSV row include its own request type?
```

### Assets in bulk

```text
How are images, videos, files, and links attached in Bulk?
Are they:
- uploaded once for the whole batch?
- included as URLs per row in the CSV?
- attached after requests are created?
```

### Manual form structure

```text
For Manual, should the user choose Manual first, then select request type inside the form?
```

### Innovation retailer step

```text
Should Innovation skip the Retailers step if retailer/customer/date data is already captured in the item setup fields?
```

### Request detail

```text
After the request is created, should the detail page be pre-populated with all form/CSV data?
```

### CSV validation

```text
Is CSV validation all-or-nothing?
Can partial rows import?
If partial rows fail, does the user see which rows failed?
```

---

## 12. Current working hypothesis

Until confirmed, the safest working hypothesis is:

```text
The intake tool is a request/task generator.
Manual creates one request.
Bulk may create multiple requests from CSV rows.
Request type determines the form fields.
Content requirements/assets must be captured in the request form.
Innovation may not need a separate retailer step if retailer/date fields are already captured.
```

---

## 13. Suggested next design move

Before building more UI, document two possible architecture options and validate with Gowri/Gary:

### Option 1 — Request contains many rows

```text
One request
  → many products/items inside
```

Best for:

```text
Batch work
Shared description/instructions
Shared assignee
Shared status
```

Risk:

```text
Harder to track each product/item independently.
```

### Option 2 — Each row becomes a request

```text
Manual = one request
Bulk = many requests
```

Best for:

```text
Operational queue tracking
Independent ownership/status
Monday/Jira-like workflow
```

Risk:

```text
Bulk can generate many records.
Needs clear review and confirmation before creation.
```

Current conversation suggests Option 2 may be closer to Gary/Gowri’s intent.

---

## 14. Prototype note

The prototype should remain flexible because the workflow is being shaped in real time.

Recommended implementation approach:

```text
Keep the UI modular.
Separate request creation method from request type.
Use mocked local state.
Avoid backend assumptions.
Make request granularity configurable:
  - one request with many rows
  - many requests from many rows
```

This will allow the prototype to adapt quickly once Gowri/Gary confirms the intended behavior.
