import { useState } from 'react';
import { RECORD_TYPE_CATALOG, RECENT_DECLARATIONS, recordPolicyIds } from './data';
import type { RecordFile, TileKey } from './membership';
import { RecordInventory } from './RecordInventory';

type RecordsHomeProps = {
  files: RecordFile[];
  onOpenTile: (tile: TileKey) => void;
  onUndeclare: (fileId: number) => void;
};

const UPDATED = 'UPDATED 1/14/2026 AT 1:00 PM';

const DISPOSITION_TOTAL = 10_000;

const DISPOSITION = [
  { label: 'Within 1 day', count: 500, tile: 'd1' as const, action: 'openDueWithin1Day' },
  { label: 'Within 7 days', count: 1_500, tile: 'd7' as const, action: 'openDueWithin7Days' },
  { label: 'Within 30 days', count: 3_000, tile: 'd30' as const, action: 'openDueWithin30Days' },
  { label: 'Within 90 days', count: 5_000, tile: 'd90' as const, action: 'openDueWithin90Days' },
];

export function RecordsHome({ files, onOpenTile, onUndeclare }: RecordsHomeProps) {
  const [removed, setRemoved] = useState<number[]>([]);
  const declared = [...files.filter((file) => file.declared && !file.purgedNoCert), ...RECENT_DECLARATIONS].filter(
    (file) => !removed.includes(file.id),
  );
  const typeCounts = RECORD_TYPE_CATALOG.map((type) => ({
    type,
    count: declared.filter((file) => file.recordType === type).length,
  }));
  const maxTypeCount = Math.max(1, ...typeCounts.map((row) => row.count));
  const withoutPolicy = typeCounts
    .map((row) => ({
      type: row.type,
      count: declared.filter((file) => file.recordType === row.type && recordPolicyIds(file).length === 0).length,
    }))
    .filter((row) => row.count > 0);
  const emptyTypes = typeCounts.filter((row) => row.count === 0);
  const [about, setAbout] = useState<string | null>(null);

  return (
    <div className="dashboard">
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="dash-heading">
          Overview
        </h2>
        <p className="updated">{UPDATED}</p>
        <div className="overview-grid">
          <OverviewCard
            title="All Records"
            value="1.2M"
            aboutId="all"
            about="Declared records in this estate."
            infoTarget="RecordsHome-aboutAllRecords"
            open={about === 'all'}
            onAbout={() => setAbout(about === 'all' ? null : 'all')}
          />
          <OverviewCard
            title="Under Retention"
            value="1M"
            aboutId="retention"
            about="Declared records that still have a retention policy."
            infoTarget="RecordsHome-aboutRetention"
            open={about === 'retention'}
            onAbout={() => setAbout(about === 'retention' ? null : 'retention')}
          />
          <OverviewCard
            title="Open Legal Holds"
            value="2.6K"
            aboutId="holds"
            about="Declared records on a legal hold. Holds stay out of the disposition windows."
            infoTarget="RecordsHome-aboutLegalHolds"
            open={about === 'holds'}
            onAbout={() => setAbout(about === 'holds' ? null : 'holds')}
          />
          <OverviewCard
            title="Records in Archive"
            value="200k"
            aboutId="archive"
            about="Destroyed records with disposition evidence in the sealed ledger."
            infoTarget="RecordsHome-aboutArchive"
            open={about === 'archive'}
            onAbout={() => setAbout(about === 'archive' ? null : 'archive')}
          />
        </div>
      </section>

      <section aria-labelledby="lifecycle-heading">
        <h2 id="lifecycle-heading" className="dash-heading">
          Lifecycle
        </h2>
        <div className="lifecycle-grid">
          <article className="panel">
            <h3>Records by record type</h3>
            <ul className="bar-chart">
              {typeCounts
                .filter((row) => row.count > 0)
                .map((row) => (
                  <li key={row.type}>
                    <span className="bar-label">{row.type}</span>
                    <span className="bar-track" aria-hidden="true">
                      <span className="bar-fill classification" style={{ width: `${(row.count / maxTypeCount) * 100}%` }} />
                    </span>
                    <span className="bar-count">{row.count}</span>
                  </li>
                ))}
            </ul>
          </article>

          <article className="panel">
            <div className="panel-title-row">
              <h3>Records Up For Disposition</h3>
              <p className="disposition-total">
                <span className="disposition-total-value">10k</span>
                <span className="disposition-total-caption">Records</span>
              </p>
            </div>
            <ul className="bar-chart disposition-bars">
              {DISPOSITION.map((row) => (
                <li key={row.label}>
                  <button
                    type="button"
                    className="disposition-bar"
                    data-target-id={`RecordsHome-${row.action}`}
                    onClick={() => onOpenTile(row.tile)}
                  >
                    <span className="bar-count">{row.count.toLocaleString('en-US')}</span>
                    <span className="bar-track" aria-hidden="true">
                      <span className="bar-fill disposition" style={{ height: `${(row.count / DISPOSITION_TOTAL) * 100}%` }} />
                    </span>
                    <span className="bar-label">{row.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel">
            <h3>Record types without a retention policy</h3>
            {withoutPolicy.length === 0 ? <p className="meta">Every record type in use has a retention policy.</p> : null}
            <ul className="policy-list">
              {withoutPolicy.map((row) => (
                <li key={row.type}>
                  <span className="policy-name">{row.type}</span>
                  <span className="policy-status">{row.count}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel">
            <h3>Record types with 0 records</h3>
            {emptyTypes.length === 0 ? <p className="meta">Every record type has at least one record.</p> : null}
            <ul className="policy-list">
              {emptyTypes.map((row) => (
                <li key={row.type}>
                  <span className="policy-name">{row.type}</span>
                  <span className="policy-status">0</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
      <RecordInventory
        files={declared}
        onUndeclare={(fileId) => {
          setRemoved((current) => (current.includes(fileId) ? current : [...current, fileId]));
          onUndeclare(fileId);
        }}
      />
    </div>
  );
}

function OverviewCard({
  title,
  value,
  about,
  aboutId,
  infoTarget,
  open,
  onAbout,
}: {
  title: string;
  value: string;
  about: string;
  aboutId: string;
  infoTarget: string;
  open: boolean;
  onAbout: () => void;
}) {
  const aboutDomId = `about-${aboutId}`;
  return (
    <article className="panel overview-card">
      <div className="overview-top">
        <h3>{title}</h3>
        <button
          type="button"
          className="info-dot"
          aria-expanded={open}
          aria-controls={aboutDomId}
          data-target-id={infoTarget}
          onClick={onAbout}
        >
          i
        </button>
      </div>
      <p className="overview-value">{value}</p>
      {open ? (
        <p id={aboutDomId} className="about">
          {about}
        </p>
      ) : null}
    </article>
  );
}
