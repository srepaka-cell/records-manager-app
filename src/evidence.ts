import type { RecordType } from './membership';

export type EvidenceStatus = 'sealed' | 'not_destroyed' | 'destroy_without_cod';

export type EvidenceRow = {
  jobId: string;
  certificateId: string | null;
  fileId: number;
  name: string;
  recordType: RecordType;
  group: 'Finance';
  channel: 'policy_purge' | null;
  destroyedAt: string | null;
  status: EvidenceStatus;
  statusText: string;
  versions?: string;
  policyId?: number;
  policyName?: string;
  legalHoldResult?: string;
  actor?: string;
  sha?: string;
  term?: string;
  createdAt?: string;
  declaredAt?: string;
  retentionExpiredAt?: string;
  tombstone?: string;
  seal?: string;
  generatedAt?: string;
  confirmToken?: string;
  enterpriseId?: string;
  approver?: string;
};

export const EVIDENCE: EvidenceRow[] = [
  {
    jobId: 'J1',
    certificateId: 'C-101',
    fileId: 2001,
    name: 'Q4-invoices.pdf',
    recordType: 'Invoice',
    group: 'Finance',
    channel: 'policy_purge',
    destroyedAt: '2026-09-15T12:00:00Z',
    status: 'sealed',
    statusText: 'Sealed',
    versions: 'v1, v2',
    policyId: 45,
    policyName: 'Finance Invoice Retention',
    legalHoldResult: 'none',
    actor: 'system',
    sha: '',
    term: '6 years from generation',
    createdAt: '2024-01-15T00:00:00Z',
    declaredAt: '2024-02-01T00:00:00Z',
    retentionExpiredAt: '2026-09-01T00:00:00Z',
    tombstone: 'Yes',
    seal: 'seal-j1',
    generatedAt: '2026-09-15T12:00:05Z',
    confirmToken: 'confirm-2001',
    enterpriseId: '111',
    approver: 'None',
  },
  {
    jobId: 'J1',
    certificateId: 'C-102',
    fileId: 2002,
    name: 'Vendor MSA.pdf',
    recordType: 'Contract',
    group: 'Finance',
    channel: 'policy_purge',
    destroyedAt: '2026-09-15T12:00:00Z',
    status: 'sealed',
    statusText: 'Sealed',
    versions: 'v1',
    policyId: 46,
    policyName: 'Finance Contract Retention',
    legalHoldResult: 'none',
    actor: 'system',
    sha: '',
    term: '6 years from generation',
    createdAt: '2023-06-01T00:00:00Z',
    declaredAt: '2023-06-15T00:00:00Z',
    retentionExpiredAt: '2026-09-01T00:00:00Z',
    tombstone: 'Yes',
    seal: 'seal-j1',
    generatedAt: '2026-09-15T12:00:05Z',
    confirmToken: 'confirm-2002',
    enterpriseId: '111',
    approver: 'None',
  },
  {
    jobId: 'J2',
    certificateId: 'C-201',
    fileId: 2003,
    name: 'Closed invoice.pdf',
    recordType: 'Invoice',
    group: 'Finance',
    channel: 'policy_purge',
    destroyedAt: '2026-09-20T00:00:00Z',
    status: 'sealed',
    statusText: 'Sealed',
    versions: 'v1',
    policyId: 45,
    policyName: 'Finance Invoice Retention',
    legalHoldResult: 'none',
    actor: 'system',
    sha: '',
    term: '6 years from generation',
    createdAt: '2024-03-01T00:00:00Z',
    declaredAt: '2024-03-02T00:00:00Z',
    retentionExpiredAt: '2026-09-10T00:00:00Z',
    tombstone: 'Yes',
    seal: 'seal-j2',
    generatedAt: '2026-09-20T00:00:05Z',
    confirmToken: 'confirm-2003',
    enterpriseId: '111',
    approver: 'None',
  },
  {
    jobId: 'J2',
    certificateId: null,
    fileId: 1002,
    name: 'Vendor Contract Invoice.pdf',
    recordType: 'Invoice',
    group: 'Finance',
    channel: null,
    destroyedAt: null,
    status: 'not_destroyed',
    statusText: 'Not destroyed — legal hold',
  },
  {
    jobId: 'J-GAP',
    certificateId: null,
    fileId: 1007,
    name: 'Purged invoice 1007',
    recordType: 'Invoice',
    group: 'Finance',
    channel: null,
    destroyedAt: null,
    status: 'destroy_without_cod',
    statusText: 'destroy_without_cod',
  },
];

export type EvidenceChip = 'Invoice' | 'Contract' | 'missing';

export function evidenceMatches(row: EvidenceRow, query: string, chips: EvidenceChip[]): boolean {
  const q = query.trim().toLowerCase();
  if (q) {
    const haystack = `${row.jobId} ${row.certificateId ?? ''} ${row.fileId} ${row.name}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (chips.length === 0) return true;
  const typeChips = chips.filter((chip) => chip === 'Invoice' || chip === 'Contract');
  const missing = chips.includes('missing');
  const typeOk = typeChips.length === 0 || typeChips.includes(row.recordType);
  const missingOk = !missing || row.status === 'destroy_without_cod';
  return typeOk && missingOk;
}

export function csvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function batchCsv(jobId: string): string {
  const lines = EVIDENCE.filter((row) => row.jobId === jobId && row.status === 'sealed');
  const header = ['file_id', 'name', 'record_type', 'channel', 'destroyed_at', 'policy_id', 'job_id'];
  const body = lines.map((row) =>
    [
      String(row.fileId),
      row.name,
      row.recordType,
      row.channel ?? '',
      row.destroyedAt ?? '',
      row.policyId == null ? '' : String(row.policyId),
      row.jobId,
    ]
      .map(csvField)
      .join(','),
  );
  return [header.join(','), ...body].join('\n');
}
