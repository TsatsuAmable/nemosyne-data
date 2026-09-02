# nemosyne-data

Canonical public, synthetic and known-answer corpus for [nemosyne.world](https://nemosyne.world).

This repository is deliberately independent from Nemosyne production code. It provides datasets, provenance and expected facts that can challenge Nemosyne's ingestion, analytical and representation behavior without importing the implementation under test.

## Validation

Requires Node.js 22 or newer and no package dependencies:

```bash
npm run validate
```

Validation checks the machine-readable contract in `manifests/catalog.schema.json`, repository-path confinement, dataset/artifact identity, byte and row counts, SHA-256 values, declared CSV fields, governed dataset content digests, and a set of fail-closed negative contract cases.

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

The v2 contract records storage type separately from measurement scale. Supported scales currently include identifier, nominal, ordinal, interval, ratio, circular, temporal, compositional and geospatial. This prevents consumers from treating a CSV number as permission to apply arbitrary numerical operations.

## Known answers

Known-answer claims, when present, must declare an expected value, tolerance, authority class and derivation note. Expected values must not be copied from Nemosyne production output. Later PT2 tranches add the aggregate, distribution, density, cluster, relationship-graph, metamorphic and explicit NIL/abstention families tracked by `TsatsuAmable/nemosyne-data#3`.
