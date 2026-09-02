# PT2A corpus contract pre-review

**Date:** 2 September 2026  
**Base:** `main@4c69c13dfc10da8d59d88ae5cae5a4d4dfa5779a`  
**Branch:** `feat/pt2a-corpus-contract`  
**Status:** PRE-IMPLEMENTATION ADVERSARIAL CONTRACT

## Purpose

PT2A freezes the machine-readable contract that later known-answer, metamorphic and NIL corpus tranches must satisfy. It does not yet claim the PT2 corpus family set is complete.

The existing repository already verifies artifact byte counts, row counts and SHA-256 values, but its dataset semantics are mostly implicit in `manifests/catalog.json` and `scripts/validate-catalog.mjs`. That is insufficient for Nemosyne's scientific boundary because storage type alone does not establish valid operations, candidate real datasets are not distinguished mechanically from governed materialized fixtures, and expected quantities lack a uniform tolerance/derivation contract.

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
- declared field storage types **and measurement scales**;
- artifact path, row count, byte count and SHA-256;
- known-answer claims, when present, with expected value, tolerance, authority class and derivation note.

Candidate/unmaterialized real datasets may remain in the catalogue, but must be visibly classified as candidates and may not carry a governed content digest before acquisition and review.

## Digest rule

Dataset `contentDigest` is SHA-256 over the UTF-8 concatenation of materialized artifact records sorted lexicographically by path:

`<path>\0<artifact-sha256>\n`

The stored form is `sha256:<hex>`. This digest identifies the exact set of materialized corpus artifacts without pretending it is the digest of any one source file.

## Measurement semantics

PT2A distinguishes at least:

- identifier;
- nominal;
- ordinal;
- interval;
- ratio;
- circular;
- temporal;
- compositional;
- geospatial.

This is intentionally stricter than inferring semantics from CSV/JSON storage representation.

## Falsifiers

Reject or fix forward if any of these are possible:

1. A `governed` dataset passes validation with no materialized artifact.
2. A governed dataset passes with missing measurement semantics.
3. Artifact bytes, row count or SHA-256 can disagree with the repository file while validation remains green.
4. Dataset content digest can disagree with the declared artifact set while validation remains green.
5. Duplicate dataset IDs or duplicate field names pass.
6. A source/artifact path can escape the repository root.
7. A candidate real dataset is silently treated as governed evidence.
8. A known-answer claim can omit its tolerance, authority or derivation.
9. The validator imports Nemosyne application/runtime code or requires Nemosyne to compute its own expected answers.
10. The formal JSON Schema and executable validator disagree on the core required fields/enums used by this tranche.

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
- validator checks schema-shape invariants, path confinement, artifact identity, dataset digest and CSV field names;
- negative self-tests prove representative malformed manifests fail closed;
- CI runs the independent validator on the exact branch head;
- post-implementation adversarial review records ADOPT/TARGETED/REJECT before merge.
