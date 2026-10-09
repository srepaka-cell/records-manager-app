export function isBlank(value: string): boolean {
  return value.replace(/[\s\u00a0\u3000\u2000-\u200b\ufeff]/g, '') === '';
}

export function formatDisposition(utc: number | null, text?: string): string {
  if (text) return text;
  if (utc == null) return 'No disposition time';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(new Date(utc));
}

export function parseUtcInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.endsWith('Z') ? trimmed : `${trimmed}Z`;
  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}
