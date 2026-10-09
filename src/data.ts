import type { RecordFile } from './membership';

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
  },
];

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
