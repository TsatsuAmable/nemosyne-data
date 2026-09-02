import { lstat, readFile, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const REAL_ROOT = await realpath(ROOT);
const catalog = JSON.parse(await readFile(resolve(ROOT, 'manifests/catalog.json'), 'utf8'));

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

async function requireRepositoryFile(relativePath, context) {
  assert(typeof relativePath === 'string' && relativePath.length > 0, `${context}: artifact path required`);
  const path = resolve(ROOT, relativePath);
  assert(path.startsWith(`${ROOT}${sep}`), `${context}: artifact path escapes repository root`);
  const metadata = await lstat(path);
  assert(metadata.isFile() && !metadata.isSymbolicLink(), `${context}: regular non-symlink artifact required`);
  const canonicalPath = await realpath(path);
  assert(canonicalPath.startsWith(`${REAL_ROOT}${sep}`), `${context}: canonical artifact path escapes repository root`);
  return path;
}

function parseScalar(raw, field, context) {
  if (raw === '') {
    assert(field.nullable, `${context}: non-nullable field ${field.name} is empty`);
    return null;
  }
  if (field.storageType === 'integer') {
    const value = Number(raw);
    assert(Number.isSafeInteger(value), `${context}: ${field.name} is not a safe integer`);
    return value;
  }
  if (field.storageType === 'number') {
    const value = Number(raw);
    assert(Number.isFinite(value), `${context}: ${field.name} is not finite`);
    return value;
  }
  if (field.storageType === 'boolean') {
    assert(raw === 'true' || raw === 'false', `${context}: ${field.name} is not boolean`);
    return raw === 'true';
  }
  return raw;
}

function validateJsonScalar(value, field, context) {
  if (value === null) {
    assert(field.nullable, `${context}: non-nullable field ${field.name} is null`);
    return;
  }
  if (field.storageType === 'integer') {
    assert(Number.isSafeInteger(value), `${context}: ${field.name} is not a safe integer`);
  } else if (field.storageType === 'number') {
    assert(typeof value === 'number' && Number.isFinite(value), `${context}: ${field.name} is not finite numeric`);
  } else if (field.storageType === 'boolean') {
    assert(typeof value === 'boolean', `${context}: ${field.name} is not boolean`);
  } else {
    assert(typeof value === 'string' && value.length > 0, `${context}: ${field.name} is not a non-empty string`);
  }
}

function parseCsv(text, dataset) {
  const lines = text.trimEnd().split(/\r?\n/);
  const header = (lines.shift() ?? '').split(',');
  const fields = dataset.measurementSchema.fields;
  assert(
    JSON.stringify(header) === JSON.stringify(fields.map((field) => field.name)),
    `dataset ${dataset.id}: CSV header disagrees with measurement schema`,
  );
  return lines.map((line, index) => {
    const cells = line.split(',');
    assert(cells.length === fields.length, `dataset ${dataset.id}: row ${index} has the wrong field count`);
    return Object.fromEntries(fields.map((field, fieldIndex) => [
      field.name,
      parseScalar(cells[fieldIndex], field, `dataset ${dataset.id} row ${index}`),
    ]));
  });
}

function validateGraphDataset(graph, dataset) {
  const context = `dataset ${dataset.id}`;
  assert(graph && typeof graph === 'object' && !Array.isArray(graph), `${context}: DatasetJSON object required`);
  assert(typeof graph.name === 'string' && graph.name.length > 0, `${context}: DatasetJSON name required`);
  assert(Array.isArray(graph.columns), `${context}: DatasetJSON columns required`);
  assert(Array.isArray(graph.rows), `${context}: DatasetJSON rows required`);
  assert(Array.isArray(graph.rowIds), `${context}: DatasetJSON rowIds required for durable graph endpoints`);
  assert(Array.isArray(graph.edges), `${context}: DatasetJSON source edges required`);
  assert(graph.rowIds.length === graph.rows.length, `${context}: rowIds length must equal row count`);
  assert(
    graph.rowIds.every((rowId) => typeof rowId === 'string' && rowId.length > 0 && rowId.trim() === rowId),
    `${context}: rowIds must be non-empty canonical strings`,
  );
  assert(new Set(graph.rowIds).size === graph.rowIds.length, `${context}: rowIds must be unique`);

  const declaredFields = dataset.measurementSchema.fields.map((field) => field.name);
  assert(
    graph.columns.every((column) => (
      column &&
      typeof column === 'object' &&
      !Array.isArray(column) &&
      typeof column.name === 'string' &&
      ['NUMERIC', 'CATEGORICAL', 'TEMPORAL', 'TEXT', 'UNKNOWN'].includes(column.type)
    )),
    `${context}: DatasetJSON columns must carry valid names and types`,
  );
  assert(
    JSON.stringify(graph.columns.map((column) => column.name)) === JSON.stringify(declaredFields),
    `${context}: DatasetJSON columns disagree with measurement schema`,
  );
  for (const [index, row] of graph.rows.entries()) {
    assert(row && typeof row === 'object' && !Array.isArray(row), `${context}: row ${index} must be an object`);
    assert(
      Object.keys(row).length === declaredFields.length && declaredFields.every((field) => Object.hasOwn(row, field)),
      `${context}: row ${index} fields disagree with measurement schema`,
    );
    for (const field of dataset.measurementSchema.fields) {
      validateJsonScalar(row[field.name], field, `${context} row ${index}`);
    }
  }

  const rowIdSet = new Set(graph.rowIds);
  const endpointExists = (endpoint) => (
    typeof endpoint === 'string'
      ? rowIdSet.has(endpoint)
      : Number.isSafeInteger(endpoint) && endpoint >= 0 && endpoint < graph.rows.length
  );
  for (const [index, edge] of graph.edges.entries()) {
    assert(edge && typeof edge === 'object' && !Array.isArray(edge), `${context}: edge ${index} must be an object`);
    assert(endpointExists(edge.source), `${context}: edge ${index} has unknown source endpoint`);
    assert(endpointExists(edge.target), `${context}: edge ${index} has unknown target endpoint`);
    if (Object.hasOwn(edge, 'weight')) {
      assert(typeof edge.weight === 'number' && Number.isFinite(edge.weight), `${context}: edge ${index} weight must be finite`);
    }
  }
}

async function loadDataset(dataset) {
  const primary = dataset.artifacts.filter((artifact) => artifact.role === 'primary');
  assert(primary.length === 1, `dataset ${dataset.id}: exactly one primary artifact required`);
  const artifact = primary[0];
  const path = await requireRepositoryFile(artifact.path, `dataset ${dataset.id}`);
  const text = await readFile(path, 'utf8');
  if (artifact.format === 'csv') return { rows: parseCsv(text, dataset), graph: null };
  if (artifact.format === 'json') {
    const graph = JSON.parse(text);
    validateGraphDataset(graph, dataset);
    return { rows: graph.rows, graph };
  }
  fail(`dataset ${dataset.id}: unsupported known-answer artifact format ${artifact.format}`);
}

function numericValues(rows, field, context) {
  const values = rows.map((row) => row[field]).filter((value) => value !== null);
  assert(values.length > 0, `${context}: ${field} has no valid observations`);
  assert(values.every((value) => typeof value === 'number' && Number.isFinite(value)), `${context}: ${field} must be numeric`);
  return values;
}

function grouped(rows, fields) {
  const groups = new Map();
  for (const row of rows) {
    const key = fields.map((field) => row[field]);
    const encoded = JSON.stringify(key);
    const group = groups.get(encoded) ?? { key, rows: [] };
    group.rows.push(row);
    groups.set(encoded, group);
  }
  return [...groups.values()].sort((left, right) => {
    const leftKey = JSON.stringify(left.key);
    const rightKey = JSON.stringify(right.key);
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
  });
}

function validateRecipe(verification, dataset, context) {
  assert(verification && typeof verification === 'object' && !Array.isArray(verification), `${context}: verification object required`);
  const allowedPropertiesByOperation = {
    'row-count': ['operation'],
    'distinct-count': ['operation', 'field'],
    sum: ['operation', 'field'],
    mean: ['operation', 'field'],
    range: ['operation', 'field'],
    'quantile-r7': ['operation', 'field', 'probability'],
    'group-counts': ['operation', 'fields'],
    'group-sums': ['operation', 'groupBy', 'field'],
    'group-means': ['operation', 'groupBy', 'fields'],
    'graph-node-count': ['operation'],
    'graph-edge-count': ['operation'],
    'graph-weak-component-count': ['operation'],
    'graph-degree-range': ['operation'],
    'graph-row-id-field-alignment': ['operation', 'field'],
  };
  const allowed = allowedPropertiesByOperation[verification.operation];
  assert(allowed, `${context}: unsupported verification operation ${JSON.stringify(verification.operation)}`);
  const unknown = Object.keys(verification).filter((key) => !allowed.includes(key));
  assert(unknown.length === 0, `${context}: irrelevant verification properties ${unknown.join(', ')}`);

  const fields = new Set(dataset.measurementSchema.fields.map((field) => field.name));
  for (const name of ['field', 'groupBy']) {
    if (allowed.includes(name)) {
      assert(typeof verification[name] === 'string' && fields.has(verification[name]), `${context}: ${name} must name a declared field`);
    }
  }
  if (allowed.includes('fields')) {
    assert(Array.isArray(verification.fields) && verification.fields.length > 0, `${context}: fields must be non-empty`);
    assert(new Set(verification.fields).size === verification.fields.length, `${context}: fields must be unique`);
    assert(verification.fields.every((field) => fields.has(field)), `${context}: fields must all be declared`);
  }
  if (verification.operation === 'quantile-r7') {
    assert(
      typeof verification.probability === 'number' &&
      Number.isFinite(verification.probability) &&
      verification.probability >= 0 &&
      verification.probability <= 1,
      `${context}: probability must be finite and in [0, 1]`,
    );
  }
}

function normalizeEndpoint(endpoint, graph) {
  return typeof endpoint === 'number' ? graph.rowIds[endpoint] : endpoint;
}

function weakComponentCount(graph) {
  const adjacency = new Map(graph.rowIds.map((rowId) => [rowId, new Set()]));
  for (const edge of graph.edges) {
    const source = normalizeEndpoint(edge.source, graph);
    const target = normalizeEndpoint(edge.target, graph);
    adjacency.get(source).add(target);
    adjacency.get(target).add(source);
  }
  let components = 0;
  const visited = new Set();
  for (const rowId of graph.rowIds) {
    if (visited.has(rowId)) continue;
    components += 1;
    const pending = [rowId];
    visited.add(rowId);
    while (pending.length) {
      const current = pending.pop();
      for (const neighbor of adjacency.get(current)) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        pending.push(neighbor);
      }
    }
  }
  return components;
}

function degreeRange(graph) {
  const incoming = new Map(graph.rowIds.map((rowId) => [rowId, 0]));
  const outgoing = new Map(graph.rowIds.map((rowId) => [rowId, 0]));
  for (const edge of graph.edges) {
    const source = normalizeEndpoint(edge.source, graph);
    const target = normalizeEndpoint(edge.target, graph);
    outgoing.set(source, outgoing.get(source) + 1);
    incoming.set(target, incoming.get(target) + 1);
  }
  const inValues = [...incoming.values()];
  const outValues = [...outgoing.values()];
  return {
    inMin: Math.min(...inValues),
    inMax: Math.max(...inValues),
    outMin: Math.min(...outValues),
    outMax: Math.max(...outValues),
  };
}

function evaluate(verification, materialized, context) {
  const { rows, graph } = materialized;
  switch (verification.operation) {
    case 'row-count':
      return rows.length;
    case 'distinct-count':
      return new Set(rows.map((row) => row[verification.field])).size;
    case 'sum':
      return numericValues(rows, verification.field, context).reduce((sum, value) => sum + value, 0);
    case 'mean': {
      const values = numericValues(rows, verification.field, context);
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
    case 'range': {
      const values = numericValues(rows, verification.field, context);
      return Math.max(...values) - Math.min(...values);
    }
    case 'quantile-r7': {
      const values = numericValues(rows, verification.field, context).sort((a, b) => a - b);
      const position = (values.length - 1) * verification.probability;
      const lower = Math.floor(position);
      const upper = Math.ceil(position);
      return values[lower] + (position - lower) * (values[upper] - values[lower]);
    }
    case 'group-counts':
      return grouped(rows, verification.fields).map((group) => ({ key: group.key, count: group.rows.length }));
    case 'group-sums':
      return grouped(rows, [verification.groupBy]).map((group) => ({
        key: group.key,
        sum: numericValues(group.rows, verification.field, context).reduce((sum, value) => sum + value, 0),
      }));
    case 'group-means':
      return grouped(rows, [verification.groupBy]).map((group) => ({
        key: group.key,
        means: verification.fields.map((field) => {
          const values = numericValues(group.rows, field, context);
          return values.reduce((sum, value) => sum + value, 0) / values.length;
        }),
      }));
    case 'graph-node-count':
      assert(graph, `${context}: graph artifact required`);
      return graph.rows.length;
    case 'graph-edge-count':
      assert(graph, `${context}: graph artifact required`);
      return graph.edges.length;
    case 'graph-weak-component-count':
      assert(graph, `${context}: graph artifact required`);
      return weakComponentCount(graph);
    case 'graph-degree-range':
      assert(graph, `${context}: graph artifact required`);
      return degreeRange(graph);
    case 'graph-row-id-field-alignment':
      assert(graph, `${context}: graph artifact required`);
      return graph.rows.every((row, index) => row[verification.field] === graph.rowIds[index]);
    default:
      fail(`${context}: unsupported verification operation ${JSON.stringify(verification.operation)}`);
  }
}

function assertExpected(actual, answer, context) {
  assert(answer.tolerance && typeof answer.tolerance === 'object' && !Array.isArray(answer.tolerance), `${context}: tolerance object required`);
  const toleranceKeys = Object.keys(answer.tolerance);
  if (answer.tolerance.kind === 'exact') {
    assert(toleranceKeys.length === 1 && toleranceKeys[0] === 'kind', `${context}: exact tolerance cannot carry an ignored bound`);
    assert(
      JSON.stringify(canonical(actual)) === JSON.stringify(canonical(answer.expected)),
      `${context}: expected ${JSON.stringify(answer.expected)}, computed ${JSON.stringify(actual)}`,
    );
    return;
  }

  assert(
    toleranceKeys.length === 2 && toleranceKeys.includes('kind') && toleranceKeys.includes('value'),
    `${context}: approximate tolerance requires only kind and value`,
  );
  assert(typeof actual === 'number' && Number.isFinite(actual), `${context}: approximate actual must be finite numeric`);
  assert(typeof answer.expected === 'number' && Number.isFinite(answer.expected), `${context}: approximate expected must be finite numeric`);
  const difference = Math.abs(actual - answer.expected);
  if (answer.tolerance.kind === 'absolute') {
    assert(Number.isFinite(answer.tolerance.value) && answer.tolerance.value >= 0, `${context}: invalid absolute tolerance`);
    assert(difference <= answer.tolerance.value, `${context}: absolute error ${difference} exceeds ${answer.tolerance.value}`);
    return;
  }
  assert(answer.tolerance.kind === 'relative', `${context}: unknown tolerance kind ${JSON.stringify(answer.tolerance.kind)}`);
  assert(Number.isFinite(answer.tolerance.value) && answer.tolerance.value >= 0, `${context}: invalid relative tolerance`);
  if (answer.expected === 0) {
    assert(actual === 0, `${context}: relative comparison to zero requires exact zero`);
    return;
  }
  const relative = difference / Math.abs(answer.expected);
  assert(relative <= answer.tolerance.value, `${context}: relative error ${relative} exceeds ${answer.tolerance.value}`);
}

async function expectFailure(name, action) {
  let failed = false;
  try {
    await action();
  } catch {
    failed = true;
  }
  assert(failed, `negative known-answer self-test did not fail closed: ${name}`);
}

function encodedMultiset(values) {
  return values.map((value) => JSON.stringify(canonical(value))).sort();
}

function graphEdgesByIdentity(graph) {
  return encodedMultiset(graph.edges.map((edge) => ({
    ...edge,
    source: normalizeEndpoint(edge.source, graph),
    target: normalizeEndpoint(edge.target, graph),
  })));
}

function assertSameEncoded(left, right, context) {
  assert(JSON.stringify(left) === JSON.stringify(right), `${context}: complete structural identity mismatch`);
}

function validateMetamorphicStructure(base, variant, baseMaterialized, variantMaterialized) {
  const context = `dataset ${variant.id}.metamorphicRelation`;
  const relation = variant.metamorphicRelation;
  assert(relation.baseDatasetId === base.id, `${context}: base dataset identity mismatch`);
  assert(relation.baseContentDigest === base.contentDigest, `${context}: base content digest mismatch`);
  const baseAnswerIds = base.knownAnswers.map((answer) => answer.id).sort();
  assertSameEncoded([...relation.preservedKnownAnswerIds].sort(), baseAnswerIds, `${context}: preserved answer IDs`);

  const baseFields = base.measurementSchema.fields.map((field) => field.name);
  const variantFields = variant.measurementSchema.fields.map((field) => field.name);
  if (relation.kind === 'row-permutation') {
    assertSameEncoded(variant.measurementSchema.fields, base.measurementSchema.fields, `${context}: measurement schema`);
    if (baseMaterialized.graph) {
      assert(variantMaterialized.graph, `${context}: graph variant required`);
      const basePairs = baseMaterialized.graph.rows.map((row, index) => ({
        rowId: baseMaterialized.graph.rowIds[index],
        row,
      }));
      const variantPairs = variantMaterialized.graph.rows.map((row, index) => ({
        rowId: variantMaterialized.graph.rowIds[index],
        row,
      }));
      assertSameEncoded(encodedMultiset(variantPairs), encodedMultiset(basePairs), `${context}: durable row/ID multiset`);
      assert(
        JSON.stringify(variantPairs) !== JSON.stringify(basePairs),
        `${context}: row-permutation variant did not change paired row order`,
      );
      assertSameEncoded(
        graphEdgesByIdentity(variantMaterialized.graph),
        graphEdgesByIdentity(baseMaterialized.graph),
        `${context}: source-edge identity multiset`,
      );
    } else {
      assertSameEncoded(
        encodedMultiset(variantMaterialized.rows),
        encodedMultiset(baseMaterialized.rows),
        `${context}: complete row multiset`,
      );
      assert(
        JSON.stringify(variantMaterialized.rows) !== JSON.stringify(baseMaterialized.rows),
        `${context}: row-permutation variant did not change row order`,
      );
    }
    return;
  }

  assert(relation.kind === 'irrelevant-column-addition', `${context}: unknown relation kind ${relation.kind}`);
  assertSameEncoded(variantFields.slice(0, baseFields.length), baseFields, `${context}: base field prefix`);
  assertSameEncoded(variantFields.slice(baseFields.length), relation.addedFields, `${context}: added fields`);
  assert(variantMaterialized.rows.length === baseMaterialized.rows.length, `${context}: row count changed`);
  const projected = variantMaterialized.rows.map((row) => Object.fromEntries(baseFields.map((field) => [field, row[field]])));
  assertSameEncoded(projected, baseMaterialized.rows, `${context}: ordered base-field projection`);
  for (const [index, row] of variantMaterialized.rows.entries()) {
    for (const field of relation.addedFields) {
      assert(Object.hasOwn(row, field) && row[field] !== null, `${context}: missing added field ${field} at row ${index}`);
    }
  }
  if (baseMaterialized.graph) {
    assert(variantMaterialized.graph, `${context}: graph variant required`);
    assertSameEncoded(variantMaterialized.graph.rowIds, baseMaterialized.graph.rowIds, `${context}: durable row IDs`);
    assertSameEncoded(
      graphEdgesByIdentity(variantMaterialized.graph),
      graphEdgesByIdentity(baseMaterialized.graph),
      `${context}: source-edge identity multiset`,
    );
  }
}

const fixtures = catalog.datasets.filter((dataset) => dataset.semanticFixtureFamily);
const requiredFamilies = [
  'aggregate',
  'empirical-distribution',
  'binned-density',
  'source-partition-cluster',
  'source-relationship-graph',
];
const seenFamilies = new Set();
let verifiedAnswers = 0;
let verifiedMetamorphicAnswers = 0;
const materializedById = new Map();

for (const dataset of fixtures) {
  assert(dataset.governanceState === 'governed', `dataset ${dataset.id}: semantic fixture must be governed`);
  assert(!seenFamilies.has(dataset.semanticFixtureFamily), `duplicate semantic fixture family ${dataset.semanticFixtureFamily}`);
  seenFamilies.add(dataset.semanticFixtureFamily);
  const materialized = await loadDataset(dataset);
  materializedById.set(dataset.id, materialized);
  assert(dataset.knownAnswers.length > 0, `dataset ${dataset.id}: known answers required`);
  for (const answer of dataset.knownAnswers) {
    assert(answer.verification, `dataset ${dataset.id}.${answer.id}: structured verification required`);
    const context = `dataset ${dataset.id}.${answer.id}`;
    validateRecipe(answer.verification, dataset, context);
    const actual = evaluate(answer.verification, materialized, context);
    assertExpected(actual, answer, context);
    verifiedAnswers += 1;
  }
}

assert(
  requiredFamilies.every((family) => seenFamilies.has(family)) && seenFamilies.size === requiredFamilies.length,
  `PT2B semantic family coverage mismatch: ${[...seenFamilies].sort().join(', ')}`,
);

const fixtureById = new Map(fixtures.map((dataset) => [dataset.id, dataset]));
const variants = catalog.datasets.filter((dataset) => dataset.metamorphicRelation);
const relationKindsByBase = new Map();
for (const variant of variants) {
  const relation = variant.metamorphicRelation;
  const base = fixtureById.get(relation.baseDatasetId);
  assert(base, `dataset ${variant.id}: relation must target a direct PT2B semantic fixture`);
  const kinds = relationKindsByBase.get(base.id) ?? new Set();
  assert(!kinds.has(relation.kind), `dataset ${variant.id}: duplicate ${relation.kind} variant for ${base.id}`);
  kinds.add(relation.kind);
  relationKindsByBase.set(base.id, kinds);

  const variantMaterialized = await loadDataset(variant);
  materializedById.set(variant.id, variantMaterialized);
  validateMetamorphicStructure(base, variant, materializedById.get(base.id), variantMaterialized);
  for (const answerId of relation.preservedKnownAnswerIds) {
    const answer = base.knownAnswers.find((candidate) => candidate.id === answerId);
    assert(answer, `dataset ${variant.id}: unknown preserved answer ${answerId}`);
    const context = `dataset ${variant.id} preserves ${base.id}.${answer.id}`;
    validateRecipe(answer.verification, variant, context);
    const actual = evaluate(answer.verification, variantMaterialized, context);
    assertExpected(actual, answer, context);
    verifiedMetamorphicAnswers += 1;
  }
}

assert(variants.length === fixtures.length * 2, `PT2C variant count mismatch: ${variants.length}`);
for (const fixture of fixtures) {
  const kinds = relationKindsByBase.get(fixture.id) ?? new Set();
  assert(
    kinds.size === 2 && kinds.has('row-permutation') && kinds.has('irrelevant-column-addition'),
    `dataset ${fixture.id}: both direct PT2C variants are required`,
  );
}

const expectationDatasets = catalog.datasets.filter((dataset) => dataset.representationExpectation);
assert(expectationDatasets.length === 1, `PT2C requires exactly one representation expectation, found ${expectationDatasets.length}`);
const nilDataset = expectationDatasets[0];
const nilMaterialized = await loadDataset(nilDataset);
materializedById.set(nilDataset.id, nilMaterialized);
const nilActualByAnswerId = new Map();
for (const answer of nilDataset.knownAnswers) {
  const context = `dataset ${nilDataset.id}.${answer.id}`;
  validateRecipe(answer.verification, nilDataset, context);
  const actual = evaluate(answer.verification, nilMaterialized, context);
  assertExpected(actual, answer, context);
  nilActualByAnswerId.set(answer.id, actual);
  verifiedAnswers += 1;
}
const expectation = nilDataset.representationExpectation;
assert(expectation.expectedOutcome === 'NIL', `dataset ${nilDataset.id}: expected outcome must remain NIL`);
assert(expectation.evidenceStatus === 'requires-production-path', `dataset ${nilDataset.id}: corpus cannot claim product-path verification`);
assert(expectation.task === 'simultaneous-individual-inspection', `dataset ${nilDataset.id}: NIL task must remain scoped`);
assert(expectation.observationLevel === 'individual', `dataset ${nilDataset.id}: individual observation level required`);
assertSameEncoded(expectation.requiredInformation, ['individual-observation-identity'], `dataset ${nilDataset.id}: required information`);
for (const basisId of expectation.basisKnownAnswerIds) {
  assert(nilActualByAnswerId.has(basisId), `dataset ${nilDataset.id}: unverified NIL basis ${basisId}`);
  assert(
    nilActualByAnswerId.get(basisId) > (
      expectation.constraints.maxConcurrentElements * expectation.constraints.maxObservationIdentitiesPerElement
    ),
    `dataset ${nilDataset.id}: NIL basis ${basisId} does not exceed simultaneous identity capacity`,
  );
}

const aggregate = fixtures.find((dataset) => dataset.semanticFixtureFamily === 'aggregate');
const graph = fixtures.find((dataset) => dataset.semanticFixtureFamily === 'source-relationship-graph');
assert(aggregate && graph, 'PT2B aggregate and graph fixtures required for negative self-tests');

await expectFailure('tampered expected quantity', async () => {
  const answer = structuredClone(aggregate.knownAnswers.find((candidate) => candidate.id === 'total-sum'));
  answer.expected += 1;
  const actual = evaluate(answer.verification, materializedById.get(aggregate.id), 'tampered aggregate');
  assertExpected(actual, answer, 'tampered aggregate');
});
await expectFailure('unknown verification operation', async () => {
  validateRecipe({ operation: 'invented-statistic' }, aggregate, 'unknown operation');
});
await expectFailure('graph edge with unknown endpoint', async () => {
  const tampered = structuredClone(materializedById.get(graph.id).graph);
  tampered.edges[0].target = 'missing-node';
  validateGraphDataset(tampered, graph);
});
await expectFailure('graph durable node identity drift', async () => {
  const materialized = structuredClone(materializedById.get(graph.id));
  materialized.graph.rows[0].node_id = 'drifted-node-id';
  materialized.rows = materialized.graph.rows;
  const answer = graph.knownAnswers.find((candidate) => candidate.id === 'durable-node-identity');
  const actual = evaluate(answer.verification, materialized, 'node identity drift');
  assertExpected(actual, answer, 'node identity drift');
});
await expectFailure('unknown tolerance kind', async () => {
  const answer = structuredClone(aggregate.knownAnswers.find((candidate) => candidate.id === 'total-sum'));
  answer.tolerance = { kind: 'silent-fallback' };
  assertExpected(2500, answer, 'unknown tolerance');
});
await expectFailure('irrelevant verification property', async () => {
  validateRecipe({ operation: 'sum', field: 'value', fields: ['value'] }, aggregate, 'irrelevant property');
});
await expectFailure('exact tolerance with ignored bound', async () => {
  const answer = structuredClone(aggregate.knownAnswers.find((candidate) => candidate.id === 'total-sum'));
  answer.tolerance.value = 0;
  assertExpected(2500, answer, 'ignored exact bound');
});

const aggregatePermutation = variants.find((dataset) => (
  dataset.metamorphicRelation.baseDatasetId === aggregate.id &&
  dataset.metamorphicRelation.kind === 'row-permutation'
));
const aggregateIrrelevant = variants.find((dataset) => (
  dataset.metamorphicRelation.baseDatasetId === aggregate.id &&
  dataset.metamorphicRelation.kind === 'irrelevant-column-addition'
));
const graphPermutation = variants.find((dataset) => (
  dataset.metamorphicRelation.baseDatasetId === graph.id &&
  dataset.metamorphicRelation.kind === 'row-permutation'
));
assert(aggregatePermutation && aggregateIrrelevant && graphPermutation, 'PT2C negative-test variants required');

await expectFailure('metamorphic base digest drift', async () => {
  const variant = structuredClone(aggregatePermutation);
  variant.metamorphicRelation.baseContentDigest = 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  validateMetamorphicStructure(
    aggregate,
    variant,
    materializedById.get(aggregate.id),
    materializedById.get(aggregatePermutation.id),
  );
});
await expectFailure('row permutation changes a complete row', async () => {
  const materialized = structuredClone(materializedById.get(aggregatePermutation.id));
  materialized.rows[0].value += 1;
  validateMetamorphicStructure(aggregate, aggregatePermutation, materializedById.get(aggregate.id), materialized);
});
await expectFailure('irrelevant column variant changes projected base field', async () => {
  const materialized = structuredClone(materializedById.get(aggregateIrrelevant.id));
  materialized.rows[0].group = 'drifted-group';
  validateMetamorphicStructure(aggregate, aggregateIrrelevant, materializedById.get(aggregate.id), materialized);
});
await expectFailure('graph permutation drifts durable row ID pairing', async () => {
  const materialized = structuredClone(materializedById.get(graphPermutation.id));
  [materialized.graph.rowIds[0], materialized.graph.rowIds[1]] = [materialized.graph.rowIds[1], materialized.graph.rowIds[0]];
  materialized.rows = materialized.graph.rows;
  validateMetamorphicStructure(graph, graphPermutation, materializedById.get(graph.id), materialized);
});
await expectFailure('NIL constraint does not exclude individual representation', async () => {
  const altered = structuredClone(nilDataset);
  altered.representationExpectation.constraints.maxConcurrentElements = 1000;
  const basis = altered.representationExpectation.basisKnownAnswerIds[0];
  assert(
    nilActualByAnswerId.get(basis) > (
      altered.representationExpectation.constraints.maxConcurrentElements *
      altered.representationExpectation.constraints.maxObservationIdentitiesPerElement
    ),
    'altered NIL basis does not exceed simultaneous identity capacity',
  );
});

console.log(`verified ${verifiedAnswers} direct known answers across ${fixtures.length} semantic fixture families plus the scoped NIL fixture`);
console.log(`verified ${verifiedMetamorphicAnswers} preserved-answer executions across ${variants.length} metamorphic variants`);
console.log('negative known-answer self-tests: 12 passed');
