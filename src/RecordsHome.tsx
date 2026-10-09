import { TILES, matchesTile, type RecordFile, type TileKey } from './membership';

type RecordsHomeProps = {
  files: RecordFile[];
  onOpenTile: (tile: TileKey) => void;
};

export function RecordsHome({ files, onOpenTile }: RecordsHomeProps) {
  return (
    <section aria-labelledby="declared-heading">
      <h2 id="declared-heading">Declared records</h2>
      <div className="tile-grid">
        {TILES.map((tile) => {
          const count = files.filter((file) => matchesTile(file, tile.key)).length;
          return (
            <button
              key={tile.key}
              type="button"
              className="tile"
              data-target-id={`RecordsHome-${tile.action}`}
              onClick={() => onOpenTile(tile.key)}
            >
              <span className="tile-count">{count}</span>
              <span className="tile-label">{tile.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
