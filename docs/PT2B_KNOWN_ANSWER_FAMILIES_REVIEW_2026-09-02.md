# PT2B known-answer semantic families adversarial review

**Date:** 2 September 2026
**Base:** `main@dbffb6bb8b1f348403ccf24f704936b07aeb60c2`
**Branch:** `codex/pt2b-known-answer-families`
**Status:** PRE-IMPLEMENTATION CONTRACT

## Purpose

PT2B adds one deterministic, governed, independently checkable fixture for each semantic family already verified in Nemosyne: aggregate, empirical distribution, binned density, source-partition cluster and source-authoritative relationship graph. It also adds an executable known-answer verifier that imports no Nemosyne application or Rust/WASM implementation code.

This is a bounded corpus-truth tranche. A fixture's family designation states which independently known structure it can challenge; it does not assert that Moneta must select that representation for every task or resource budget.

## Invariant

For every PT2B fixture, the exact committed artifact bytes, catalogue identity and structured expected quantities agree, and a zero-dependency external consumer can recompute those quantities from the artifact without importing or executing Nemosyne production code. Graph truth consists only of committed source nodes and edges; visual proximity, correlation, layout or the verifier may not invent topology.

## Authority and production path

- `scripts/generate-known-answers.mjs` owns deterministic materialization of the five synthetic fixtures.
- `data/synthetic/**` owns the exact source bytes presented to consumers.
- `manifests/catalog.json` owns corpus identity, provenance, measurement semantics and expected quantities.
- `scripts/validate-catalog.mjs` owns fail-closed identity, path, shape and artifact validation.
- `scripts/validate-known-answers.mjs` independently recomputes the declared PT2B quantities from committed bytes.
- Nemosyne Rust/WASM remains product analytical authority. Neither generator nor verifier may import Nemosyne code or copy a Nemosyne-produced output as expected truth.

The evidence path is:

```text
deterministic generator definition
  -> committed CSV / DatasetJSON bytes
    -> catalogue artifact identity + structured known answers
      -> independent catalogue validator
        -> independent known-answer recomputation
```

## Failure modes

1. Expected answers are produced by the same routine used to verify them, making the check self-fulfilling.
2. A family label is treated as a universal Moneta selection expectation rather than bounded corpus truth.
3. Distribution claims silently change quantile convention or treat missing/non-finite values as observations.
4. Density language implies a continuous probability density while the fixture and verified product object are bounded empirical bins.
5. Cluster labels or graph edges are inferred from coordinates instead of preserved as explicit source authority.
6. Graph JSON passes byte validation while endpoints, preserved parallel-edge counts, directed degrees or component truth disagree.
7. The JSON graph artifact is shaped unlike the production `DatasetJSON` boundary and therefore cannot challenge the real ingestion path later.
8. Rerunning the deterministic generator changes committed bytes or leaves catalogue hashes silently stale.
9. A structured verification recipe accepts unknown operations or missing parameters and is silently skipped.
10. Approximate tolerance handling accepts non-finite values or compares relative error against an invalid zero denominator.

## Falsifying evidence

- regenerate all PT2B fixtures and require a clean diff for their committed paths;
- run the catalogue validator over byte counts, row counts, SHA-256 values, aggregate content digests, measurement fields and DatasetJSON row/column identity;
- run the independent known-answer verifier and require every declared PT2B recipe to execute exactly once;
- mutate an expected value in memory and prove recomputation fails;
- mutate a verification operation in memory and prove validation fails closed;
- mutate a graph edge endpoint in memory and prove graph validation fails before any known-answer claim is accepted;
- recompute graph node count, edge count, weak components and directed degrees solely from committed source rows/edges;
- inspect the final diff and generated artifacts for Nemosyne imports or copied runtime results.

## Non-goals and dependencies

- Metamorphic row-permutation and irrelevant-column variants are PT2C work.
- The explicit NIL/abstention fixture and its task/resource expectation contract are PT2C work.
- Nemosyne catalogue browsing, loading and production-path comparisons are later PT2/PT5 integration work.
- The graph artifact matches Nemosyne's durable `DatasetJSON` serialization/registration shape. The current ordinary Rust JSON file parser accepts row arrays and cannot preserve this edge-bearing envelope, so later integration must use or add an authority-preserving entry point; PT2B does not claim current catalogue-UI loadability for this artifact.
- This tranche does not acquire or promote candidate real datasets.
- It does not add hierarchy, temporal, geospatial, spectral or other not-yet-selected semantic families.
- It does not claim application-level verification until Nemosyne consumes these independent artifacts through its real ingestion and Rust/WASM paths.

## Promotion gate

Promotion requires deterministic regeneration, both independent validators green on the exact head, post-implementation adversarial review of the real artifact-to-verifier call path, and no unresolved blocker. A green identity check alone is not evidence that the scientific expected quantities are correct.
