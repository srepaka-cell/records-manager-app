import { EVIDENCE } from './evidence';

type CertificateDetailProps = {
  certificateId: string;
  onBack: () => void;
};

export function CertificateDetail({ certificateId, onBack }: CertificateDetailProps) {
  const row = EVIDENCE.find((item) => item.certificateId === certificateId);
  if (!row) {
    return (
      <section>
        <button type="button" className="back" data-target-id="CertificateDetail-back" onClick={onBack}>
          Back to Disposition evidence
        </button>
        <h2>Certificate</h2>
        <p>That certificate is not in this Finance ledger.</p>
      </section>
    );
  }

  const fields: Array<[string, string]> = [
    ['Certificate ID', row.certificateId ?? '—'],
    ['Job id', row.jobId],
    ['File ID', String(row.fileId)],
    ['Version IDs', row.versions ?? '—'],
    ['Display name', row.name],
    ['Record type and group', `${row.recordType}, ${row.group}`],
    ['Created / uploaded', row.createdAt ?? '—'],
    ['Declared', row.declaredAt ?? '—'],
    ['Retention expired', row.retentionExpiredAt ?? '—'],
    ['Destroyed', row.destroyedAt ?? '—'],
    ['Channel', row.channel ?? '—'],
    ['Legal hold result', row.legalHoldResult ?? '—'],
    ['Actor', row.actor ?? '—'],
    ['Tombstone', row.tombstone ?? '—'],
    ['Manifest seal', row.seal ?? '—'],
    ['Generation UTC', row.generatedAt ?? '—'],
    ['Purge confirmation token', row.confirmToken ?? '—'],
    ['Enterprise ID', row.enterpriseId ?? '—'],
    ['Policy id and name', row.policyId == null ? '—' : `${row.policyId} ${row.policyName ?? ''}`],
    ['SHA', row.sha === '' ? 'Empty' : row.sha ?? '—'],
    ['Stated term', row.term ?? '—'],
    ['Approver', row.approver ?? '—'],
  ];

  return (
    <section aria-labelledby="certificate-heading">
      <button type="button" className="back" data-target-id="CertificateDetail-back" onClick={onBack}>
        Back to Disposition evidence
      </button>
      <h2 id="certificate-heading">Certificate {row.certificateId}</h2>
      <p>These fields are read-only. Content bytes are not available.</p>
      <dl className="facts">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
