import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const sourceName = process.argv[2];
if (!sourceName || !/^[a-z0-9-]+$/.test(sourceName)) {
  throw new Error('usage: node scripts/acquire-source.mjs <source-name>');
}
const manifestPath = resolve(ROOT, `sources/${sourceName}.json`);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const url = new URL(manifest.upstream);
const allowedHosts = new Set(['raw.githubusercontent.com', 'earthquake.usgs.gov']);
if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname)) {
  throw new Error(`upstream host is not allow-listed: ${url.hostname}`);
}
const response = await fetch(url, { headers: { 'user-agent': 'nemosyne-data-acquirer/1.0' } });
if (!response.ok) throw new Error(`acquisition failed: HTTP ${response.status}`);
const bytes = new Uint8Array(await response.arrayBuffer());
const sha256 = createHash('sha256').update(bytes).digest('hex');
const extension = manifest.acquisition?.format === 'json' ? 'json' : 'csv';
const out = resolve(ROOT, `staging/${sourceName}.${extension}`);
await mkdir(dirname(out), { recursive: true });
await writeFile(out, bytes);
const receipt = {
  schemaVersion: '1.0',
  datasetId: manifest.datasetId,
  sourceManifest: `sources/${sourceName}.json`,
  acquiredAt: new Date().toISOString(),
  finalUrl: response.url,
  bytes: bytes.byteLength,
  sha256,
};
await writeFile(resolve(ROOT, `staging/${sourceName}.receipt.json`), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt, null, 2));
