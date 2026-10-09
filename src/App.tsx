import { useMemo, useState } from 'react';
import { Approvals } from './Approvals';
import { CertificateDetail } from './CertificateDetail';
import { SEED, type Approval } from './data';
import { ExtendDialog, SendDialog, UndeclareDialog } from './Dialogs';
import { DispositionEvidence } from './DispositionEvidence';
import type { EvidenceChip } from './evidence';
import { matchesTile, TILES, type RecordFile, type TileKey } from './membership';
import { RecordsHome } from './RecordsHome';
import { RecordTable } from './RecordTable';

type Screen = { name: 'home' } | { name: 'list'; tile: TileKey } | { name: 'evidence' } | { name: 'certificate'; certificateId: string };

type DialogState = { kind: 'undeclare' | 'extend' | 'send'; file: RecordFile } | null;

export default function App() {
  const [files, setFiles] = useState<RecordFile[]>(SEED);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [listQuery, setListQuery] = useState('');
  const [evidenceQuery, setEvidenceQuery] = useState('');
  const [evidenceChips, setEvidenceChips] = useState<EvidenceChip[]>([]);
  const [dialog, setDialog] = useState<DialogState>(null);

  const openTile = (tile: TileKey) => {
    if (tile === 'purged') {
      setEvidenceChips(['missing']);
      setEvidenceQuery('');
      setScreen({ name: 'evidence' });
      return;
    }
    setListQuery('');
    setScreen({ name: 'list', tile });
  };

  const openEvidence = () => {
    setEvidenceChips([]);
    setEvidenceQuery('');
    setScreen({ name: 'evidence' });
  };

  const tileDefinition = screen.name === 'list' ? TILES.find((tile) => tile.key === screen.tile) : undefined;
  const tileRows = useMemo(() => {
    if (screen.name !== 'list') return [];
    const matched = files
      .filter((file) => matchesTile(file, screen.tile))
      .slice()
      .sort((a, b) => (a.dispositionUtc ?? Number.POSITIVE_INFINITY) - (b.dispositionUtc ?? Number.POSITIVE_INFINITY));
    const query = listQuery.trim().toLowerCase();
    if (!query) return matched;
    return matched.filter((file) => String(file.id).includes(query) || file.name.toLowerCase().includes(query));
  }, [files, listQuery, screen]);

  const activeFile = dialog ? files.find((file) => file.id === dialog.file.id) ?? dialog.file : null;

  return (
    <div className="app">
      <aside className="nav">
        <p className="brand">Governance</p>
        <p className="nav-current">Records</p>
      </aside>
      <div className="main">
        <header className="page-header">
          <div>
            <h1>{screen.name === 'evidence' || screen.name === 'certificate' ? 'Disposition evidence' : 'Records'}</h1>
            {screen.name === 'evidence' || screen.name === 'certificate' ? (
              <p className="meta">Finance (Invoice and Contract). Sealed ledger, channel policy_purge.</p>
            ) : (
              <>
                <p className="meta">Counts include declared records only. Scope: Finance (Invoice and Contract).</p>
                <p className="meta">Request time 2026-10-08 00:00 UTC. Disposition times are shown in America/Los_Angeles.</p>
              </>
            )}
          </div>
          {screen.name === 'home' || screen.name === 'list' ? (
            <button type="button" data-target-id="RecordsHome-openDispositionEvidence" onClick={openEvidence}>
              Disposition evidence
            </button>
          ) : null}
        </header>
        {screen.name === 'home' ? (
          <>
            <RecordsHome files={files} onOpenTile={openTile} />
            <Approvals approvals={approvals} onChange={setApprovals} />
          </>
        ) : null}
        {screen.name === 'list' && tileDefinition ? (
          <RecordTable
            label={tileDefinition.label}
            count={files.filter((file) => matchesTile(file, tileDefinition.key)).length}
            rows={tileRows}
            query={listQuery}
            emptyBecauseSearch={listQuery.trim() !== ''}
            approvals={approvals}
            onQuery={setListQuery}
            onBack={() => {
              setListQuery('');
              setScreen({ name: 'home' });
            }}
            onUndeclare={(file) => setDialog({ kind: 'undeclare', file })}
            onExtend={(file) => setDialog({ kind: 'extend', file })}
            onSend={(file) => setDialog({ kind: 'send', file })}
          />
        ) : null}
        {screen.name === 'evidence' ? (
          <DispositionEvidence
            query={evidenceQuery}
            chips={evidenceChips}
            onQuery={setEvidenceQuery}
            onChips={setEvidenceChips}
            onBack={() => setScreen({ name: 'home' })}
            onOpenCertificate={(certificateId) => setScreen({ name: 'certificate', certificateId })}
            onOpenFile={(fileId) => {
              setListQuery(String(fileId));
              setScreen({ name: 'list', tile: 'total' });
            }}
          />
        ) : null}
        {screen.name === 'certificate' ? (
          <CertificateDetail certificateId={screen.certificateId} onBack={() => setScreen({ name: 'evidence' })} />
        ) : null}
      </div>
      {dialog && activeFile && dialog.kind === 'undeclare' ? (
        <UndeclareDialog
          file={activeFile}
          onClose={() => setDialog(null)}
          onConfirm={(file) => {
            setFiles((current) => current.map((item) => (item.id === file.id ? { ...item, declared: false } : item)));
            setApprovals((current) => current.filter((item) => item.fileId !== file.id));
          }}
        />
      ) : null}
      {dialog && activeFile && dialog.kind === 'extend' ? (
        <ExtendDialog
          file={activeFile}
          onClose={() => setDialog(null)}
          onSave={(file, utc) => {
            setFiles((current) =>
              current.map((item) =>
                item.id === file.id ? { ...item, dispositionUtc: utc, dispositionText: undefined } : item,
              ),
            );
            setApprovals((current) => current.filter((item) => item.fileId !== file.id));
          }}
        />
      ) : null}
      {dialog && activeFile && dialog.kind === 'send' ? (
        <SendDialog
          file={activeFile}
          onClose={() => setDialog(null)}
          onStart={(approval) => {
            setApprovals((current) => [...current.filter((item) => item.fileId !== approval.fileId), approval]);
          }}
        />
      ) : null}
    </div>
  );
}
