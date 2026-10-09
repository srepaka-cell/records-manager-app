import type { Approval } from './data';
import { formatDisposition } from './format';
import { canReviewDestruction, isPastDue, type RecordFile } from './membership';

type AttentionListProps = {
  files: RecordFile[];
  approvals: Approval[];
  onExtend: (file: RecordFile) => void;
  onSend: (file: RecordFile) => void;
  onOpenGap: () => void;
};

type AttentionRow = {
  file: RecordFile;
  reason: string;
  rank: number;
  gap: boolean;
};

export function AttentionList({ files, approvals, onExtend, onSend, onOpenGap }: AttentionListProps) {
  const rows = attentionRows(files, approvals);
  return (
    <section className="attention" aria-labelledby="attention-heading">
      <h2 id="attention-heading">Needs attention</h2>
      <p className="meta">Records waiting on a records manager decision.</p>
      {rows.length === 0 ? <p className="meta">Nothing is waiting on you.</p> : null}
      <div className="stack">
        {rows.map((row) => (
          <article key={row.file.id} className="card attention-card">
            <div className="card-title">
              <h3>
                {row.file.name} <span className="meta">File {row.file.id}</span>
              </h3>
              <span className="pill">{row.file.recordType}</span>
            </div>
            <p>{row.reason}</p>
            {row.gap ? null : (
              <p className="meta">Disposition time: {formatDisposition(row.file.dispositionUtc, row.file.dispositionText)}</p>
            )}
            <div className="actions">
              {row.gap ? (
                <button type="button" data-target-id={`AttentionList-viewMissingCertificate-${row.file.id}`} onClick={onOpenGap}>
                  View missing certificate
                </button>
              ) : (
                <>
                  <button type="button" data-target-id={`AttentionList-extend-${row.file.id}`} onClick={() => onExtend(row.file)}>
                    Extend retention for file {row.file.id}
                  </button>
                  <button type="button" data-target-id={`AttentionList-sendForApproval-${row.file.id}`} onClick={() => onSend(row.file)}>
                    Send file {row.file.id} for approval
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function attentionRows(files: RecordFile[], approvals: Approval[]): AttentionRow[] {
  const rows: AttentionRow[] = [];
  for (const file of files) {
    if (file.purgedNoCert) {
      rows.push({ file, gap: true, rank: 3, reason: 'Purged without a certificate.' });
      continue;
    }
    if (!canReviewDestruction(file)) continue;
    const approval = approvals.find((item) => item.fileId === file.id);
    if (approval?.status === 'open' || approval?.status === 'approved') continue;
    if (approval?.status === 'paused') {
      rows.push({
        file,
        gap: false,
        rank: 0,
        reason: approval.rejectReason
          ? `Approval rejected: ${approval.rejectReason}. Disposition is paused until you extend retention or start a new route.`
          : 'Approval rejected. Disposition is paused until you extend retention or start a new route.',
      });
      continue;
    }
    if (isPastDue(file)) {
      rows.push({
        file,
        gap: false,
        rank: 1,
        reason: 'Past due and still in Box. Disposition can still select this record.',
      });
      continue;
    }
    rows.push({
      file,
      gap: false,
      rank: 2,
      reason: 'Coming due. Disposition can still select this record.',
    });
  }
  return rows.sort((a, b) => a.rank - b.rank || (a.file.dispositionUtc ?? 0) - (b.file.dispositionUtc ?? 0));
}
