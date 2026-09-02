# PT2A corpus contract adversarial review

**Date:** 2 September 2026  
**Base:** `main@4c69c13dfc10da8d59d88ae5cae5a4d4dfa5779a`  
**Branch:** `feat/pt2a-corpus-contract`  
**Status:** IMPLEMENTATION LANDED / REVIEW ACTIVE

## Purpose

PT2A freezes the machine-readable contract that later known-answer, metamorphic and NIL corpus tranches must satisfy. It does not yet claim the PT2 corpus family set is complete.

The existing repository already verified artifact byte counts, row counts and SHA-256 values, but its dataset semantics were mostly implicit in `manifests/catalog.json` and `scripts/validate-catalog.mjs`. That was insufficient for Nemosyne's scientific boundary because storage type alone does not establish valid operations, candidate real datasets were not distinguished mechanically from governed materialized fixtures, and expected quantities lacked a uniform tolerance/derivation contract.

## Authority boundaries

- `nemosyne-data` owns corpus identity, provenance, measurement semantics, expected quantities and independent fixture truth.
- Nemosyne production code must not be imported to generate or validate expected answers.
- Rust/WASM remains Nemosyne's product analytical authority; this repository exists to challenge it with independently specified evidence.
- A catalogue entry may be a candidate without being promoted to governed evidence.

## PT2A contract

A governed materialized dataset must declare:

- stable dataset ID and semantic dataset version;
- deterministic aggregate content digest over materialized artifact identities;
- source/privacy/licensing state;
- provenance and transformations;
- intended verification/product uses;
- declared storage type, measurement scale and semantic type for every field;
- artifact path, row count, byte count and SHA-256;
- known-answer claims, when present, with expected value, structured tolerance, authority class and derivation note.

Candidate/unmaterialized real datasets may remain in the catalogue, but must be visibly classified as candidates and may not carry a governed content digest before acquisition and review.

## Digest rule

Dataset `contentDigest` is SHA-256 over the UTF-8 concatenation of materialized artifact records sorted lexicographically by path:

`<path>\0<artifact-sha256>\n`

The stored form is `sha256:<hex>`. This digest identifies the exact set of materialized corpus artifacts without pretending it is the digest of any one source file.

## Measurement semantics

Adversarial review found that the first draft incorrectly mixed Stevens-style scale levels with semantic domains. That would have encoded exactly the category error this contract is intended to prevent. The contract was fixed forward into three orthogonal axes:

- `storageType`: integer, number, string, boolean or timestamp;
- `measurementScale`: `none`, nominal, ordinal, interval or ratio;
- `semanticType`: identifier, categorical, quantitative, temporal, circular, compositional-part or geospatial-coordinate.

This permits, for example, a temporal timestamp with interval scale and an integer-encoded cluster label with nominal categorical semantics. Storage representation alone never grants analytical permission.

## Known-answer tolerance semantics

A required field named `tolerance` is not sufficient if it can contain arbitrary JSON. Review tightened tolerance into a structured object with `kind` equal to `exact`, `absolute` or `relative`; absolute and relative tolerances require a finite non-negative numeric `value`. Current closed-form fixtures use `exact`.

## Review findings fixed forward

### 1. Repository-root normalization

The first implementation retained a trailing separator in its repository root and then appended another separator in the lexical confinement check. Review caught the mismatch before promotion and normalized the root with `path.resolve`.

### 2. Symlink escape risk

A lexical `path.resolve` prefix test cannot prevent a repository-controlled parent-directory symlink from resolving outside the repository. The validator now resolves the canonical target with `realpath`, requires it to remain under the canonical repository root, rejects final symlink files and requires regular files.

### 3. Source-manifest identity drift

Merely checking that a source manifest exists would allow a catalogue dataset to point at a manifest describing a different dataset. JSON source manifests now have their declared `datasetId` checked against the catalogue dataset, and declared licence metadata is cross-checked when present.

### 4. Formal schema and executable validator drift

The executable validator reads the core required-field, enum and pattern definitions from the formal JSON Schema rather than duplicating them wholesale. Negative checks cover invalid measurement scale and semantic type, invalid tolerance shape, and duplicate dataset, field, known-answer and artifact identities.

## Falsifiers

Reject or fix forward if any of these are possible:

1. A `governed` dataset passes validation with no materialized artifact.
2. A governed dataset passes with missing measurement semantics.
3. Artifact bytes, row count or SHA-256 can disagree with the repository file while validation remains green.
4. Dataset content digest can disagree with the declared artifact set while validation remains green.
5. Duplicate dataset, field, known-answer or artifact identities pass.
6. A source/artifact path can escape the canonical repository root, including through symlink resolution.
7. A candidate real dataset is silently treated as governed evidence.
8. A known-answer claim can omit or null its tolerance, authority or derivation.
9. The validator imports Nemosyne application/runtime code or requires Nemosyne to compute its own expected answers.
10. The formal JSON Schema and executable validator disagree on the core required fields/enums used by this tranche.
11. Measurement scale and semantic domain are collapsed into a single field taxonomy.
12. Numeric approximate answers can declare an absolute/relative tolerance without a finite non-negative bound.

## Non-goals

- no aggregate/distribution/density/cluster/graph corpus completion in PT2A;
- no metamorphic fixture generation yet;
- no Nemosyne application integration yet;
- no remote data acquisition during validation;
- no new package dependency solely for schema validation;
- no claim that current candidate real datasets are already scientifically qualified.

## Exit evidence

- existing materialized synthetic fixtures migrate to the governed contract without changing their bytes;
- candidate real sources remain explicitly non-governed;
- validator checks schema-shape invariants, canonical path confinement, artifact identity, dataset digest, CSV field names, source-manifest identity and known-answer tolerance semantics;
- twelve negative self-tests prove representative malformed manifests fail closed;
- CI runs the independent validator on the exact branch head;
- post-implementation disposition is promoted to ADOPT only after the unchanged final head is green and the final diff is re-read.
