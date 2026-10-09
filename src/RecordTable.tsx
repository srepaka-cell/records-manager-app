import { canReviewDestruction, type RecordFile } from './membership';
import type { Approval } from './data';
import { formatDisposition } from './format';

type RecordTableProps = {
  label: string;
  count: number;
  rows: RecordFile[];
  query: string;
  emptyBecauseSearch: boolean;
  approvals: Approval[];
  onQuery: (value: string) => void;
  onBack: () => void;
  onUndeclare: (file: RecordFile) => void;
  onExtend: (file: RecordFile) => void;
  onSend: (file: RecordFile) => void;
};

export function RecordTable({
  label,
  count,
  rows,
  query,
  emptyBecauseSearch,
  approvals,
  onQuery,
  onBack,
  onUndeclare,
  onExtend,
  onSend,
}: RecordTableProps) {
  const headingCount = query.trim() ? rows.length : count;
  return (
    <section aria-labelledby="list-heading">
      <button type="button" className="back" data-target-id="RecordList-backToRecords" onClick={onBack}>
        Back to Records
      </button>
      <h2 id="list-heading">
        {label}: {headingCount}
      </h2>
      <label className="field" htmlFor="record-search">
        Search by file id or name
        <input
          id="record-search"
          data-target-id="RecordList-search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="File id or name"
        />
      </label>
      {rows.length === 0 && label === 'Due within 1 day' && !emptyBecauseSearch ? (
        <div className="empty">
          <h3>Nothing due within 1 day</h3>
          <p>No declared Finance record falls in the Due within 1 day window right now.</p>
        </div>
      ) : null}
      {rows.length === 0 && (label !== 'Due within 1 day' || emptyBecauseSearch) ? (
        <div className="empty">
          <h3>No matching records</h3>
          <p>No records match this search in this count.</p>
        </div>
      ) : null}
      {rows.length > 0 ? (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">
              {label}: {headingCount}
            </caption>
            <thead>
              <tr>
                <th scope="col">File id</th>
                <th scope="col">Name</th>
                <th scope="col">Path</th>
                <th scope="col">Record type</th>
                <th scope="col">Retention</th>
                <th scope="col">Legal hold</th>
                <th scope="col">Disposition time</th>
                <th scope="col">Policy ids</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((file) => {
                const approval = approvals.find((item) => item.fileId === file.id);
                const review = canReviewDestruction(file);
                return (
                  <tr key={file.id}>
                    <td>{file.id}</td>
                    <td>{file.name}</td>
                    <td>
                      {file.path}
                      {file.inTrash ? <span className="pill">In trash</span> : null}
                    </td>
                    <td>{file.recordType}</td>
                    <td>{file.retention}</td>
                    <td>
                      {file.hold}
                      {file.holdIds.length > 0 ? ` (${file.holdIds.join(', ')})` : ''}
                    </td>
                    <td>
                      {formatDisposition(file.dispositionUtc, file.dispositionText)}
                      {file.jobRunning ? <span className="pill">Job still running</span> : null}
                    </td>
                    <td>{file.policiesApplied.length > 0 ? file.policiesApplied.join(', ') : 'No policy'}</td>
                    <td>
                      <div className="actions">
                        {approval?.status === 'open' ? <p className="row-note">Approval is open. Disposition will wait.</p> : null}
                        {approval?.status === 'paused' ? <p className="row-note">Disposition is paused.</p> : null}
                        {approval?.status === 'approved' ? <p className="row-note">Route is fully approved.</p> : null}
                        <button type="button" data-target-id={`RecordList-undeclare-${file.id}`} onClick={() => onUndeclare(file)}>
                          Undeclare file {file.id}
                        </button>
                        {review ? (
                          <button type="button" data-target-id={`RecordList-extend-${file.id}`} onClick={() => onExtend(file)}>
                            Extend retention for file {file.id}
                          </button>
                        ) : null}
                        {review ? (
                          <button
                            type="button"
                            data-target-id={`RecordList-sendForApproval-${file.id}`}
                            onClick={() => onSend(file)}
                          >
                            Send file {file.id} for approval
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
