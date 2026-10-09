export const NOW = Date.parse('2026-10-08T00:00:00.000Z');
const DAY = 86_400_000;

export type RecordType = 'Invoice' | 'Contract';

export type RecordFile = {
  id: number;
  name: string;
  path: string;
  recordType: RecordType;
  retention: 'Under retention' | 'No retention';
  hold: 'On legal hold' | 'No legal hold';
  holdIds: number[];
  dispositionUtc: number | null;
  dispositionText?: string;
  policiesApplied: number[];
  policiesStay: number[];
  inTrash?: boolean;
  jobRunning?: boolean;
  declared: boolean;
  purgedNoCert?: boolean;
};

export type TileKey =
  | 'total'
  | 'retention'
  | 'hold'
  | 'd1'
  | 'd7'
  | 'd30'
  | 'd60'
  | 'd90'
  | 'past'
  | 'disp'
  | 'purged';

export function dueWithin(file: RecordFile, days: number, now = NOW): boolean {
  if (!file.declared || file.purgedNoCert) return false;
  if (file.holdIds.length > 0 || file.jobRunning) return false;
  if (file.dispositionUtc == null) return false;
  const delta = file.dispositionUtc - now;
  return delta > 0 && delta <= days * DAY;
}

export function isPastDue(file: RecordFile, now = NOW): boolean {
  if (!file.declared || file.purgedNoCert) return false;
  if (file.holdIds.length > 0 || file.jobRunning) return false;
  if (file.dispositionUtc == null) return false;
  return file.dispositionUtc <= now;
}

export function isDispositionInProgress(file: RecordFile): boolean {
  return Boolean(file.declared && !file.purgedNoCert && file.jobRunning);
}

export function matchesTile(file: RecordFile, key: TileKey, now = NOW): boolean {
  switch (key) {
    case 'total':
      return file.declared && !file.purgedNoCert;
    case 'retention':
      return file.declared && !file.purgedNoCert && file.retention === 'Under retention';
    case 'hold':
      return file.declared && !file.purgedNoCert && file.holdIds.length > 0;
    case 'd1':
      return dueWithin(file, 1, now);
    case 'd7':
      return dueWithin(file, 7, now);
    case 'd30':
      return dueWithin(file, 30, now);
    case 'd60':
      return dueWithin(file, 60, now);
    case 'd90':
      return dueWithin(file, 90, now);
    case 'past':
      return isPastDue(file, now);
    case 'disp':
      return isDispositionInProgress(file);
    case 'purged':
      return Boolean(file.purgedNoCert);
    default:
      return false;
  }
}

export function canReviewDestruction(file: RecordFile, now = NOW): boolean {
  if (!file.declared || file.holdIds.length > 0 || file.jobRunning || file.purgedNoCert) return false;
  return isPastDue(file, now) || dueWithin(file, 90, now);
}

export const TILES: { key: TileKey; label: string; action: string }[] = [
  { key: 'total', label: 'Total declared records', action: 'openTotal' },
  { key: 'retention', label: 'Under retention', action: 'openRetention' },
  { key: 'hold', label: 'Under legal hold', action: 'openHold' },
  { key: 'd1', label: 'Due within 1 day', action: 'openDueWithin1Day' },
  { key: 'd7', label: 'Due within 7 days', action: 'openDueWithin7Days' },
  { key: 'd30', label: 'Due within 30 days', action: 'openDueWithin30Days' },
  { key: 'd60', label: 'Due within 60 days', action: 'openDueWithin60Days' },
  { key: 'd90', label: 'Due within 90 days', action: 'openDueWithin90Days' },
  { key: 'past', label: 'Past due and still in Box', action: 'openPastDue' },
  { key: 'disp', label: 'Disposition in progress', action: 'openDispositionInProgress' },
  { key: 'purged', label: 'Purged without a certificate', action: 'openPurgedWithoutCertificate' },
];
