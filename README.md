# records-manager-app

Clickable prototype of the Records area in Governance, including disposition review and the Disposition evidence ledger. Finance record types Invoice and Contract are in scope. The clock is fixed at 2026-10-08 00:00 UTC.

This is a local React app for walking through the flow. It does not call Box APIs, and it is not production code.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually http://localhost:5173.

## Check

```bash
npm run check
npm run build
```

## Walkthrough

- Open a declared-record count. Due within 1 day is empty. Past due includes file 1004, which is still in trash.
- Undeclare a file. File 1002 keeps legal hold 9. A reason that is only spaces is rejected.
- Extend file 1004 to 2026-11-08 00:00 UTC. It leaves past due and appears in the 60-day and 90-day windows.
- Send a file to Avery Chen and Jordan Lee as a set or a sequence. Approve or reject it under Pending approvals. There is no destroy action.
- Open Disposition evidence. Read certificate C-101. Select batch J1 and export a UTF-8 CSV preview. The missing-certificate tile opens the file 1007 gap.
