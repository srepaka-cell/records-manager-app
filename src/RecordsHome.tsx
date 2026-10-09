import { useState } from 'react';
import type { TileKey } from './membership';

type RecordsHomeProps = {
  onOpenTile: (tile: TileKey) => void;
  onOpenEvidence: () => void;
};

const UPDATED = 'UPDATED 1/14/2026 AT 1:00 PM';

const CLASSIFICATION = [
  { label: 'Public', value: 320000 },
  { label: 'Internal', value: 275000 },
  { label: 'Confidential', value: 240000 },
  { label: 'Top Secret', value: 52000 },
  { label: 'Other', value: 385000 },
];

const DISPOSITION = [
  { label: '1 Day', count: '628', color: '#d5e4f7', tile: 'd1' as const, action: 'openDueWithin1Day' },
  { label: '7 Days', count: '4,307', color: '#8eb6ea', tile: 'd7' as const, action: 'openDueWithin7Days' },
  { label: '30 Days', count: '114,093', color: '#3b82d6', tile: 'd30' as const, action: 'openDueWithin30Days' },
  { label: '90 Days', count: '290,837', color: '#0c3f86', tile: 'd90' as const, action: 'openDueWithin90Days' },
  { label: '90+ Days', count: '682,013', color: '#1b1f24', tile: 'past' as const, action: 'openPastDue' },
];

const RECORD_TYPES = [
  { label: 'Signed Contracts', width: '92%' },
  { label: 'Vendor Invoices', width: '78%' },
];

export function RecordsHome({ onOpenTile, onOpenEvidence }: RecordsHomeProps) {
  const [about, setAbout] = useState<string | null>(null);

  return (
    <div className="dashboard">
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="dash-heading">
          Overview
        </h2>
        <div className="overview-grid">
          <OverviewCard
            title="All Records"
            value="1.84 K"
            aboutId="all"
            about="Declared records in this estate."
            link="View Records"
            linkTarget="RecordsHome-viewRecords"
            infoTarget="RecordsHome-aboutAllRecords"
            open={about === 'all'}
            onAbout={() => setAbout(about === 'all' ? null : 'all')}
            onOpen={() => onOpenTile('total')}
          />
          <OverviewCard
            title="Under Retention"
            value="998"
            aboutId="retention"
            about="Declared records that still have a retention policy."
            link="View Expiring"
            linkTarget="RecordsHome-viewExpiring"
            infoTarget="RecordsHome-aboutRetention"
            open={about === 'retention'}
            onAbout={() => setAbout(about === 'retention' ? null : 'retention')}
            onOpen={() => onOpenTile('d30')}
          />
          <OverviewCard
            title="Open Legal Holds"
            value="2.6 K"
            aboutId="holds"
            about="Declared records on a legal hold. Holds stay out of the disposition windows."
            link="View Legal Holds"
            linkTarget="RecordsHome-viewLegalHolds"
            infoTarget="RecordsHome-aboutLegalHolds"
            open={about === 'holds'}
            onAbout={() => setAbout(about === 'holds' ? null : 'holds')}
            onOpen={() => onOpenTile('hold')}
          />
          <OverviewCard
            title="Records in Archive"
            value="192"
            aboutId="archive"
            about="Destroyed records with disposition evidence in the sealed ledger."
            link="View Archived"
            linkTarget="RecordsHome-viewArchived"
            infoTarget="RecordsHome-aboutArchive"
            open={about === 'archive'}
            onAbout={() => setAbout(about === 'archive' ? null : 'archive')}
            onOpen={onOpenEvidence}
          />
        </div>
      </section>

      <section aria-labelledby="lifecycle-heading">
        <h2 id="lifecycle-heading" className="dash-heading">
          Lifecycle
        </h2>
        <div className="lifecycle-grid">
          <article className="panel">
            <h3>Classification Coverage</h3>
            <ul className="bar-chart">
              {CLASSIFICATION.map((row) => (
                <li key={row.label}>
                  <span className="bar-label">{row.label}</span>
                  <span className="bar-track" aria-hidden="true">
                    <span className="bar-fill classification" style={{ width: `${(row.value / 400000) * 100}%` }} />
                  </span>
                  <span className="sr-only">{row.value.toLocaleString('en-US')} records</span>
                </li>
              ))}
            </ul>
            <div className="axis" aria-hidden="true">
              <span />
              <span className="axis-ticks">
                <span>0</span>
                <span>100K</span>
                <span>200K</span>
                <span>300K</span>
                <span>400K</span>
              </span>
            </div>
          </article>

          <article className="panel">
            <h3>Records Up For Disposition</h3>
            <div className="disposition-layout">
              <div className="donut-wrap">
                <div className="donut" aria-hidden="true" />
                <div className="donut-center">
                  <span className="donut-total">1.2M</span>
                  <span className="donut-caption">Records</span>
                </div>
              </div>
              <ul className="legend">
                {DISPOSITION.map((row) => (
                  <li key={row.label}>
                    <button
                      type="button"
                      className="legend-button"
                      data-target-id={`RecordsHome-${row.action}`}
                      onClick={() => onOpenTile(row.tile)}
                    >
                      <span className="swatch" style={{ background: row.color }} aria-hidden="true" />
                      <span className="legend-label">{row.label}</span>
                      <span className="legend-count">{row.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button type="button" className="linkish" data-target-id="RecordsHome-openDispositionInProgress" onClick={() => onOpenTile('disp')}>
              Disposition in progress
            </button>
          </article>

          <article className="panel">
            <h3>Retention Policy Coverage</h3>
            <ul className="policy-list">
              <li>
                <span className="policy-name">GDPR Sensitive...</span>
                <span className="policy-status">Unused</span>
              </li>
              <li>
                <span className="policy-name">Legal Hold – M&A</span>
                <span className="policy-status">Unused</span>
              </li>
            </ul>
          </article>

          <article className="panel">
            <div className="panel-title-row">
              <h3>Top 5 Record Types</h3>
              <span className="panel-aside">Last 30 Days</span>
            </div>
            <ul className="type-chart">
              {RECORD_TYPES.map((row) => (
                <li key={row.label}>
                  <span className="bar-label wide">{row.label}</span>
                  <span className="bar-track" aria-hidden="true">
                    <span className="bar-fill type" style={{ width: row.width }} />
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  about,
  aboutId,
  link,
  linkTarget,
  infoTarget,
  open,
  onAbout,
  onOpen,
}: {
  title: string;
  value: string;
  about: string;
  aboutId: string;
  link: string;
  linkTarget: string;
  infoTarget: string;
  open: boolean;
  onAbout: () => void;
  onOpen: () => void;
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
      <p className="updated">{UPDATED}</p>
      <p className="overview-value">{value}</p>
      {open ? (
        <p id={aboutDomId} className="about">
          {about}
        </p>
      ) : null}
      <button type="button" className="linkish" data-target-id={linkTarget} onClick={onOpen}>
        {link}
      </button>
    </article>
  );
}
