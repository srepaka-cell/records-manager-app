import { useState } from 'react';
import { APPROVER_OPTIONS, NAMED_APPROVERS, type Approval } from './data';
import { isBlank } from './format';

type ApprovalsProps = {
  approvals: Approval[];
  onChange: (next: Approval[]) => void;
};

export function Approvals({ approvals, onChange }: ApprovalsProps) {
  return (
    <section className="approvals" aria-labelledby="approvals-heading">
      <h2 id="approvals-heading">Open routes</h2>
      <p className="meta">These tasks belong to the people named on the route. The person who started the route cannot approve it.</p>
      {approvals.length === 0 ? <p className="meta">No approval routes have been started.</p> : null}
      <div className="stack">
        {approvals.map((approval) => (
          <ApprovalCard key={approval.fileId} approval={approval} onChange={onChange} approvals={approvals} />
        ))}
      </div>
    </section>
  );
}

function ApprovalCard({
  approval,
  approvals,
  onChange,
}: {
  approval: Approval;
  approvals: Approval[];
  onChange: (next: Approval[]) => void;
}) {
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const nextPending =
    approval.mode === 'sequence' ? approval.approverIds.find((id) => approval.decisions[id] === 'pending') : null;

  const replace = (next: Approval) => {
    onChange(approvals.map((item) => (item.fileId === next.fileId ? next : item)));
  };

  const approve = (who: string) => {
    const decisions = { ...approval.decisions, [who]: 'approved' as const };
    const allApproved = approval.approverIds.every((id) => decisions[id] === 'approved');
    replace({ ...approval, decisions, status: allApproved ? 'approved' : 'open' });
  };

  const reject = (who: string) => {
    if (isBlank(reason)) {
      setError('Enter a reject reason. Spaces alone are not enough.');
      return;
    }
    replace({
      ...approval,
      decisions: { ...approval.decisions, [who]: 'rejected' },
      status: 'paused',
      rejectReason: reason.trim(),
    });
    setRejecting(null);
    setReason('');
    setError('');
  };

  const nameOf = (id: string) => NAMED_APPROVERS.find((person) => person.id === id)?.name ?? APPROVER_OPTIONS.find((person) => person.id === id)?.name ?? id;

  return (
    <article className="card">
      <header className="card-title">
        <h3>
          File {approval.fileId} — {approval.mode} route
        </h3>
        <span className={`pill ${approval.status}`}>{approval.status === 'approved' ? 'Fully approved' : approval.status === 'paused' ? 'Paused' : 'Open'}</span>
      </header>
      {approval.rejectReason ? (
        <p className="row-note">Rejected: {approval.rejectReason}. The file returns to the records manager and stays in Box.</p>
      ) : null}
      {approval.approverIds.map((who) => {
        const decision = approval.decisions[who];
        const blocked = approval.mode === 'sequence' && who !== nextPending && decision === 'pending';
        const canAct = decision === 'pending' && !blocked && approval.status === 'open';
        return (
          <div key={who} className="approver-row">
            <p>
              {nameOf(who)} — {decision === 'pending' ? (blocked ? 'Waiting for the earlier approver' : 'Pending') : decision}
            </p>
            {canAct ? (
              <div className="actions">
                <button type="button" className="primary" data-target-id={`PendingApprovals-approve-${approval.fileId}-${who}`} onClick={() => approve(who)}>
                  Approve file {approval.fileId}
                </button>
                <button type="button" data-target-id={`PendingApprovals-reject-${approval.fileId}-${who}`} onClick={() => setRejecting(who)}>
                  Reject file {approval.fileId}
                </button>
              </div>
            ) : null}
            {rejecting === who ? (
              <div className="stack">
                <label className="field" htmlFor={`reject-${approval.fileId}-${who}`}>
                  Reject reason
                  <textarea
                    id={`reject-${approval.fileId}-${who}`}
                    data-target-id={`PendingApprovals-enterRejectReason-${approval.fileId}`}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </label>
                {error ? (
                  <p className="banner error" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="actions">
                  <button type="button" className="primary" data-target-id={`PendingApprovals-confirmReject-${approval.fileId}`} onClick={() => reject(who)}>
                    Confirm reject
                  </button>
                  <button
                    type="button"
                    data-target-id={`PendingApprovals-cancelReject-${approval.fileId}`}
                    onClick={() => {
                      setRejecting(null);
                      setReason('');
                      setError('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
      <p className="meta">
        {approval.status === 'open' ? 'Approval is open. Disposition will wait.' : null}
        {approval.status === 'paused' ? 'Disposition is paused.' : null}
        {approval.status === 'approved' ? 'The route is fully approved.' : null}
      </p>
    </article>
  );
}
