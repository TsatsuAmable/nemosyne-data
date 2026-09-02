import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ROW_COUNT = 1_000;
const BASES = [
  { slug: 'aggregate-family', format: 'csv' },
  { slug: 'distribution-family', format: 'csv' },
  { slug: 'binned-density-family', format: 'csv' },
  { slug: 'source-partition-cluster-family', format: 'csv' },
  { slug: 'relationship-graph-family', format: 'json' },
];

async function writeText(relativePath, text) {
  const path = resolve(ROOT, relativePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text, 'utf8');
}

function controlValue(index) {
  return `control-${String((index * 37) % 101).padStart(3, '0')}`;
}

function jsonArrayProperty(name, values, trailingComma) {
  return [
    `  ${JSON.stringify(name)}: [`,
    ...values.map((value, index) => `    ${JSON.stringify(value)}${index + 1 < values.length ? ',' : ''}`),
    `  ]${trailingComma ? ',' : ''}`,
  ];
}

function datasetJson(value) {
  const lines = [
    '{',
    `  "name": ${JSON.stringify(value.name)},`,
    ...jsonArrayProperty('columns', value.columns, true),
    ...jsonArrayProperty('rows', value.rows, true),
    ...jsonArrayProperty('rowIds', value.rowIds, true),
    ...jsonArrayProperty('edges', value.edges, false),
    '}',
  ];
  return `${lines.join('\n')}\n`;
}

function csvVariants(text) {
  const lines = text.trimEnd().split(/\r?\n/);
  const header = lines.shift();
  if (!header || lines.length !== ROW_COUNT) {
    throw new Error(`PT2C base CSV must contain a header and exactly ${ROW_COUNT} rows`);
  }
  return {
    rowPermutation: `${header}\n${[...lines].reverse().join('\n')}\n`,
    irrelevantColumn: `${header},metamorphic_control\n${lines.map((line, index) => `${line},${controlValue(index)}`).join('\n')}\n`,
  };
}

function graphVariants(graph) {
  if (
    !graph ||
    !Array.isArray(graph.columns) ||
    !Array.isArray(graph.rows) ||
    !Array.isArray(graph.rowIds) ||
    !Array.isArray(graph.edges) ||
    graph.rows.length !== ROW_COUNT ||
    graph.rowIds.length !== ROW_COUNT
  ) {
    throw new Error('PT2C base graph must be a 1,000-row edge-bearing DatasetJSON object');
  }
  return {
    rowPermutation: {
      ...graph,
      name: `${graph.name} / row permutation`,
      rows: [...graph.rows].reverse(),
      rowIds: [...graph.rowIds].reverse(),
      edges: graph.edges.map((edge) => ({ ...edge })),
    },
    irrelevantColumn: {
      ...graph,
      name: `${graph.name} / irrelevant-column variant`,
      columns: [...graph.columns, { name: 'metamorphic_control', type: 'TEXT' }],
      rows: graph.rows.map((row, index) => ({ ...row, metamorphic_control: controlValue(index) })),
      rowIds: [...graph.rowIds],
      edges: graph.edges.map((edge) => ({ ...edge })),
    },
  };
}

for (const base of BASES) {
  const sourcePath = `data/synthetic/${base.slug}/smoke.${base.format}`;
  const source = await readFile(resolve(ROOT, sourcePath), 'utf8');
  if (base.format === 'csv') {
    const variants = csvVariants(source);
    await writeText(`data/metamorphic/${base.slug}/row-permuted.csv`, variants.rowPermutation);
    await writeText(`data/metamorphic/${base.slug}/irrelevant-column.csv`, variants.irrelevantColumn);
  } else {
    const variants = graphVariants(JSON.parse(source));
    await writeText(`data/metamorphic/${base.slug}/row-permuted.json`, datasetJson(variants.rowPermutation));
    await writeText(`data/metamorphic/${base.slug}/irrelevant-column.json`, datasetJson(variants.irrelevantColumn));
  }
}

const nilRows = Array.from(
  { length: ROW_COUNT },
  (_, index) => `obs-${String(index).padStart(4, '0')}`,
);
await writeText(
  'data/synthetic/nil-abstention/smoke.csv',
  `observation_id\n${nilRows.join('\n')}\n`,
);
