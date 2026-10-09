import { useMemo, useState } from 'react';
import { EVIDENCE, batchCsv, evidenceMatches, type EvidenceChip, type EvidenceRow } from './evidence';
import { Dialog } from './Dialog';

type ExportJob = {
  id: string;
  preview: string;
};

type DispositionEvidenceProps = {
  onBack: () => void;
  onOpenCertificate: (certificateId: string) => void;
  onOpenFile: (fileId: number) => void;
  query: string;
  chips: EvidenceChip[];
  onQuery: (value: string) => void;
  onChips: (chips: EvidenceChip[]) => void;
};

const CHIP_OPTIONS: { id: EvidenceChip; label: string; action: string }[] = [
  { id: 'Invoice', label: 'Invoice', action: 'filterInvoice' },
  { id: 'Contract', label: 'Contract', action: 'filterContract' },
  { id: 'missing', label: 'Missing certificate', action: 'filterMissingCertificate' },
];

export function DispositionEvidence({
  onBack,
  onOpenCertificate,
  onOpenFile,
  query,
  chips,
  onQuery,
  onChips,
}: DispositionEvidenceProps) {
  const [sortDesc, setSortDesc] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [exportError, setExportError] = useState('');
  const [confirmJobs, setConfirmJobs] = useState<string[] | null>(null);
  const [notice, setNotice] = useState('');
  const [exports, setExports] = useState<ExportJob[]>([]);
  const [openPreview, setOpenPreview] = useState<string | null>(null);

  const rows = useMemo(() => {
    const matched = EVIDENCE.filter((row) => evidenceMatches(row, query, chips));
    return matched.slice().sort((a, b) => compareDestroyed(a, b, sortDesc));
  }, [query, chips, sortDesc]);

  const toggleChip = (chip: EvidenceChip) => {
    onChips(chips.includes(chip) ? chips.filter((item) => item !== chip) : [...chips, chip]);
  };

  const toggleJob = (jobId: string) => {
    setSelected((current) => (current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]));
    setExportError('');
  };

  const askExport = () => {
    if (selected.length === 0) {
      setExportError('Select at least one batch to export. No job was submitted.');
      return;
    }
    setExportError('');
    setConfirmJobs(selected);
  };

  const confirmExport = () => {
    if (!confirmJobs) return;
    const id = `EXP-${exports.length + 1}`;
    const preview = confirmJobs.map((jobId) => batchCsv(jobId)).join('\n');
    setExports((current) => [...current, { id, preview }]);
    setNotice(`Export submitted. Job ${id} is ready to download.`);
    setConfirmJobs(null);
    setSelected([]);
  };

  const seenJobs = new Set<string>();

  return (
    <section aria-label="Disposition evidence">
      <button type="button" className="back" data-target-id="DispositionEvidence-backToRecords" onClick={onBack}>
        Back to Records
      </button>
      <p>
        Sealed ledger for Finance (Invoice and Contract). Channel: policy_purge. Evidence is not stored in the content
        tree. This CSV is an unsigned sealed attestation.
      </p>
      <label className="field" htmlFor="evidence-search">
        Search Disposition evidence
        <input
          id="evidence-search"
          data-target-id="DispositionEvidence-search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="File id, name, or job id"
        />
      </label>
      <div className="chips" role="group" aria-label="Filters">
        {CHIP_OPTIONS.map((chip) => {
          const pressed = chips.includes(chip.id);
          return (
            <button
              key={chip.id}
              type="button"
              className={pressed ? 'chip on' : 'chip'}
              aria-pressed={pressed}
              data-target-id={`DispositionEvidence-${chip.action}`}
              onClick={() => toggleChip(chip.id)}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
      <p className="meta" role="status">
        {rows.length} {rows.length === 1 ? 'result' : 'results'}
      </p>
      {rows.length === 0 ? (
        <div className="empty">
          <h3>No disposition evidence</h3>
          <p>No disposition evidence matches this search for Finance (Invoice and Contract).</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Disposition evidence</caption>
            <thead>
              <tr>
                <th scope="col">Batch</th>
                <th scope="col">Certificate</th>
                <th scope="col">File id</th>
                <th scope="col">Name</th>
                <th scope="col">Record type</th>
                <th scope="col">Channel</th>
                <th scope="col" aria-sort={sortDesc ? 'descending' : 'ascending'}>
                  <button type="button" data-target-id="DispositionEvidence-sortDestroyedTime" onClick={() => setSortDesc((value) => !value)}>
                    Destroyed time
                  </button>
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const showCheck = row.status === 'sealed' && !seenJobs.has(row.jobId);
                if (row.status === 'sealed') seenJobs.add(row.jobId);
                return (
                  <tr key={`${row.jobId}-${row.fileId}-${row.status}`}>
                    <td>
                      {showCheck ? (
                        <label>
                          <input
                            type="checkbox"
                            data-target-id={`DispositionEvidence-selectBatch-${row.jobId}`}
                            checked={selected.includes(row.jobId)}
                            onChange={() => toggleJob(row.jobId)}
                          />
                          Select batch {row.jobId}
                        </label>
                      ) : (
                        row.jobId
                      )}
                    </td>
                    <td>
                      {row.certificateId ? (
                        <button
                          type="button"
                          data-target-id={`DispositionEvidence-openCertificate-${row.certificateId}`}
                          onClick={() => onOpenCertificate(row.certificateId!)}
                        >
                          {row.certificateId}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{row.fileId}</td>
                    <td>{row.name}</td>
                    <td>{row.recordType}</td>
                    <td>{row.channel ?? '—'}</td>
                    <td>{row.destroyedAt ?? '—'}</td>
                    <td>
                      {row.statusText}
                      {row.status === 'not_destroyed' ? (
                        <button type="button" data-target-id="DispositionEvidence-openFile-1002" onClick={() => onOpenFile(row.fileId)}>
                          Open file {row.fileId}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="export-bar">
        <button type="button" className="primary" data-target-id="DispositionEvidence-exportCsv" onClick={askExport}>
          Export CSV
        </button>
        {exportError ? (
          <p className="banner error" role="alert">
            {exportError}
          </p>
        ) : null}
        {notice ? (
          <p className="banner success" role="status">
            {notice}
          </p>
        ) : null}
      </div>
      {exports.length > 0 ? (
        <section aria-labelledby="exports-heading">
          <h3 id="exports-heading">Exports</h3>
          <ul className="export-list">
            {exports.map((job) => (
              <li key={job.id}>
                <button
                  type="button"
                  data-target-id={`DispositionEvidence-downloadCsv-${job.id}`}
                  onClick={() => setOpenPreview(openPreview === job.id ? null : job.id)}
                >
                  Download CSV for job {job.id}
                </button>
                {openPreview === job.id ? (
                  <pre className="csv" tabIndex={0}>
                    {job.preview}
                  </pre>
                ) : null}
                <p className="meta">UTF-8 with a BOM. Column keys stay in English.</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {confirmJobs ? (
        <Dialog title="Export CSV" onClose={() => setConfirmJobs(null)}>
          <p>
            Export {confirmJobs.join(', ')} as a UTF-8 CSV with a BOM. This file is an unsigned sealed attestation. Columns:
            file_id, name, record_type, channel, destroyed_at, policy_id, job_id. Values use policy_purge and ISO-8601 UTC.
          </p>
          <div className="dialog-actions">
            <button type="button" data-target-id="ExportDialog-cancel" onClick={() => setConfirmJobs(null)}>
              Cancel
            </button>
            <button type="button" className="primary" data-target-id="ExportDialog-confirm" onClick={confirmExport}>
              Confirm export
            </button>
          </div>
        </Dialog>
      ) : null}
    </section>
  );
}

function compareDestroyed(a: EvidenceRow, b: EvidenceRow, desc: boolean): number {
  if (a.destroyedAt == null && b.destroyedAt == null) return a.fileId - b.fileId;
  if (a.destroyedAt == null) return 1;
  if (b.destroyedAt == null) return -1;
  const delta = a.destroyedAt < b.destroyedAt ? -1 : a.destroyedAt > b.destroyedAt ? 1 : 0;
  return desc ? -delta : delta;
}
