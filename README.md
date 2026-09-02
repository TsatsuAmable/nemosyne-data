# nemosyne-data

Canonical public, synthetic and known-answer corpus for [nemosyne.world](https://nemosyne.world).

This repository is deliberately independent from Nemosyne production code. It provides datasets, provenance and expected facts that can challenge Nemosyne's ingestion, analytical and representation behavior without importing the implementation under test.

## Validation

Requires Node.js 22 or newer and no package dependencies:

```bash
npm run validate
```

Validation checks the machine-readable contract in `manifests/catalog.schema.json`, canonical repository-path confinement, dataset/artifact identity, byte and row counts, SHA-256 values, declared CSV and graph DatasetJSON fields, governed dataset content digests, source-manifest alignment, independently recomputed known answers, and fail-closed negative contract cases.

The PT2B known-answer fixtures can be regenerated deterministically with:

```bash
npm run generate:known-answers
```

After regeneration, `npm run validate` must pass and the generated artifact paths must have no diff. Catalogue byte counts and digests are deliberate governed identity and are not rewritten automatically by the generator.

## Governance states

- `candidate`: a listed source or planned dataset that is not yet admissible as governed evidence. Candidates cannot claim a governed `contentDigest`.
- `governed`: a materialized dataset with exact artifact identity, declared measurement semantics, provenance, privacy/licensing metadata and intended uses.
- `retired`: retained for history/compatibility but not selected for new evidence.

A catalogue entry is not evidence merely because it exists. Consumers should require `governanceState === "governed"` when they need qualified corpus evidence.

## Dataset identity

Each governed dataset has a stable `id`, semantic `datasetVersion`, and aggregate `contentDigest`. The digest is SHA-256 over artifact identity records sorted by repository path:

```text
<path>\0<artifact-sha256>\n
```

The stored form is `sha256:<hex>`.

## Measurement semantics

The v2 contract keeps three separate questions separate:

- `storageType`: how a value is encoded, such as integer, number, string, boolean or timestamp;
- `measurementScale`: which scale-level operations are defensible, currently `none`, `nominal`, `ordinal`, `interval` or `ratio`;
- `semanticType`: what domain semantics the field carries, currently identifier, categorical, quantitative, temporal, circular, compositional-part or geospatial-coordinate.

These axes are deliberately orthogonal. A timestamp can have temporal semantics while using an interval scale; a cluster label can be stored as an integer while remaining nominal categorical data. Consumers must not infer scientific permissions from storage representation alone.

## Known answers

Known-answer claims must declare an expected value, tolerance, authority class and derivation note. A dataset designated with `semanticFixtureFamily` must additionally provide a structured verification recipe for every expected answer. The independent validator executes each recipe against committed artifact bytes without importing Nemosyne production code.

PT2B provides one governed fixture for each currently verified semantic family:

- exact grouped counts and sums for aggregate verification;
- an exact discrete empirical distribution with explicit R7 quantiles;
- two controlled occupied coordinates for bounded binned-density verification, without claiming a continuous probability density;
- explicit source-partition labels with exact membership and coordinate means;
- durable graph DatasetJSON containing row IDs and exact source edges. This is the authoritative serialization shape, not the ordinary row-array JSON import shape; application integration must use an edge-preserving registration path.

These family designations identify bounded corpus truth. They do not require Moneta to select a representation independently of task, requirements or resource limits. Metamorphic variants and the explicit NIL/abstention fixture remain later PT2 work tracked by `TsatsuAmable/nemosyne-data#3`.
