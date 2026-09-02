import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const catalogPath = resolve(ROOT, 'manifests/catalog.json');
const schemaPath = resolve(ROOT, 'manifests/catalog.schema.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));

const datasetSchema = schema.$defs?.dataset;
const fieldSchema = schema.$defs?.field;
const knownAnswerSchema = schema.$defs?.knownAnswer;
const artifactSchema = schema.$defs?.artifact;

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function required(object, keys, context) {
  assert(object && typeof object === 'object' && !Array.isArray(object), `${context}: object required`);
  for (const key of keys ?? []) {
    assert(Object.hasOwn(object, key), `${context}: missing required field ${key}`);
  }
}

function enumValues(definition, key) {
  return definition?.properties?.[key]?.enum ?? [];
}

function assertEnum(value, allowed, context) {
  assert(allowed.includes(value), `${context}: invalid value ${JSON.stringify(value)}; expected one of ${allowed.join(', ')}`);
}

function assertPattern(value, pattern, context) {
  assert(typeof value === 'string' && new RegExp(pattern).test(value), `${context}: invalid value ${JSON.stringify(value)}`);
}

function resolveRepositoryPath(relativePath, context) {
  assert(typeof relativePath === 'string' && relativePath.length > 0, `${context}: path required`);
  const absolute = resolve(ROOT, relativePath);
  assert(absolute.startsWith(`${ROOT}${sep}`), `${context}: path escapes repository root`);
  return absolute;
}

async function requireRepositoryFile(relativePath, context) {
  const path = resolveRepositoryPath(relativePath, context);
  const metadata = await lstat(path);
  assert(!metadata.isSymbolicLink(), `${context}: symlinks are not allowed for governed repository files`);
  assert(metadata.isFile(), `${context}: regular file required`);
  return { path, metadata };
}

function validateShape(candidateCatalog) {
  required(candidateCatalog, schema.required, 'catalog');
  assert(candidateCatalog.schemaVersion === schema.properties.schemaVersion.const, `schemaVersion must be ${schema.properties.schemaVersion.const}`);
  assert(candidateCatalog.repository === schema.properties.repository.const, 'repository identity mismatch');
  assert(typeof candidateCatalog.corpusVersion === 'string' && candidateCatalog.corpusVersion.length > 0, 'corpusVersion is required');
  assert(Array.isArray(candidateCatalog.datasets), 'catalog.datasets must be an array');

  const ids = new Set();
  for (const dataset of candidateCatalog.datasets) {
    const context = `dataset ${dataset?.id ?? '<missing-id>'}`;
    required(dataset, datasetSchema.required, context);
    assertPattern(dataset.id, datasetSchema.properties.id.pattern, `${context}.id`);
    assertPattern(dataset.datasetVersion, datasetSchema.properties.datasetVersion.pattern, `${context}.datasetVersion`);
    assert(!ids.has(dataset.id), `${context}: duplicate dataset id`);
    ids.add(dataset.id);

    assertEnum(dataset.kind, enumValues(datasetSchema, 'kind'), `${context}.kind`);
    assertEnum(dataset.governanceState, enumValues(datasetSchema, 'governanceState'), `${context}.governanceState`);
    assertEnum(dataset.privacy, enumValues(datasetSchema, 'privacy'), `${context}.privacy`);
    assert(Array.isArray(dataset.intendedUses) && dataset.intendedUses.length > 0, `${context}: intendedUses must be non-empty`);
    assert(Array.isArray(dataset.plannedTiers) && dataset.plannedTiers.length > 0, `${context}: plannedTiers must be non-empty`);
    assert(Array.isArray(dataset.artifacts), `${context}: artifacts must be an array`);

    required(dataset.license, schema.$defs.license.required, `${context}.license`);
    assertEnum(dataset.license.status, enumValues(schema.$defs.license, 'status'), `${context}.license.status`);
    required(dataset.provenance, schema.$defs.provenance.required, `${context}.provenance`);
    assert(Array.isArray(dataset.provenance.transformations), `${context}.provenance.transformations must be an array`);

    required(dataset.measurementSchema, schema.$defs.measurementSchema.required, `${context}.measurementSchema`);
    assertEnum(dataset.measurementSchema.status, enumValues(schema.$defs.measurementSchema, 'status'), `${context}.measurementSchema.status`);
    assert(Array.isArray(dataset.measurementSchema.fields), `${context}.measurementSchema.fields must be an array`);

    const fieldNames = new Set();
    for (const field of dataset.measurementSchema.fields) {
      required(field, fieldSchema.required, `${context}.field`);
      assert(!fieldNames.has(field.name), `${context}: duplicate field name ${field.name}`);
      fieldNames.add(field.name);
      assertEnum(field.storageType, enumValues(fieldSchema, 'storageType'), `${context}.${field.name}.storageType`);
      assertEnum(field.measurementScale, enumValues(fieldSchema, 'measurementScale'), `${context}.${field.name}.measurementScale`);
      assert(typeof field.nullable === 'boolean', `${context}.${field.name}.nullable must be boolean`);
    }

    for (const knownAnswer of dataset.knownAnswers ?? []) {
      required(knownAnswer, knownAnswerSchema.required, `${context}.knownAnswer`);
      assertEnum(knownAnswer.authority, enumValues(knownAnswerSchema, 'authority'), `${context}.${knownAnswer.id}.authority`);
    }

    for (const artifact of dataset.artifacts) {
      required(artifact, artifactSchema.required, `${context}.artifact`);
      assertPattern(artifact.sha256, artifactSchema.properties.sha256.pattern, `${context}.${artifact.path}.sha256`);
      assertEnum(artifact.format, enumValues(artifactSchema, 'format'), `${context}.${artifact.path}.format`);
      assert(Number.isInteger(artifact.rows) && artifact.rows >= 0, `${context}.${artifact.path}.rows must be a non-negative integer`);
      assert(Number.isInteger(artifact.bytes) && artifact.bytes >= 0, `${context}.${artifact.path}.bytes must be a non-negative integer`);
      assert(candidateCatalog.tierRows[artifact.tier] === artifact.rows, `${context}.${artifact.path}: rows do not match tier ${artifact.tier}`);
      assert(dataset.plannedTiers.includes(artifact.tier), `${context}.${artifact.path}: artifact tier is not declared in plannedTiers`);
      resolveRepositoryPath(artifact.path, `${context}.${artifact.path}`);
    }

    for (const sourcePath of [dataset.sourceManifest, dataset.license.sourceManifest, dataset.provenance.sourceManifest].filter(Boolean)) {
      resolveRepositoryPath(sourcePath, `${context}.sourceManifest`);
    }
    if (dataset.provenance.generator) {
      resolveRepositoryPath(dataset.provenance.generator, `${context}.provenance.generator`);
    }

    if (dataset.governanceState === 'governed') {
      assert(dataset.artifacts.length > 0, `${context}: governed dataset must materialize at least one artifact`);
      assert(dataset.measurementSchema.status === 'declared', `${context}: governed dataset must declare measurement semantics`);
      assert(dataset.measurementSchema.fields.length > 0, `${context}: governed dataset must declare at least one field`);
      assertPattern(dataset.contentDigest, '^sha256:[0-9a-f]{64}$', `${context}.contentDigest`);
    }

    if (dataset.governanceState === 'candidate') {
      assert(dataset.contentDigest == null, `${context}: candidate dataset must not claim a governed contentDigest`);
    }
  }
}

async function validateMaterialization(dataset) {
  const context = `dataset ${dataset.id}`;
  const artifactIdentities = [];

  for (const artifact of dataset.artifacts) {
    const { path, metadata } = await requireRepositoryFile(artifact.path, `${context}.${artifact.path}`);
    const bytes = await readFile(path);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    assert(metadata.size === artifact.bytes, `${context}: byte mismatch for ${artifact.path}`);
    assert(sha256 === artifact.sha256, `${context}: sha256 mismatch for ${artifact.path}`);

    if (artifact.format === 'csv') {
      const text = bytes.toString('utf8').trimEnd();
      const lines = text ? text.split(/\r?\n/) : [];
      const rows = Math.max(0, lines.length - 1);
      assert(rows === artifact.rows, `${context}: row mismatch for ${artifact.path}: ${rows} != ${artifact.rows}`);
      if (dataset.measurementSchema.status === 'declared') {
        const header = (lines[0] ?? '').split(',');
        const declared = dataset.measurementSchema.fields.map((field) => field.name);
        assert(JSON.stringify(header) === JSON.stringify(declared), `${context}: CSV header does not match declared measurement fields for ${artifact.path}`);
      }
    }

    artifactIdentities.push(`${artifact.path}\0${artifact.sha256}\n`);
  }

  const sourcePaths = new Set([dataset.sourceManifest, dataset.license.sourceManifest, dataset.provenance.sourceManifest].filter(Boolean));
  for (const sourcePath of sourcePaths) {
    const { path } = await requireRepositoryFile(sourcePath, `${context}.sourceManifest`);
    if (sourcePath.endsWith('.json')) {
      const source = JSON.parse(await readFile(path, 'utf8'));
      if (Object.hasOwn(source, 'datasetId')) {
        assert(source.datasetId === dataset.id, `${context}: source manifest ${sourcePath} belongs to ${source.datasetId}`);
      }
      if (sourcePath === dataset.license.sourceManifest && Object.hasOwn(source, 'license')) {
        assert(source.license === dataset.license.name, `${context}: licence metadata disagrees with ${sourcePath}`);
      }
    }
  }

  if (dataset.provenance.generator) {
    await requireRepositoryFile(dataset.provenance.generator, `${context}.provenance.generator`);
  }

  if (dataset.governanceState === 'governed') {
    const digestInput = artifactIdentities.sort().join('');
    const digest = `sha256:${createHash('sha256').update(digestInput, 'utf8').digest('hex')}`;
    assert(digest === dataset.contentDigest, `${context}: contentDigest mismatch: ${digest} != ${dataset.contentDigest}`);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectShapeFailure(name, mutate) {
  const sample = clone(catalog);
  mutate(sample);
  let failed = false;
  try {
    validateShape(sample);
  } catch {
    failed = true;
  }
  assert(failed, `negative self-test did not fail closed: ${name}`);
}

validateShape(catalog);
for (const dataset of catalog.datasets) {
  await validateMaterialization(dataset);
}

expectShapeFailure('duplicate dataset id', (sample) => {
  sample.datasets[1].id = sample.datasets[0].id;
});
expectShapeFailure('governed dataset without artifacts', (sample) => {
  sample.datasets[0].artifacts = [];
});
expectShapeFailure('governed dataset without measurement semantics', (sample) => {
  sample.datasets[0].measurementSchema.status = 'pending-review';
  sample.datasets[0].measurementSchema.fields = [];
});
expectShapeFailure('invalid measurement scale', (sample) => {
  sample.datasets[0].measurementSchema.fields[0].measurementScale = 'float';
});
expectShapeFailure('duplicate field name', (sample) => {
  sample.datasets[0].measurementSchema.fields[1].name = sample.datasets[0].measurementSchema.fields[0].name;
});
expectShapeFailure('known answer without tolerance', (sample) => {
  delete sample.datasets[0].knownAnswers[0].tolerance;
});
expectShapeFailure('candidate claims governed digest', (sample) => {
  sample.datasets.at(-1).contentDigest = 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
});
expectShapeFailure('artifact path traversal', (sample) => {
  sample.datasets[0].artifacts[0].path = '../outside.csv';
});

const governed = catalog.datasets.filter((dataset) => dataset.governanceState === 'governed').length;
const candidates = catalog.datasets.filter((dataset) => dataset.governanceState === 'candidate').length;
const artifacts = catalog.datasets.reduce((sum, dataset) => sum + dataset.artifacts.length, 0);
console.log(`validated ${catalog.datasets.length} datasets (${governed} governed, ${candidates} candidate), ${artifacts} materialized artifacts, schema ${catalog.schemaVersion}, corpus ${catalog.corpusVersion}`);
console.log('negative contract self-tests: 8 passed');
