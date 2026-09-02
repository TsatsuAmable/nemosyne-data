import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const catalog = JSON.parse(await readFile(resolve(ROOT, 'manifests/catalog.json'), 'utf8'));

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function parseCsv(text, context) {
  assert(!text.includes('"'), `${context}: reference verifier supports controlled unquoted CSV fixtures only`);
  const lines = text.trimEnd().split(/\r?\n/);
  const header = lines.shift()?.split(',') ?? [];
  const rows = lines.map((line, index) => {
    const values = line.split(',');
    assert(values.length === header.length, `${context}: row ${index + 2} has ${values.length} fields; expected ${header.length}`);
    return Object.fromEntries(header.map((name, column) => [name, values[column]]));
  });
  return { header, rows };
}

function numeric(rows, field, context) {
  return rows.map((row, index) => {
    assert(Object.hasOwn(row, field), `${context}: missing field ${field}`);
    const value = Number(row[field]);
    assert(Number.isFinite(value), `${context}: non-numeric value in ${field} at data row ${index + 1}`);
    return value;
  });
}

function sortedObject(entries) {
  return Object.fromEntries([...entries].sort(([a], [b]) => a.localeCompare(b)));
}

function quantileR7(values, probability) {
  const sorted = [...values].sort((a, b) => a - b);
  assert(sorted.length > 0, 'quantile-r7 requires at least one value');
  const h = (sorted.length - 1) * probability;
  const lower = Math.floor(h);
  const upper = Math.ceil(h);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (h - lower) * (sorted[upper] - sorted[lower]);
}

function compare(value, operator, threshold) {
  switch (operator) {
    case 'gt': return value > threshold;
    case 'gte': return value >= threshold;
    case 'lt': return value < threshold;
    case 'lte': return value <= threshold;
    case 'eq': return value === threshold;
    default: fail(`unsupported comparison operator: ${operator}`);
  }
}

function execute(check, rows, context) {
  switch (check.operation) {
    case 'row-count':
      return rows.length;
    case 'distinct-count':
      return new Set(rows.map((row) => row[check.field])).size;
    case 'sum':
      return numeric(rows, check.field, context).reduce((sum, value) => sum + value, 0);
    case 'mean': {
      const values = numeric(rows, check.field, context);
      assert(values.length > 0, `${context}: mean requires at least one value`);
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
    case 'group-sum': {
      const groups = new Map();
      for (const row of rows) {
        assert(Object.hasOwn(row, check.groupBy), `${context}: missing group field ${check.groupBy}`);
        assert(Object.hasOwn(row, check.field), `${context}: missing value field ${check.field}`);
        const value = Number(row[check.field]);
        assert(Number.isFinite(value), `${context}: non-numeric group-sum value in ${check.field}`);
        groups.set(row[check.groupBy], (groups.get(row[check.groupBy]) ?? 0) + value);
      }
      return sortedObject(groups.entries());
    }
    case 'population-variance': {
      const values = numeric(rows, check.field, context);
      assert(values.length > 0, `${context}: population-variance requires at least one value`);
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    }
    case 'quantile-r7':
      assert(typeof check.probability === 'number' && check.probability >= 0 && check.probability <= 1, `${context}: quantile-r7 probability must be in [0, 1]`);
      return quantileR7(numeric(rows, check.field, context), check.probability);
    case 'tail-count':
      return numeric(rows, check.field, context).filter((value) => compare(value, check.operator, check.threshold)).length;
    default:
      fail(`${context}: unsupported reference operation ${check.operation}`);
  }
}

function deepEqual(actual, expected) {
  if (typeof actual === 'number' && typeof expected === 'number') return Object.is(actual, expected) || actual === expected;
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function withinTolerance(actual, expected, tolerance) {
  if (tolerance.kind === 'exact') return deepEqual(actual, expected);
  assert(typeof actual === 'number' && typeof expected === 'number', `${tolerance.kind} tolerance requires numeric actual/expected values`);
  if (tolerance.kind === 'absolute') return Math.abs(actual - expected) <= tolerance.value;
  if (tolerance.kind === 'relative') {
    if (expected === 0) return Math.abs(actual) <= tolerance.value;
    return Math.abs(actual - expected) / Math.abs(expected) <= tolerance.value;
  }
  fail(`unsupported tolerance kind ${tolerance.kind}`);
}

let datasetsVerified = 0;
let checksVerified = 0;

for (const dataset of catalog.datasets) {
  const checks = (dataset.knownAnswers ?? []).filter((answer) => answer.verification);
  if (checks.length === 0) continue;

  assert(dataset.governanceState === 'governed', `${dataset.id}: machine-verifiable known answers require governed dataset state`);
  const primaryArtifacts = dataset.artifacts.filter((artifact) => artifact.role === 'primary');
  assert(primaryArtifacts.length === 1, `${dataset.id}: reference verification requires exactly one primary artifact`);
  const artifact = primaryArtifacts[0];
  assert(artifact.format === 'csv', `${dataset.id}: PT2B reference verifier currently supports CSV primary artifacts only`);

  const text = await readFile(resolve(ROOT, artifact.path), 'utf8');
  const { rows } = parseCsv(text, `${dataset.id}/${artifact.path}`);

  for (const answer of checks) {
    const actual = execute(answer.verification, rows, `${dataset.id}/${answer.id}`);
    assert(
      withinTolerance(actual, answer.expected, answer.tolerance),
      `${dataset.id}/${answer.id}: expected ${JSON.stringify(answer.expected)} under ${JSON.stringify(answer.tolerance)}, got ${JSON.stringify(actual)}`,
    );
    checksVerified += 1;
  }
  datasetsVerified += 1;
}

assert(datasetsVerified > 0, 'no machine-verifiable known-answer datasets found');
console.log(`independently verified ${checksVerified} known answers across ${datasetsVerified} governed datasets`);
