import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ROW_COUNT = 1_000;

async function writeCsv(relativePath, header, rows) {
  const path = resolve(ROOT, relativePath);
  await mkdir(dirname(path), { recursive: true });
  const body = `${header.join(',')}\n${rows.map((row) => row.join(',')).join('\n')}\n`;
  await writeFile(path, body, 'utf8');
}

function jsonArrayProperty(name, values, trailingComma) {
  return [
    `  ${JSON.stringify(name)}: [`,
    ...values.map((value, index) => `    ${JSON.stringify(value)}${index + 1 < values.length ? ',' : ''}`),
    `  ]${trailingComma ? ',' : ''}`,
  ];
}

async function writeDatasetJson(relativePath, value) {
  const path = resolve(ROOT, relativePath);
  await mkdir(dirname(path), { recursive: true });
  const lines = [
    '{',
    `  "name": ${JSON.stringify(value.name)},`,
    ...jsonArrayProperty('columns', value.columns, true),
    ...jsonArrayProperty('rows', value.rows, true),
    ...jsonArrayProperty('rowIds', value.rowIds, true),
    ...jsonArrayProperty('edges', value.edges, false),
    '}',
  ];
  await writeFile(path, `${lines.join('\n')}\n`, 'utf8');
}

function aggregateRows() {
  const groups = ['A', 'B', 'C', 'D'];
  return Array.from({ length: ROW_COUNT }, (_, id) => {
    const groupIndex = id % groups.length;
    return [id, groups[groupIndex], groupIndex + 1];
  });
}

function distributionRows() {
  return Array.from({ length: ROW_COUNT }, (_, id) => [id, id % 10]);
}

function densityRows() {
  return Array.from({ length: ROW_COUNT }, (_, id) => [id, id < ROW_COUNT / 2 ? -10 : 10, 0]);
}

function clusterRows() {
  const clusters = [
    ['A', -12, -12],
    ['B', 12, -12],
    ['C', -12, 12],
    ['D', 12, 12],
  ];
  return Array.from({ length: ROW_COUNT }, (_, id) => {
    const [clusterId, x, y] = clusters[id % clusters.length];
    return [id, clusterId, x, y];
  });
}

function relationshipGraph() {
  const communitySize = ROW_COUNT / 4;
  const rowIds = Array.from({ length: ROW_COUNT }, (_, id) => `node-${String(id).padStart(4, '0')}`);
  const rows = rowIds.map((nodeId, id) => ({
    node_id: nodeId,
    community: `c${Math.floor(id / communitySize)}`,
  }));
  const edges = rowIds.map((source, id) => {
    const communityStart = Math.floor(id / communitySize) * communitySize;
    const offset = id - communityStart;
    const targetIndex = communityStart + ((offset + 1) % communitySize);
    return { source, target: rowIds[targetIndex], weight: 1 };
  });

  return {
    name: 'PT2B source-authoritative relationship graph',
    columns: [
      { name: 'node_id', type: 'TEXT' },
      { name: 'community', type: 'CATEGORICAL' },
    ],
    rows,
    rowIds,
    edges,
  };
}

await writeCsv(
  'data/synthetic/aggregate-family/smoke.csv',
  ['id', 'group', 'value'],
  aggregateRows(),
);
await writeCsv(
  'data/synthetic/distribution-family/smoke.csv',
  ['id', 'value'],
  distributionRows(),
);
await writeCsv(
  'data/synthetic/binned-density-family/smoke.csv',
  ['id', 'x', 'y'],
  densityRows(),
);
await writeCsv(
  'data/synthetic/source-partition-cluster-family/smoke.csv',
  ['id', 'cluster_id', 'x', 'y'],
  clusterRows(),
);
await writeDatasetJson(
  'data/synthetic/relationship-graph-family/smoke.json',
  relationshipGraph(),
);
