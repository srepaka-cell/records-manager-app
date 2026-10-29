import type { RecordFile } from './membership';

function csvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function csvDocument(header: string[], rows: string[][]): string {
  const lines = [header, ...rows].map((row) => row.map(csvField).join(','));
  return `\uFEFF${lines.join('\n')}`;
}

export const SEED: RecordFile[] = [
  {
    id: 1001,
    name: 'Q3 Invoice.pdf',
    path: '/Finance/Invoices/Q3 Invoice.pdf',
    recordType: 'Invoice',
    retention: 'Under retention',
    hold: 'No legal hold',
    holdIds: [],
    dispositionUtc: Date.parse('2026-10-13T00:00:00Z'),
    policiesApplied: [45],
    policiesStay: [],
    declared: true,
    recordGroup: 'Finance',
    owner: 'Avery Chen',
    lastUpdatedUtc: Date.parse('2026-09-28T18:00:00Z'),
    declaredUtc: Date.parse('2024-02-01T16:00:00Z'),
  },
  {
    id: 1002,
    name: 'Vendor Contract Invoice.pdf',
    path: '/Finance/Invoices/Vendor Contract Invoice.pdf',
    recordType: 'Invoice',
    retention: 'Under retention',
    hold: 'On legal hold',
    holdIds: [9],
    dispositionUtc: Date.parse('2026-10-07T00:00:00Z'),
    policiesApplied: [46],
    policiesStay: [77],
    declared: true,
    recordGroup: 'Finance',
    owner: 'Jordan Lee',
    lastUpdatedUtc: Date.parse('2026-10-02T17:30:00Z'),
    declaredUtc: Date.parse('2023-11-12T16:00:00Z'),
  },
  {
    id: 1004,
    name: 'October close.pdf',
    path: '/Finance/Trash/October close.pdf',
    recordType: 'Invoice',
    retention: 'Under retention',
    hold: 'No legal hold',
    holdIds: [],
    dispositionUtc: Date.parse('2026-10-01T00:00:00Z'),
    policiesApplied: [45],
    policiesStay: [],
    inTrash: true,
    declared: true,
    recordGroup: 'Finance',
    owner: 'Avery Chen',
    lastUpdatedUtc: Date.parse('2026-10-01T20:00:00Z'),
    declaredUtc: Date.parse('2024-06-15T16:00:00Z'),
  },
  {
    id: 1005,
    name: 'Year-end packet.pdf',
    path: '/Finance/Invoices/Year-end packet.pdf',
    recordType: 'Invoice',
    retention: 'Under retention',
    hold: 'No legal hold',
    holdIds: [],
    dispositionUtc: Date.parse('2026-09-15T00:00:00Z'),
    policiesApplied: [45],
    policiesStay: [],
    jobRunning: true,
    declared: true,
    recordGroup: 'Finance',
    owner: 'Jordan Lee',
    lastUpdatedUtc: Date.parse('2026-09-20T15:00:00Z'),
    declaredUtc: Date.parse('2022-01-08T17:00:00Z'),
  },
  {
    id: 1006,
    name: 'Open contract.pdf',
    path: '/Finance/Contracts/Open contract.pdf',
    recordType: 'Contract',
    retention: 'Under retention',
    hold: 'No legal hold',
    holdIds: [],
    dispositionUtc: null,
    dispositionText: 'Not started',
    policiesApplied: [],
    policiesStay: [],
    declared: true,
    recordGroup: 'Finance',
    owner: 'Riley Patel',
    lastUpdatedUtc: Date.parse('2026-08-14T19:00:00Z'),
    declaredUtc: Date.parse('2025-03-03T17:00:00Z'),
  },
  {
    id: 1008,
    name: 'Unscheduled invoice.pdf',
    path: '/Finance/Invoices/Unscheduled invoice.pdf',
    recordType: 'Invoice',
    retention: 'No retention',
    hold: 'No legal hold',
    holdIds: [],
    dispositionUtc: null,
    policiesApplied: [],
    policiesStay: [],
    declared: true,
    recordGroup: 'Finance',
    owner: 'Avery Chen',
    lastUpdatedUtc: Date.parse('2026-07-01T16:00:00Z'),
    declaredUtc: Date.parse('2026-07-01T16:00:00Z'),
  },
  {
    id: 1007,
    name: 'Purged invoice 1007',
    path: 'Purged. The file is no longer in Box.',
    recordType: 'Invoice',
    retention: 'No retention',
    hold: 'No legal hold',
    holdIds: [],
    dispositionUtc: null,
    dispositionText: 'Purged without a certificate',
    policiesApplied: [],
    policiesStay: [],
    declared: false,
    purgedNoCert: true,
    recordGroup: 'Finance',
    owner: 'Jordan Lee',
    lastUpdatedUtc: Date.parse('2026-09-15T19:00:00Z'),
    declaredUtc: Date.parse('2021-05-20T16:00:00Z'),
  },
];

export const RECORD_TYPE_CATALOG = ['Invoice', 'Contract', 'Purchase Order', 'Expense Report', 'Board Minutes'] as const;

const POLICY_NAMES: Record<number, string> = {
  45: 'Finance Invoice Retention',
  46: 'Finance Contract Retention',
  77: 'Other retention',
};

export function policyLabel(ids: number[]): string {
  if (ids.length === 0) return 'None';
  return ids.map((id) => POLICY_NAMES[id] ?? `Policy ${id}`).join(', ');
}

export function recordPolicyIds(file: { policiesApplied: number[]; policiesStay: number[] }): number[] {
  return [...file.policiesApplied, ...file.policiesStay.filter((id) => !file.policiesApplied.includes(id))];
}

export type MetadataAttribute = { label: string; value: string };
export type MetadataTemplate = { name: string; attributes: MetadataAttribute[] };

export const METADATA_BY_FILE: Record<number, MetadataTemplate[]> = {
  1001: [
    {
      name: 'Vendor Invoice',
      attributes: [
        { label: 'Vendor name', value: 'Northwind Supplies' },
        { label: 'Invoice number', value: 'INV-2024-1184' },
        { label: 'Amount', value: '18420.00' },
        { label: 'Currency', value: 'USD' },
      ],
    },
    {
      name: 'Fiscal Period',
      attributes: [
        { label: 'Fiscal year', value: '2024' },
        { label: 'Quarter', value: 'Q3' },
        { label: 'Cost center', value: '410 Accounts Payable' },
      ],
    },
  ],
  1002: [
    {
      name: 'Vendor Invoice',
      attributes: [
        { label: 'Vendor name', value: 'Helios Partners' },
        { label: 'Invoice number', value: 'INV-2023-0441' },
        { label: 'Amount', value: '9600.00' },
        { label: 'Currency', value: 'USD' },
      ],
    },
    {
      name: 'Matter',
      attributes: [
        { label: 'Matter name', value: 'Helios contract dispute' },
        { label: 'Matter ID', value: 'LH-9' },
        { label: 'Outside counsel', value: 'Ortiz LLP' },
      ],
    },
  ],
  1004: [
    {
      name: 'Vendor Invoice',
      attributes: [
        { label: 'Vendor name', value: 'Northwind Supplies' },
        { label: 'Invoice number', value: 'INV-2024-2201' },
        { label: 'Amount', value: '412.55' },
        { label: 'Currency', value: 'USD' },
      ],
    },
  ],
  1005: [
    {
      name: 'Vendor Invoice',
      attributes: [
        { label: 'Vendor name', value: 'Northwind Supplies' },
        { label: 'Invoice number', value: 'INV-2022-0088' },
        { label: 'Amount', value: '27500.00' },
        { label: 'Currency', value: 'USD' },
      ],
    },
    {
      name: 'Vital Record',
      attributes: [
        { label: 'Series', value: 'Accounts payable' },
        { label: 'Vital record', value: 'No' },
      ],
    },
  ],
  1006: [
    {
      name: 'Contract Terms',
      attributes: [
        { label: 'Counterparty', value: 'Brightline LLC' },
        { label: 'Contract number', value: 'MSA-2025-017' },
        { label: 'Effective date', value: 'Mar 3, 2025' },
        { label: 'Auto renew', value: 'Yes' },
      ],
    },
  ],
  1008: [
    {
      name: 'Vendor Invoice',
      attributes: [
        { label: 'Vendor name', value: 'Cedar Office Supply' },
        { label: 'Invoice number', value: 'INV-2026-009' },
        { label: 'Amount', value: '250.00' },
        { label: 'Currency', value: 'USD' },
      ],
    },
  ],
};

export type MetadataHistoryEvent = {
  timeUtc: string;
  actor: string;
  template: string;
  attribute: string;
  operation: 'applied' | 'edited' | 'removed';
  previousValue: string;
  newValue: string;
};

export const METADATA_HISTORY: Record<number, MetadataHistoryEvent[]> = {
  1001: [
    { timeUtc: '2024-02-01T16:05:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Vendor name', operation: 'applied', previousValue: '', newValue: 'Northwind Supplies' },
    { timeUtc: '2024-02-01T16:05:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Invoice number', operation: 'applied', previousValue: '', newValue: 'INV-2024-1184' },
    { timeUtc: '2024-02-01T16:05:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Amount', operation: 'applied', previousValue: '', newValue: '17900.00' },
    { timeUtc: '2024-02-01T16:05:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Currency', operation: 'applied', previousValue: '', newValue: 'USD' },
    { timeUtc: '2024-02-01T16:06:00Z', actor: 'Avery Chen', template: 'Fiscal Period', attribute: 'Fiscal year', operation: 'applied', previousValue: '', newValue: '2024' },
    { timeUtc: '2024-02-01T16:06:00Z', actor: 'Avery Chen', template: 'Fiscal Period', attribute: 'Quarter', operation: 'applied', previousValue: '', newValue: 'Q3' },
    { timeUtc: '2024-02-01T16:06:00Z', actor: 'Avery Chen', template: 'Fiscal Period', attribute: 'Cost center', operation: 'applied', previousValue: '', newValue: '400 General' },
    { timeUtc: '2025-11-02T18:12:00Z', actor: 'Jordan Lee', template: 'Vendor Invoice', attribute: 'Amount', operation: 'edited', previousValue: '17900.00', newValue: '18420.00' },
    { timeUtc: '2026-01-14T21:00:00Z', actor: 'Riley Patel', template: 'Fiscal Period', attribute: 'Cost center', operation: 'edited', previousValue: '400 General', newValue: '410 Accounts Payable' },
  ],
  1002: [
    { timeUtc: '2023-11-12T16:10:00Z', actor: 'Jordan Lee', template: 'Vendor Invoice', attribute: 'Vendor name', operation: 'applied', previousValue: '', newValue: 'Helios Partners' },
    { timeUtc: '2023-11-12T16:10:00Z', actor: 'Jordan Lee', template: 'Vendor Invoice', attribute: 'Invoice number', operation: 'applied', previousValue: '', newValue: 'INV-2023-0441' },
    { timeUtc: '2023-11-12T16:10:00Z', actor: 'Jordan Lee', template: 'Vendor Invoice', attribute: 'Amount', operation: 'applied', previousValue: '', newValue: '9600.00' },
    { timeUtc: '2023-11-12T16:10:00Z', actor: 'Jordan Lee', template: 'Vendor Invoice', attribute: 'Currency', operation: 'applied', previousValue: '', newValue: 'USD' },
    { timeUtc: '2026-04-03T15:40:00Z', actor: 'Avery Chen', template: 'Matter', attribute: 'Matter name', operation: 'applied', previousValue: '', newValue: 'Helios contract dispute' },
    { timeUtc: '2026-04-03T15:40:00Z', actor: 'Avery Chen', template: 'Matter', attribute: 'Matter ID', operation: 'applied', previousValue: '', newValue: 'LH-9' },
    { timeUtc: '2026-04-03T15:40:00Z', actor: 'Avery Chen', template: 'Matter', attribute: 'Outside counsel', operation: 'applied', previousValue: '', newValue: 'Ortiz LLP' },
  ],
  1004: [
    { timeUtc: '2024-06-15T16:08:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Vendor name', operation: 'applied', previousValue: '', newValue: 'Northwind Supplies' },
    { timeUtc: '2024-06-15T16:08:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Invoice number', operation: 'applied', previousValue: '', newValue: 'INV-2024-2201' },
    { timeUtc: '2024-06-15T16:08:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Amount', operation: 'applied', previousValue: '', newValue: '390.00' },
    { timeUtc: '2024-06-15T16:08:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Currency', operation: 'applied', previousValue: '', newValue: 'USD' },
    { timeUtc: '2026-09-02T19:22:00Z', actor: 'Jordan Lee', template: 'Vendor Invoice', attribute: 'Amount', operation: 'edited', previousValue: '390.00', newValue: '412.55' },
  ],
  1005: [
    { timeUtc: '2022-01-08T17:12:00Z', actor: 'Jordan Lee', template: 'Vendor Invoice', attribute: 'Vendor name', operation: 'applied', previousValue: '', newValue: 'Northwind Supplies' },
    { timeUtc: '2022-01-08T17:12:00Z', actor: 'Jordan Lee', template: 'Vendor Invoice', attribute: 'Invoice number', operation: 'applied', previousValue: '', newValue: 'INV-2022-0088' },
    { timeUtc: '2022-01-08T17:12:00Z', actor: 'Jordan Lee', template: 'Vendor Invoice', attribute: 'Amount', operation: 'applied', previousValue: '', newValue: '27500.00' },
    { timeUtc: '2022-01-08T17:12:00Z', actor: 'Jordan Lee', template: 'Vendor Invoice', attribute: 'Currency', operation: 'applied', previousValue: '', newValue: 'USD' },
    { timeUtc: '2022-01-08T17:20:00Z', actor: 'Jordan Lee', template: 'Vital Record', attribute: 'Series', operation: 'applied', previousValue: '', newValue: 'Accounts payable' },
    { timeUtc: '2022-01-08T17:20:00Z', actor: 'Jordan Lee', template: 'Vital Record', attribute: 'Vital record', operation: 'applied', previousValue: '', newValue: 'Yes' },
    { timeUtc: '2025-06-11T20:05:00Z', actor: 'Avery Chen', template: 'Vital Record', attribute: 'Vital record', operation: 'edited', previousValue: 'Yes', newValue: 'No' },
  ],
  1006: [
    { timeUtc: '2025-03-03T17:15:00Z', actor: 'Riley Patel', template: 'Contract Terms', attribute: 'Counterparty', operation: 'applied', previousValue: '', newValue: 'Brightline LLC' },
    { timeUtc: '2025-03-03T17:15:00Z', actor: 'Riley Patel', template: 'Contract Terms', attribute: 'Contract number', operation: 'applied', previousValue: '', newValue: 'MSA-2025-017' },
    { timeUtc: '2025-03-03T17:15:00Z', actor: 'Riley Patel', template: 'Contract Terms', attribute: 'Effective date', operation: 'applied', previousValue: '', newValue: 'Mar 3, 2025' },
    { timeUtc: '2025-03-03T17:15:00Z', actor: 'Riley Patel', template: 'Contract Terms', attribute: 'Auto renew', operation: 'applied', previousValue: '', newValue: 'No' },
    { timeUtc: '2026-02-19T16:44:00Z', actor: 'Avery Chen', template: 'Contract Terms', attribute: 'Auto renew', operation: 'edited', previousValue: 'No', newValue: 'Yes' },
  ],
  1008: [
    { timeUtc: '2026-07-01T16:10:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Vendor name', operation: 'applied', previousValue: '', newValue: 'Cedar Office Supply' },
    { timeUtc: '2026-07-01T16:10:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Invoice number', operation: 'applied', previousValue: '', newValue: 'INV-2026-009' },
    { timeUtc: '2026-07-01T16:10:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Amount', operation: 'applied', previousValue: '', newValue: '250.00' },
    { timeUtc: '2026-07-01T16:10:00Z', actor: 'Avery Chen', template: 'Vendor Invoice', attribute: 'Currency', operation: 'applied', previousValue: '', newValue: 'USD' },
  ],
};

const METADATA_HISTORY_HEADER = ['time', 'actor', 'template', 'attribute', 'operation', 'previous_value', 'new_value'];

export type AuditEvent = {
  timeUtc: string;
  actor: string;
  event:
    | 'declared'
    | 'retention_policy_applied'
    | 'legal_hold_placed'
    | 'disposition_date_set'
    | 'moved_to_trash'
    | 'disposition_job_started';
  detail: string;
};

export const AUDIT_TRAIL: Record<number, AuditEvent[]> = {
  1001: [
    { timeUtc: '2024-02-01T16:00:00Z', actor: 'Avery Chen', event: 'declared', detail: 'Record type Invoice, record group Finance' },
    { timeUtc: '2024-02-01T16:01:00Z', actor: 'Avery Chen', event: 'retention_policy_applied', detail: 'Finance Invoice Retention' },
    { timeUtc: '2024-02-01T16:02:00Z', actor: 'Avery Chen', event: 'disposition_date_set', detail: '2026-10-13T00:00:00Z' },
  ],
  1002: [
    { timeUtc: '2023-11-12T16:00:00Z', actor: 'Jordan Lee', event: 'declared', detail: 'Record type Invoice, record group Finance' },
    { timeUtc: '2023-11-12T16:01:00Z', actor: 'Jordan Lee', event: 'retention_policy_applied', detail: 'Finance Contract Retention' },
    { timeUtc: '2023-11-12T16:02:00Z', actor: 'Jordan Lee', event: 'retention_policy_applied', detail: 'Other retention' },
    { timeUtc: '2024-08-19T15:30:00Z', actor: 'Avery Chen', event: 'legal_hold_placed', detail: 'Legal hold 9' },
    { timeUtc: '2023-11-12T16:03:00Z', actor: 'Jordan Lee', event: 'disposition_date_set', detail: '2026-10-07T00:00:00Z' },
  ],
  1004: [
    { timeUtc: '2024-06-15T16:00:00Z', actor: 'Avery Chen', event: 'declared', detail: 'Record type Invoice, record group Finance' },
    { timeUtc: '2024-06-15T16:01:00Z', actor: 'Avery Chen', event: 'retention_policy_applied', detail: 'Finance Invoice Retention' },
    { timeUtc: '2024-06-15T16:02:00Z', actor: 'Avery Chen', event: 'disposition_date_set', detail: '2026-10-01T00:00:00Z' },
    { timeUtc: '2026-10-01T20:00:00Z', actor: 'Avery Chen', event: 'moved_to_trash', detail: '/Finance/Trash/October close.pdf' },
  ],
  1005: [
    { timeUtc: '2022-01-08T17:00:00Z', actor: 'Jordan Lee', event: 'declared', detail: 'Record type Invoice, record group Finance' },
    { timeUtc: '2022-01-08T17:01:00Z', actor: 'Jordan Lee', event: 'retention_policy_applied', detail: 'Finance Invoice Retention' },
    { timeUtc: '2022-01-08T17:02:00Z', actor: 'Jordan Lee', event: 'disposition_date_set', detail: '2026-09-15T00:00:00Z' },
    { timeUtc: '2026-09-15T00:05:00Z', actor: 'System', event: 'disposition_job_started', detail: 'Disposition job still running' },
  ],
  1006: [
    { timeUtc: '2025-03-03T17:00:00Z', actor: 'Riley Patel', event: 'declared', detail: 'Record type Contract, record group Finance' },
  ],
  1008: [
    { timeUtc: '2026-07-01T16:00:00Z', actor: 'Avery Chen', event: 'declared', detail: 'Record type Invoice, record group Finance' },
  ],
};

const AUDIT_HEADER = ['file_id', 'file_name', 'time', 'actor', 'event', 'detail'];

export function auditTrailCsv(files: Array<{ id: number; name: string }>): string {
  const events = files.flatMap((file) =>
    (AUDIT_TRAIL[file.id] ?? []).map((event) => ({
      fileId: file.id,
      fileName: file.name,
      ...event,
    })),
  );
  events.sort((a, b) => a.timeUtc.localeCompare(b.timeUtc) || a.fileId - b.fileId || a.event.localeCompare(b.event));
  const body = events.map((event) =>
    [String(event.fileId), event.fileName, event.timeUtc, event.actor, event.event, event.detail].map(csvField).join(','),
  );
  return `\uFEFF${[AUDIT_HEADER.join(','), ...body].join('\n')}`;
}

export function metadataHistoryCsv(fileId: number): string {
  const events = (METADATA_HISTORY[fileId] ?? []).slice().sort((a, b) => a.timeUtc.localeCompare(b.timeUtc));
  const body = events.map((event) =>
    [event.timeUtc, event.actor, event.template, event.attribute, event.operation, event.previousValue, event.newValue]
      .map(csvField)
      .join(','),
  );
  return `\uFEFF${[METADATA_HISTORY_HEADER.join(','), ...body].join('\n')}`;
}

export type ApproverOption = {
  id: string;
  name: string;
  canSee: Array<'Invoice' | 'Contract'>;
};

export const APPROVER_OPTIONS: ApproverOption[] = [
  { id: 'avery', name: 'Avery Chen', canSee: ['Invoice', 'Contract'] },
  { id: 'jordan', name: 'Jordan Lee', canSee: ['Invoice', 'Contract'] },
  { id: 'me', name: 'Myself (starter)', canSee: [] },
  { id: 'people', name: 'People records manager', canSee: [] },
];

export const NAMED_APPROVERS = APPROVER_OPTIONS.filter((person) => person.id === 'avery' || person.id === 'jordan');

export type Approval = {
  fileId: number;
  mode: 'set' | 'sequence';
  approverIds: string[];
  decisions: Record<string, 'pending' | 'approved' | 'rejected'>;
  status: 'open' | 'paused' | 'approved';
  rejectReason?: string;
};
