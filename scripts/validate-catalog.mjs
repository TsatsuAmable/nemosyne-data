import { createHash } from 'node:crypto';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const REAL_ROOT = await realpath(ROOT);
const catalogPath = resolve(ROOT, 'manifests/catalog.json');
const schemaPath = resolve(ROOT, 'manifests/catalog.schema.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));

const datasetSchema = schema.$defs?.dataset;
const fieldSchema = schema.$defs?.field;
const knownAnswerSchema = schema.$defs?.knownAnswer;
const knownAnswerVerificationSchema = schema.$defs?.knownAnswerVerification;
const metamorphicRelationSchema = schema.$defs?.metamorphicRelation;
const representationExpectationSchema = schema.$defs?.representationExpectation;
const toleranceSchema = schema.$defs?.tolerance;
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

function assertUniqueStrings(values, context) {
  assert(Array.isArray(values), `${context}: array required`);
  assert(new Set(values).size === values.length, `${context}: duplicate values are not allowed`);
}

function assertOnlyProperties(value, allowed, context) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  assert(unknown.length === 0, `${context}: unknown properties ${unknown.join(', ')}`);
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
  const canonical = await realpath(path);
  assert(canonical.startsWith(`${REAL_ROOT}${sep}`), `${context}: canonical path escapes repository root`);
  return { path, metadata };
}

function validateTolerance(tolerance, context) {
  required(tolerance, toleranceSchema.required, context);
  assertEnum(tolerance.kind, enumValues(toleranceSchema, 'kind'), `${context}.kind`);
  assertOnlyProperties(
    tolerance,
    tolerance.kind === 'exact' ? ['kind'] : ['kind', 'value'],
    context,
  );
  if (tolerance.kind === 'absolute' || tolerance.kind === 'relative') {
    assert(typeof tolerance.value === 'number' && Number.isFinite(tolerance.value) && tolerance.value >= 0, `${context}.value must be a finite non-negative number`);
  }
}

function validateKnownAnswerVerification(verification, fieldNames, context) {
  required(verification, knownAnswerVerificationSchema.required, context);
  assertEnum(
    verification.operation,
    enumValues(knownAnswerVerificationSchema, 'operation'),
    `${context}.operation`,
  );
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
  assertOnlyProperties(verification, allowedPropertiesByOperation[verification.operation], context);

  const requireField = (name) => {
    assert(typeof verification[name] === 'string' && verification[name].length > 0, `${context}.${name} is required`);
    assert(fieldNames.has(verification[name]), `${context}.${name} names unknown field ${verification[name]}`);
  };
  const requireFields = () => {
    assert(Array.isArray(verification.fields) && verification.fields.length > 0, `${context}.fields must be non-empty`);
    assertUniqueStrings(verification.fields, `${context}.fields`);
    for (const field of verification.fields) {
      assert(fieldNames.has(field), `${context}.fields names unknown field ${field}`);
    }
  };

  if (['distinct-count', 'sum', 'mean', 'range', 'quantile-r7', 'graph-row-id-field-alignment'].includes(verification.operation)) {
    requireField('field');
  }
  if (verification.operation === 'quantile-r7') {
    assert(
      typeof verification.probability === 'number' &&
      Number.isFinite(verification.probability) &&
      verification.probability >= 0 &&
      verification.probability <= 1,
      `${context}.probability must be finite and in [0, 1]`,
    );
  }
  if (verification.operation === 'group-counts' || verification.operation === 'group-means') {
    requireFields();
  }
  if (verification.operation === 'group-sums' || verification.operation === 'group-means') {
    requireField('groupBy');
  }
  if (verification.operation === 'group-sums') {
    requireField('field');
  }
}

function validateMetamorphicRelation(relation, context) {
  required(relation, metamorphicRelationSchema.required, context);
  assertOnlyProperties(relation, Object.keys(metamorphicRelationSchema.properties), context);
  assertPattern(relation.baseDatasetId, metamorphicRelationSchema.properties.baseDatasetId.pattern, `${context}.baseDatasetId`);
  assertPattern(relation.baseContentDigest, metamorphicRelationSchema.properties.baseContentDigest.pattern, `${context}.baseContentDigest`);
  assertEnum(relation.kind, enumValues(metamorphicRelationSchema, 'kind'), `${context}.kind`);
  assert(Array.isArray(relation.preservedKnownAnswerIds) && relation.preservedKnownAnswerIds.length > 0, `${context}.preservedKnownAnswerIds must be non-empty`);
  assertUniqueStrings(relation.preservedKnownAnswerIds, `${context}.preservedKnownAnswerIds`);
  if (relation.kind === 'irrelevant-column-addition') {
    assert(Array.isArray(relation.addedFields) && relation.addedFields.length > 0, `${context}.addedFields must be non-empty`);
    assertUniqueStrings(relation.addedFields, `${context}.addedFields`);
  } else {
    assert(!Object.hasOwn(relation, 'addedFields'), `${context}: row permutation cannot declare addedFields`);
  }
}

function validateRepresentationExpectation(expectation, context) {
  required(expectation, representationExpectationSchema.required, context);
  assertOnlyProperties(expectation, Object.keys(representationExpectationSchema.properties), context);
  assertPattern(expectation.id, representationExpectationSchema.properties.id.pattern, `${context}.id`);
  assert(expectation.kind === representationExpectationSchema.properties.kind.const, `${context}.kind mismatch`);
  assert(expectation.task === representationExpectationSchema.properties.task.const, `${context}.task mismatch`);
  assert(expectation.observationLevel === representationExpectationSchema.properties.observationLevel.const, `${context}.observationLevel mismatch`);
  assert(expectation.expectedOutcome === representationExpectationSchema.properties.expectedOutcome.const, `${context}.expectedOutcome mismatch`);
  assert(expectation.evidenceStatus === representationExpectationSchema.properties.evidenceStatus.const, `${context}.evidenceStatus mismatch`);
  assert(typeof expectation.rationale === 'string' && expectation.rationale.length > 0, `${context}.rationale required`);
  assertUniqueStrings(expectation.requiredInformation, `${context}.requiredInformation`);
  assert(
    expectation.requiredInformation.length === 1 && expectation.requiredInformation[0] === 'individual-observation-identity',
    `${context}.requiredInformation must preserve individual observation identity`,
  );
  required(expectation.constraints, representationExpectationSchema.properties.constraints.required, `${context}.constraints`);
  assertOnlyProperties(expectation.constraints, ['maxConcurrentElements', 'maxObservationIdentitiesPerElement'], `${context}.constraints`);
  assert(Number.isSafeInteger(expectation.constraints.maxConcurrentElements) && expectation.constraints.maxConcurrentElements >= 1, `${context}.constraints.maxConcurrentElements must be a positive safe integer`);
  assert(expectation.constraints.maxObservationIdentitiesPerElement === 1, `${context}.constraints.maxObservationIdentitiesPerElement must be exactly one`);
  assert(Array.isArray(expectation.basisKnownAnswerIds) && expectation.basisKnownAnswerIds.length > 0, `${context}.basisKnownAnswerIds must be non-empty`);
  assertUniqueStrings(expectation.basisKnownAnswerIds, `${context}.basisKnownAnswerIds`);
}

function validateShape(candidateCatalog) {
  required(candidateCatalog, schema.required, 'catalog');
  assert(candidateCatalog.schemaVersion === schema.properties.schemaVersion.const, `schemaVersion must be ${schema.properties.schemaVersion.const}`);
  assert(candidateCatalog.repository === schema.properties.repository.const, 'repository identity mismatch');
  assert(typeof candidateCatalog.corpusVersion === 'string' && candidateCatalog.corpusVersion.length > 0, 'corpusVersion is required');
  assert(Array.isArray(candidateCatalog.datasets), 'catalog.datasets must be an array');

  const ids = new Set();
  const semanticFixtureFamilies = new Set();
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
    if (dataset.semanticFixtureFamily) {
      assertEnum(
        dataset.semanticFixtureFamily,
        enumValues(datasetSchema, 'semanticFixtureFamily'),
        `${context}.semanticFixtureFamily`,
      );
      assert(
        !semanticFixtureFamilies.has(dataset.semanticFixtureFamily),
        `${context}: duplicate semantic fixture family ${dataset.semanticFixtureFamily}`,
      );
      semanticFixtureFamilies.add(dataset.semanticFixtureFamily);
    }
    if (dataset.metamorphicRelation) {
      validateMetamorphicRelation(dataset.metamorphicRelation, `${context}.metamorphicRelation`);
    }
    if (dataset.representationExpectation) {
      validateRepresentationExpectation(dataset.representationExpectation, `${context}.representationExpectation`);
    }
    assert(Array.isArray(dataset.intendedUses) && dataset.intendedUses.length > 0, `${context}: intendedUses must be non-empty`);
    assertUniqueStrings(dataset.intendedUses, `${context}.intendedUses`);
    assert(Array.isArray(dataset.plannedTiers) && dataset.plannedTiers.length > 0, `${context}: plannedTiers must be non-empty`);
    assertUniqueStrings(dataset.plannedTiers, `${context}.plannedTiers`);
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
      assertEnum(field.semanticType, enumValues(fieldSchema, 'semanticType'), `${context}.${field.name}.semanticType`);
      assert(typeof field.nullable === 'boolean', `${context}.${field.name}.nullable must be boolean`);
    }

    const knownAnswerIds = new Set();
    for (const knownAnswer of dataset.knownAnswers ?? []) {
      required(knownAnswer, knownAnswerSchema.required, `${context}.knownAnswer`);
      assert(!knownAnswerIds.has(knownAnswer.id), `${context}: duplicate known-answer id ${knownAnswer.id}`);
      knownAnswerIds.add(knownAnswer.id);
      assertEnum(knownAnswer.authority, enumValues(knownAnswerSchema, 'authority'), `${context}.${knownAnswer.id}.authority`);
      validateTolerance(knownAnswer.tolerance, `${context}.${knownAnswer.id}.tolerance`);
      if (knownAnswer.verification) {
        validateKnownAnswerVerification(
          knownAnswer.verification,
          fieldNames,
          `${context}.${knownAnswer.id}.verification`,
        );
      }
    }

    const artifactPaths = new Set();
    for (const artifact of dataset.artifacts) {
      required(artifact, artifactSchema.required, `${context}.artifact`);
      assert(!artifactPaths.has(artifact.path), `${context}: duplicate artifact path ${artifact.path}`);
      artifactPaths.add(artifact.path);
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

    if (dataset.semanticFixtureFamily) {
      assert(dataset.governanceState === 'governed', `${context}: semantic fixture must be governed`);
      assert((dataset.knownAnswers ?? []).length > 0, `${context}: semantic fixture must declare known answers`);
      assert(
        dataset.knownAnswers.every((answer) => answer.verification),
        `${context}: every semantic-fixture known answer requires structured verification`,
      );
      assert(
        dataset.artifacts.filter((artifact) => artifact.role === 'primary').length === 1,
        `${context}: semantic fixture requires exactly one primary artifact`,
      );
    }
    if (dataset.metamorphicRelation) {
      assert(!dataset.semanticFixtureFamily, `${context}: metamorphic variant cannot be a semantic-family authority`);
      assert(dataset.governanceState === 'governed', `${context}: metamorphic variant must be governed`);
      assert((dataset.knownAnswers ?? []).length === 0, `${context}: metamorphic variant inherits scoped answers instead of redefining them`);
      assert(dataset.provenance.transformations.length > 0, `${context}: metamorphic variant must declare its transformation`);
      assert(
        dataset.artifacts.filter((artifact) => artifact.role === 'primary').length === 1,
        `${context}: metamorphic variant requires exactly one primary artifact`,
      );
    }
    if (dataset.representationExpectation) {
      assert(dataset.governanceState === 'governed', `${context}: representation expectation requires a governed dataset`);
      assert((dataset.knownAnswers ?? []).length > 0, `${context}: representation expectation requires known-answer basis`);
    }
  }

  for (const family of enumValues(datasetSchema, 'semanticFixtureFamily')) {
    assert(semanticFixtureFamilies.has(family), `catalog: missing semantic fixture family ${family}`);
  }

  const byId = new Map(candidateCatalog.datasets.map((dataset) => [dataset.id, dataset]));
  const relationKeys = new Set();
  for (const dataset of candidateCatalog.datasets.filter((entry) => entry.metamorphicRelation)) {
    const context = `dataset ${dataset.id}.metamorphicRelation`;
    const relation = dataset.metamorphicRelation;
    const base = byId.get(relation.baseDatasetId);
    assert(base?.semanticFixtureFamily, `${context}: base must be a direct PT2B semantic-family fixture`);
    assert(base.contentDigest === relation.baseContentDigest, `${context}: baseContentDigest does not pin current base bytes`);
    assert(dataset.kind === base.kind, `${context}: kind must match base dataset`);
    assert(dataset.topology === base.topology, `${context}: topology must match base dataset`);
    assert(dataset.privacy === base.privacy, `${context}: privacy classification must match base dataset`);
    assert(dataset.license.status === base.license.status && dataset.license.name === base.license.name, `${context}: licence must match base dataset`);
    const baseAnswerIds = base.knownAnswers.map((answer) => answer.id).sort();
    assert(
      JSON.stringify([...relation.preservedKnownAnswerIds].sort()) === JSON.stringify(baseAnswerIds),
      `${context}: preservedKnownAnswerIds must name every base answer exactly once`,
    );
    const key = `${base.id}:${relation.kind}`;
    assert(!relationKeys.has(key), `${context}: duplicate direct variant ${key}`);
    relationKeys.add(key);

    const baseFields = base.measurementSchema.fields;
    const variantFields = dataset.measurementSchema.fields;
    if (relation.kind === 'row-permutation') {
      assert(JSON.stringify(variantFields) === JSON.stringify(baseFields), `${context}: row permutation must preserve measurement schema exactly`);
    } else {
      assert(variantFields.length === baseFields.length + relation.addedFields.length, `${context}: irrelevant-column schema size mismatch`);
      assert(JSON.stringify(variantFields.slice(0, baseFields.length)) === JSON.stringify(baseFields), `${context}: irrelevant-column variant changed base field semantics`);
      assert(
        JSON.stringify(variantFields.slice(baseFields.length).map((field) => field.name)) === JSON.stringify(relation.addedFields),
        `${context}: addedFields do not match appended measurement fields`,
      );
    }

    const basePrimary = base.artifacts.find((artifact) => artifact.role === 'primary');
    const variantPrimary = dataset.artifacts.find((artifact) => artifact.role === 'primary');
    assert(variantPrimary.format === basePrimary.format, `${context}: artifact format must match base`);
  }

  for (const base of candidateCatalog.datasets.filter((dataset) => dataset.semanticFixtureFamily)) {
    for (const kind of enumValues(metamorphicRelationSchema, 'kind')) {
      assert(relationKeys.has(`${base.id}:${kind}`), `catalog: missing ${kind} variant for ${base.id}`);
    }
  }

  const expectationDatasets = candidateCatalog.datasets.filter((dataset) => dataset.representationExpectation);
  assert(expectationDatasets.length === 1, 'catalog: exactly one PT2C representation expectation required');
  const expectationDataset = expectationDatasets[0];
  const answerIds = new Set(expectationDataset.knownAnswers.map((answer) => answer.id));
  for (const basisId of expectationDataset.representationExpectation.basisKnownAnswerIds) {
    assert(answerIds.has(basisId), `dataset ${expectationDataset.id}: unknown representation-expectation basis ${basisId}`);
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
    } else if (artifact.format === 'json' && dataset.topology === 'GRAPH') {
      const value = JSON.parse(bytes.toString('utf8'));
      assert(Array.isArray(value.columns), `${context}: graph DatasetJSON columns required`);
      assert(Array.isArray(value.rows), `${context}: graph DatasetJSON rows required`);
      assert(Array.isArray(value.rowIds), `${context}: graph DatasetJSON rowIds required`);
      assert(Array.isArray(value.edges), `${context}: graph DatasetJSON edges required`);
      assert(value.rows.length === artifact.rows, `${context}: graph DatasetJSON row count mismatch`);
      assert(value.rowIds.length === value.rows.length, `${context}: graph DatasetJSON rowIds length mismatch`);
      assert(new Set(value.rowIds).size === value.rowIds.length, `${context}: graph DatasetJSON rowIds must be unique`);
      const declared = dataset.measurementSchema.fields.map((field) => field.name);
      assert(
        JSON.stringify(value.columns.map((column) => column.name)) === JSON.stringify(declared),
        `${context}: graph DatasetJSON columns do not match declared measurement fields`,
      );
      const columnTypes = new Set(['NUMERIC', 'CATEGORICAL', 'TEMPORAL', 'TEXT', 'UNKNOWN']);
      assert(
        value.columns.every((column) => columnTypes.has(column.type)),
        `${context}: graph DatasetJSON column type is invalid`,
      );
      for (const [index, row] of value.rows.entries()) {
        assert(row && typeof row === 'object' && !Array.isArray(row), `${context}: graph row ${index} must be an object`);
        assert(
          Object.keys(row).length === declared.length && declared.every((field) => Object.hasOwn(row, field)),
          `${context}: graph row ${index} fields do not match declared measurement fields`,
        );
        for (const field of dataset.measurementSchema.fields) {
          const cell = row[field.name];
          if (cell === null) {
            assert(field.nullable, `${context}: graph row ${index}.${field.name} is unexpectedly null`);
          } else if (field.storageType === 'integer') {
            assert(Number.isSafeInteger(cell), `${context}: graph row ${index}.${field.name} must be a safe integer`);
          } else if (field.storageType === 'number') {
            assert(typeof cell === 'number' && Number.isFinite(cell), `${context}: graph row ${index}.${field.name} must be finite numeric`);
          } else if (field.storageType === 'boolean') {
            assert(typeof cell === 'boolean', `${context}: graph row ${index}.${field.name} must be boolean`);
          } else {
            assert(typeof cell === 'string' && cell.length > 0, `${context}: graph row ${index}.${field.name} must be a non-empty string`);
          }
        }
      }
      const rowIds = new Set(value.rowIds);
      const endpointExists = (endpoint) => (
        typeof endpoint === 'string'
          ? rowIds.has(endpoint)
          : Number.isSafeInteger(endpoint) && endpoint >= 0 && endpoint < value.rows.length
      );
      for (const [index, edge] of value.edges.entries()) {
        assert(edge && typeof edge === 'object' && !Array.isArray(edge), `${context}: graph edge ${index} must be an object`);
        assert(endpointExists(edge.source), `${context}: graph edge ${index} has unknown source endpoint`);
        assert(endpointExists(edge.target), `${context}: graph edge ${index} has unknown target endpoint`);
        if (Object.hasOwn(edge, 'weight')) {
          assert(typeof edge.weight === 'number' && Number.isFinite(edge.weight), `${context}: graph edge ${index} weight must be finite`);
        }
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
expectShapeFailure('invalid semantic type', (sample) => {
  sample.datasets[0].measurementSchema.fields[0].semanticType = 'number';
});
expectShapeFailure('duplicate field name', (sample) => {
  sample.datasets[0].measurementSchema.fields[1].name = sample.datasets[0].measurementSchema.fields[0].name;
});
expectShapeFailure('duplicate known-answer id', (sample) => {
  sample.datasets[0].knownAnswers.push({ ...sample.datasets[0].knownAnswers[0] });
});
expectShapeFailure('duplicate artifact path', (sample) => {
  sample.datasets[0].artifacts.push({ ...sample.datasets[0].artifacts[0] });
});
expectShapeFailure('known answer without tolerance', (sample) => {
  delete sample.datasets[0].knownAnswers[0].tolerance;
});
expectShapeFailure('known answer with null tolerance', (sample) => {
  sample.datasets[0].knownAnswers[0].tolerance = null;
});
expectShapeFailure('candidate claims governed digest', (sample) => {
  sample.datasets.at(-1).contentDigest = 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
});
expectShapeFailure('artifact path traversal', (sample) => {
  sample.datasets[0].artifacts[0].path = '../outside.csv';
});
expectShapeFailure('unknown known-answer verification operation', (sample) => {
  sample.datasets.find((dataset) => dataset.semanticFixtureFamily).knownAnswers[0].verification.operation = 'invented-statistic';
});
expectShapeFailure('known-answer verification names unknown field', (sample) => {
  const dataset = sample.datasets.find((candidate) => candidate.semanticFixtureFamily === 'aggregate');
  dataset.knownAnswers.find((answer) => answer.id === 'total-sum').verification.field = 'missing_field';
});
expectShapeFailure('known-answer verification carries unknown property', (sample) => {
  const dataset = sample.datasets.find((candidate) => candidate.semanticFixtureFamily === 'aggregate');
  dataset.knownAnswers[0].verification.silentFallback = true;
});
expectShapeFailure('known-answer verification carries irrelevant property', (sample) => {
  const dataset = sample.datasets.find((candidate) => candidate.semanticFixtureFamily === 'aggregate');
  dataset.knownAnswers.find((answer) => answer.id === 'total-sum').verification.fields = ['value'];
});
expectShapeFailure('duplicate semantic fixture family', (sample) => {
  const distribution = sample.datasets.find((candidate) => candidate.semanticFixtureFamily === 'empirical-distribution');
  distribution.semanticFixtureFamily = 'aggregate';
});
expectShapeFailure('exact tolerance carries ignored numeric bound', (sample) => {
  const dataset = sample.datasets.find((candidate) => candidate.semanticFixtureFamily === 'aggregate');
  dataset.knownAnswers[0].tolerance.value = 0;
});
expectShapeFailure('metamorphic relation carries stale base digest', (sample) => {
  const variant = sample.datasets.find((dataset) => dataset.metamorphicRelation);
  variant.metamorphicRelation.baseContentDigest = 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
});
expectShapeFailure('metamorphic relation claims unknown preserved answer', (sample) => {
  const variant = sample.datasets.find((dataset) => dataset.metamorphicRelation);
  variant.metamorphicRelation.preservedKnownAnswerIds[0] = 'invented-answer';
});
expectShapeFailure('metamorphic relation targets another variant', (sample) => {
  const variants = sample.datasets.filter((dataset) => dataset.metamorphicRelation);
  variants[0].metamorphicRelation.baseDatasetId = variants[1].id;
  variants[0].metamorphicRelation.baseContentDigest = variants[1].contentDigest;
});
expectShapeFailure('missing direct metamorphic relation', (sample) => {
  const index = sample.datasets.findIndex((dataset) => dataset.metamorphicRelation);
  sample.datasets.splice(index, 1);
});
expectShapeFailure('irrelevant-column schema disagrees with addedFields', (sample) => {
  const variant = sample.datasets.find((dataset) => dataset.metamorphicRelation?.kind === 'irrelevant-column-addition');
  variant.metamorphicRelation.addedFields[0] = 'undeclared_control';
});
expectShapeFailure('representation expectation claims production verification', (sample) => {
  const dataset = sample.datasets.find((candidate) => candidate.representationExpectation);
  dataset.representationExpectation.evidenceStatus = 'verified';
});
expectShapeFailure('representation expectation names unknown basis', (sample) => {
  const dataset = sample.datasets.find((candidate) => candidate.representationExpectation);
  dataset.representationExpectation.basisKnownAnswerIds[0] = 'invented-basis';
});
expectShapeFailure('distinct-count verification omits field', (sample) => {
  const dataset = sample.datasets.find((candidate) => candidate.representationExpectation);
  delete dataset.knownAnswers[0].verification.field;
});

const governed = catalog.datasets.filter((dataset) => dataset.governanceState === 'governed').length;
const candidates = catalog.datasets.filter((dataset) => dataset.governanceState === 'candidate').length;
const artifacts = catalog.datasets.reduce((sum, dataset) => sum + dataset.artifacts.length, 0);
console.log(`validated ${catalog.datasets.length} datasets (${governed} governed, ${candidates} candidate), ${artifacts} materialized artifacts, schema ${catalog.schemaVersion}, corpus ${catalog.corpusVersion}`);
console.log('negative contract self-tests: 26 passed');
