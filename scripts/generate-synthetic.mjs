import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const TIERS = Object.freeze({ smoke: 1_000, small: 8_000, medium: 65_000, large: 100_000, xlarge: 250_000 });
const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
const tiers = requested.length ? requested : ['smoke'];
for (const tier of tiers) {
  if (!(tier in TIERS)) throw new Error(`Unknown tier: ${tier}`);
}

function lcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

async function writeCsv(relativePath, header, rows) {
  const path = resolve(ROOT, relativePath);
  await mkdir(dirname(path), { recursive: true });
  const body = `${header.join(',')}\n${rows.map((row) => row.join(',')).join('\n')}\n`;
  await writeFile(path, body, 'utf8');
}

function linearRows(count) {
  return Array.from({ length: count }, (_, id) => {
    const x = id - Math.floor(count / 2);
    return [id, x, 3 * x + 7, (id % 17) - 8, `g${id % 4}`, 1_700_000_000 + id * 60];
  });
}

function clusteredRows(count) {
  const centers = [
    [-12, -12, -6],
    [12, -12, 6],
    [-12, 12, 6],
    [12, 12, -6],
  ];
  return Array.from({ length: count }, (_, id) => {
    const cluster = id % centers.length;
    const [cx, cy, cz] = centers[cluster];
    const ring = Math.floor(id / centers.length);
    const dx = ((ring * 37) % 101 - 50) / 50;
    const dy = ((ring * 53) % 97 - 48) / 48;
    const dz = ((ring * 61) % 89 - 44) / 44;
    return [id, (cx + dx).toFixed(6), (cy + dy).toFixed(6), (cz + dz).toFixed(6), cluster];
  });
}

function nullRows(count) {
  const random = lcg(0x4e454d4f);
  const rows = [];
  for (let id = 0; id < count; id += 1) {
    rows.push([
      id,
      (random() * 2 - 1).toFixed(8),
      (random() * 2 - 1).toFixed(8),
      (random() * 2 - 1).toFixed(8),
      `c${Math.floor(random() * 7)}`,
    ]);
  }
  return rows;
}

function missingnessRows(count) {
  return Array.from({ length: count }, (_, id) => {
    const cohort = id % 5;
    const base = id % 211;
    const mcar = id % 11 === 0 ? '' : (base / 10).toFixed(1);
    const mar = cohort === 3 && id % 3 === 0 ? '' : ((base * 7) % 97).toString();
    const structural = cohort === 4 ? '' : ((base * 13) % 151).toString();
    return [id, cohort, base, mcar, mar, structural];
  });
}

for (const tier of tiers) {
  const count = TIERS[tier];
  await writeCsv(`data/synthetic/linear-truth/${tier}.csv`, ['id', 'x', 'y', 'z', 'group', 'timestamp_s'], linearRows(count));
  await writeCsv(`data/synthetic/clustered-truth/${tier}.csv`, ['id', 'x', 'y', 'z', 'cluster_id'], clusteredRows(count));
  await writeCsv(`data/synthetic/null-control/${tier}.csv`, ['id', 'x', 'y', 'z', 'category'], nullRows(count));
  await writeCsv(`data/synthetic/missingness-truth/${tier}.csv`, ['id', 'cohort', 'base', 'mcar_value', 'mar_value', 'structural_value'], missingnessRows(count));
}
