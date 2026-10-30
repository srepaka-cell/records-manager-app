import { useEffect, useRef, useState } from 'react';
import { auditTrailCsv, csvDocument, METADATA_BY_FILE, metadataHistoryCsv, policyLabel, recordPolicyIds, type DashboardRecord } from './data';
import { formatDate, formatDisposition } from './format';

type RecordInventoryProps = {
  files: DashboardRecord[];
};

const PAGE_SIZES = [5, 10, 25];

export function RecordInventory({ files }: RecordInventoryProps) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [auditNote, setAuditNote] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [recordType, setRecordType] = useState('');
  const [recordGroup, setRecordGroup] = useState('');
  const [retentionPolicy, setRetentionPolicy] = useState('');
  const [declarationFrom, setDeclarationFrom] = useState(arrivalFilters.declaredFrom);
  const [declarationTo, setDeclarationTo] = useState(arrivalFilters.declaredTo);
  const [dispositionFrom, setDispositionFrom] = useState('');
  const [dispositionTo, setDispositionTo] = useState('');
  const selectAllRef = useRef<HTMLInputElement>(null);
  const open = files.find((file) => file.id === openId) ?? null;
  const typeOptions: string[] = [...new Set(files.map((file) => file.recordType))].sort();
  const groupOptions = [...new Set(files.map((file) => file.recordGroup ?? 'Finance'))].sort();
  const policyOptions = retentionOptions(files);
  const activeType = typeOptions.includes(recordType) ? recordType : '';
  const activeGroup = groupOptions.includes(recordGroup) ? recordGroup : '';
  const activePolicy = policyOptions.includes(retentionPolicy) ? retentionPolicy : '';
  const activeDeclarationFrom = isoDate(declarationFrom);
  const activeDeclarationTo = isoDate(declarationTo);
  const activeFrom = isoDate(dispositionFrom);
  const activeTo = isoDate(dispositionTo);
  const rows = files
    .filter((file) =>
      matchesFilters(file, activeType, activeGroup, activePolicy, activeDeclarationFrom, activeDeclarationTo, activeFrom, activeTo),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  const pageIds = pageRows.map((file) => file.id);
  const selectedRows = rows.filter((file) => selected.includes(file.id));
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const rangeStart = rows.length === 0 ? 0 : start + 1;
  const rangeEnd = start + pageRows.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = pageIds.some((id) => selected.includes(id)) && !allPageSelected;
    }
  }, [allPageSelected, pageIds, selected]);

  const toggle = (fileId: number) => {
    setAuditNote('');
    setSelected((current) => (current.includes(fileId) ? current.filter((id) => id !== fileId) : [...current, fileId]));
  };

  const toggleAll = () => {
    setAuditNote('');
    setSelected((current) =>
      allPageSelected ? current.filter((id) => !pageIds.includes(id)) : [...new Set([...current, ...pageIds])],
    );
  };

  const downloadAuditTrail = () => {
    const blob = new Blob([auditTrailCsv(selectedRows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'audit-trail.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    const count = selectedRows.length;
    setAuditNote(`Downloaded audit-trail.csv for ${count} ${count === 1 ? 'record' : 'records'}.`);
  };

  const downloadTable = () => {
    const header = ['name', 'record_type', 'record_group', 'last_updated', 'declaration_date', 'retention_policy', 'disposition_date', 'file_owner'];
    const body = rows.map((file) => [
      file.name,
      file.recordType,
      file.recordGroup ?? 'Finance',
      formatDate(file.lastUpdatedUtc),
      formatDate(file.declaredUtc),
      policyLabel(recordPolicyIds(file)),
      formatDisposition(file.dispositionUtc, file.dispositionText),
      file.owner ?? '—',
    ]);
    const blob = new Blob([csvDocument(header, body)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'records.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    const count = rows.length;
    setAuditNote(`Downloaded records.csv for ${count} ${count === 1 ? 'record' : 'records'}.`);
  };

  return (
    <section className="inventory" id="records" aria-labelledby="inventory-heading">
      <h2 id="inventory-heading" className="dash-heading">
        Records
      </h2>
      <div className="filters">
        <FilterSelect
          label="Record type"
          value={activeType}
          targetId="RecordInventory-filterRecordType"
          options={typeOptions.map((type) => ({ value: type, label: type }))}
          onChange={(value) => {
            setRecordType(typeOptions.includes(value) ? value : '');
            setPage(0);
            setAuditNote('');
          }}
        />
        <FilterSelect
          label="Record group"
          value={activeGroup}
          targetId="RecordInventory-filterRecordGroup"
          options={groupOptions.map((group) => ({ value: group, label: group }))}
          onChange={(value) => {
            setRecordGroup(groupOptions.includes(value) ? value : '');
            setPage(0);
            setAuditNote('');
          }}
        />
        <FilterSelect
          label="Retention policy"
          value={activePolicy}
          targetId="RecordInventory-filterRetentionPolicy"
          options={policyOptions.map((policy) => ({ value: policy, label: policy }))}
          onChange={(value) => {
            setRetentionPolicy(policyOptions.includes(value) ? value : '');
            setPage(0);
            setAuditNote('');
          }}
        />
        <fieldset className="date-range">
          <legend>Declaration date</legend>
          <label htmlFor="RecordInventory-filterDeclarationFrom">
            From
            <input
              id="RecordInventory-filterDeclarationFrom"
              type="date"
              value={activeDeclarationFrom}
              data-target-id="RecordInventory-filterDeclarationFrom"
              onChange={(event) => {
                setDeclarationFrom(isoDate(event.target.value));
                setPage(0);
                setAuditNote('');
              }}
            />
          </label>
          <label htmlFor="RecordInventory-filterDeclarationTo">
            To
            <input
              id="RecordInventory-filterDeclarationTo"
              type="date"
              value={activeDeclarationTo}
              data-target-id="RecordInventory-filterDeclarationTo"
              onChange={(event) => {
                setDeclarationTo(isoDate(event.target.value));
                setPage(0);
                setAuditNote('');
              }}
            />
          </label>
        </fieldset>
        <fieldset className="date-range">
          <legend>Disposition date</legend>
          <label htmlFor="RecordInventory-filterDispositionFrom">
            From
            <input
              id="RecordInventory-filterDispositionFrom"
              type="date"
              value={activeFrom}
              data-target-id="RecordInventory-filterDispositionFrom"
              onChange={(event) => {
                setDispositionFrom(isoDate(event.target.value));
                setPage(0);
                setAuditNote('');
              }}
            />
          </label>
          <label htmlFor="RecordInventory-filterDispositionTo">
            To
            <input
              id="RecordInventory-filterDispositionTo"
              type="date"
              value={activeTo}
              data-target-id="RecordInventory-filterDispositionTo"
              onChange={(event) => {
                setDispositionTo(isoDate(event.target.value));
                setPage(0);
                setAuditNote('');
              }}
            />
          </label>
        </fieldset>
      </div>
      <div className="audit-bar">
        <button
          type="button"
          disabled={selectedRows.length === 0}
          data-target-id="RecordInventory-downloadAuditTrail"
          onClick={downloadAuditTrail}
        >
          Download audit trail
        </button>
        <button type="button" data-target-id="RecordInventory-downloadTable" onClick={downloadTable}>
          Download table
        </button>
        <p className="meta">{auditNote || (selectedRows.length === 0 ? 'Select records to include.' : `${selectedRows.length} selected`)}</p>
      </div>
      <div className="table-wrap">
        <table>
          <caption className="sr-only">Declared records</caption>
          <thead>
            <tr>
              <th className="select-col" scope="col">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allPageSelected}
                  aria-label="Select all records on this page"
                  data-target-id="RecordInventory-selectAll"
                  onChange={toggleAll}
                />
              </th>
              <th scope="col">Name</th>
              <th scope="col">Record type</th>
              <th scope="col">Record group</th>
              <th scope="col">Last updated</th>
              <th scope="col">Declaration date</th>
              <th scope="col">Retention policy</th>
              <th scope="col">Disposition date</th>
              <th scope="col">File owner</th>
              <th scope="col">
                <span className="sr-only">View metadata</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={10}>No records match these filters.</td>
              </tr>
            ) : null}
            {pageRows.map((file) => (
              <tr key={file.id}>
                <td className="select-col">
                  <input
                    type="checkbox"
                    checked={selected.includes(file.id)}
                    aria-label={`Select ${file.name}`}
                    data-target-id={`RecordInventory-select-${file.id}`}
                    onChange={() => toggle(file.id)}
                  />
                </td>
                <td>{file.name}</td>
                <td>{file.recordType}</td>
                <td>{file.recordGroup ?? 'Finance'}</td>
                <td>{formatDate(file.lastUpdatedUtc)}</td>
                <td>{formatDate(file.declaredUtc)}</td>
                <td>{policyLabel(recordPolicyIds(file))}</td>
                <td>{formatDisposition(file.dispositionUtc, file.dispositionText)}</td>
                <td>{file.owner ?? '—'}</td>
                <td>
                  <button
                    type="button"
                    className="icon-button"
                    data-target-id={`RecordInventory-view-${file.id}`}
                    aria-label={`View metadata for ${file.name}`}
                    aria-expanded={openId === file.id}
                    onClick={() => setOpenId(file.id)}
                  >
                    <EyeIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav className="pager" aria-label="Records pages">
        <p className="meta">
          Showing {rangeStart}–{rangeEnd} of {rows.length}
        </p>
        <label className="page-size">
          Rows per page
          <select
            value={pageSize}
            data-target-id="RecordInventory-pageSize"
            onChange={(event) => {
              const next = Number(event.target.value);
              if (PAGE_SIZES.includes(next)) {
                setPageSize(next);
                setPage(0);
              }
            }}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          data-target-id="RecordInventory-previousPage"
          disabled={currentPage === 0}
          onClick={() => setPage(currentPage - 1)}
        >
          Previous
        </button>
        <p className="meta">
          Page {currentPage + 1} of {pageCount}
        </p>
        <button
          type="button"
          data-target-id="RecordInventory-nextPage"
          disabled={currentPage >= pageCount - 1}
          onClick={() => setPage(currentPage + 1)}
        >
          Next
        </button>
      </nav>
      {open ? <MetadataPanel key={open.id} file={open} onClose={() => setOpenId(null)} /> : null}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  targetId,
  options,
  onChange,
}: {
  label: string;
  value: string;
  targetId: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const fieldId = targetId;
  return (
    <label htmlFor={fieldId}>
      {label}
      <select id={fieldId} value={value} data-target-id={targetId} onChange={(event) => onChange(event.target.value)}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const arrivalFilters = readDeclarationFilters();

function readDeclarationFilters(): { declaredFrom: string; declaredTo: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    declaredFrom: isoDate(params.get('declaredFrom') ?? ''),
    declaredTo: isoDate(params.get('declaredTo') ?? ''),
  };
}

function retentionOptions(files: DashboardRecord[]): string[] {
  const names = new Set<string>();
  let includesNone = false;
  for (const file of files) {
    const ids = recordPolicyIds(file);
    if (ids.length === 0) includesNone = true;
    for (const id of ids) names.add(policyLabel([id]));
  }
  return [...(includesNone ? ['None'] : []), ...[...names].sort()];
}

function isoDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return '';
  return value;
}

function calendarDay(utc: number | null | undefined): string | null {
  if (utc == null || Number.isNaN(utc)) return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(utc));
}

function inDateRange(day: string | null, from: string, to: string): boolean {
  if (!from && !to) return true;
  if (!day) return false;
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

function matchesFilters(
  file: DashboardRecord,
  recordType: string,
  recordGroup: string,
  retentionPolicy: string,
  declarationFrom: string,
  declarationTo: string,
  dispositionFrom: string,
  dispositionTo: string,
): boolean {
  if (recordType && file.recordType !== recordType) return false;
  if (recordGroup && (file.recordGroup ?? 'Finance') !== recordGroup) return false;
  if (retentionPolicy) {
    const ids = recordPolicyIds(file);
    const names = ids.length === 0 ? ['None'] : ids.map((id) => policyLabel([id]));
    if (!names.includes(retentionPolicy)) return false;
  }
  if (!inDateRange(calendarDay(file.declaredUtc), declarationFrom, declarationTo)) return false;
  if (!inDateRange(calendarDay(file.dispositionUtc), dispositionFrom, dispositionTo)) return false;
  return true;
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function downloadMetadataHistory(fileId: number) {
  const blob = new Blob([metadataHistoryCsv(fileId)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `metadata-history-${fileId}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function MetadataPanel({ file, onClose }: { file: DashboardRecord; onClose: () => void }) {
  const templates = METADATA_BY_FILE[file.id] ?? [];
  const [downloaded, setDownloaded] = useState(false);

  return (
    <aside className="metadata-panel" aria-label="Metadata">
      <div className="metadata-heading">
        <h2>Metadata</h2>
        <button type="button" className="linkish" data-target-id="MetadataPanel-close" onClick={onClose}>
          Close
        </button>
      </div>
      <button
        type="button"
        className="metadata-download"
        data-target-id={`MetadataPanel-downloadHistory-${file.id}`}
        onClick={() => {
          downloadMetadataHistory(file.id);
          setDownloaded(true);
        }}
      >
        Download metadata history
      </button>
      {downloaded ? <p className="meta metadata-download-note">Downloaded metadata-history-{file.id}.csv</p> : null}
      {templates.length === 0 ? <p className="meta">No metadata templates are applied to this record.</p> : null}
      {templates.map((template) => (
        <article key={template.name} className="metadata-card">
          <h3>
            <span className="template-mark" aria-hidden="true" />
            {template.name}
          </h3>
          <dl>
            {template.attributes.map((attribute) => (
              <div key={attribute.label}>
                <dt>{attribute.label}</dt>
                <dd>{attribute.value}</dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </aside>
  );
}
