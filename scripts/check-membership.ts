import { SEED } from '../src/data.ts';
import { TILES, dueWithin, isPastDue, matchesTile } from '../src/membership.ts';

const expected: Record<string, number> = {
  total: 6,
  retention: 5,
  hold: 1,
  d1: 0,
  d7: 1,
  d30: 1,
  d60: 1,
  d90: 1,
  past: 1,
  disp: 1,
  purged: 1,
};

let failed = false;
for (const tile of TILES) {
  const count = SEED.filter((file) => matchesTile(file, tile.key)).length;
  if (count !== expected[tile.key]) {
    console.error(`${tile.key}: ${count}, expected ${expected[tile.key]}`);
    failed = true;
  }
}

const extended = SEED.map((file) =>
  file.id === 1004 ? { ...file, dispositionUtc: Date.parse('2026-11-08T00:00:00Z') } : file,
);
const file1004 = extended.find((file) => file.id === 1004);
if (!file1004 || isPastDue(file1004) || dueWithin(file1004, 30) || !dueWithin(file1004, 60) || !dueWithin(file1004, 90)) {
  console.error('extend fixture failed for file 1004');
  failed = true;
}

const held = SEED.find((file) => file.id === 1002);
if (!held || isPastDue(held) || dueWithin(held, 90)) {
  console.error('held file 1002 leaked into due or past due');
  failed = true;
}

if (failed) process.exit(1);
console.log('membership ok');
