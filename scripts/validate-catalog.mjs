import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const catalogPath = resolve(ROOT, 'manifests/catalog.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));

if (catalog.schemaVersion !== '1.0') throw new Error('schemaVersion must be 1.0');
if (catalog.repository !== 'TsatsuAmable/nemosyne-data') throw new Error('repository identity mismatch');
if (!catalog.corpusVersion) throw new Error('corpusVersion is required');

const ids = new Set();
let verified = 0;
for (const dataset of catalog.datasets ?? []) {
  if (!dataset.id || ids.has(dataset.id)) throw new Error(`invalid or duplicate dataset id: ${dataset.id}`);
  ids.add(dataset.id);
  for (const artifact of dataset.artifacts ?? []) {
    if (!artifact.path || artifact.url) throw new Error(`${dataset.id}: repository artifacts must use path only`);
    const path = resolve(ROOT, artifact.path);
    if (!path.startsWith(`${ROOT}/`)) throw new Error(`${dataset.id}: path traversal`);
    const bytes = await readFile(path);
    const metadata = await stat(path);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    if (metadata.size !== artifact.bytes) throw new Error(`${dataset.id}: byte mismatch for ${artifact.path}`);
    if (sha256 !== artifact.sha256) throw new Error(`${dataset.id}: sha256 mismatch for ${artifact.path}`);
    if (artifact.format === 'csv' && artifact.rows != null) {
      const text = bytes.toString('utf8').trimEnd();
      const rows = text ? text.split('\n').length - 1 : 0;
      if (rows !== artifact.rows) throw new Error(`${dataset.id}: row mismatch for ${artifact.path}: ${rows} != ${artifact.rows}`);
    }
    verified += 1;
  }
}
console.log(`validated ${catalog.datasets.length} datasets and ${verified} materialized artifacts for ${catalog.corpusVersion}`);
