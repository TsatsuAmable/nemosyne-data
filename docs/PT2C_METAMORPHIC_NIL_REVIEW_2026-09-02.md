# PT2C metamorphic and NIL corpus adversarial review

**Date:** 2 September 2026
**Base:** `main@0dac6edb4ae53a837e0361c4f578afb8f3994da5`
**Branch:** `codex/pt2c-metamorphic-nil-corpus`
**Status:** POST-IMPLEMENTATION REVIEW COMPLETE — NO OPEN BLOCKER

## Purpose

PT2C closes the remaining bounded corpus work in `nemosyne-data#3`: add one deterministic row-permutation and one deterministic irrelevant-column variant for every PT2B semantic-family fixture, plus one explicit NIL/abstention fixture whose expected outcome is scoped to a declared analytical task, information requirement and resource constraint.

Metamorphic language is claim-scoped. An added field is irrelevant only to named preserved known answers; it is not declared universally irrelevant to every future Moneta task or representation. The NIL fixture records an independently checkable falsifier contract, not a claim that Nemosyne production already consumes or passes it.

## Invariant

Each metamorphic variant pins the exact base dataset content digest, declares its transformation and preserved known-answer IDs, and is mechanically proven to preserve those answers from committed bytes. Row-permutation variants must change order without changing the base row multiset, durable graph row identity or source topology. Irrelevant-column variants must add only declared fields while leaving every base field, row identity and graph edge unchanged.

The NIL fixture must contain more distinct source observation identities than its explicit simultaneous capacity (`maxConcurrentElements * maxObservationIdentitiesPerElement`) permits while requiring individual-observation identity. Its catalogue expectation must remain marked as requiring Nemosyne production-path evidence until a real consumer proves the governed NIL outcome and provenance.

## Authority and production path

- PT2B governed base artifacts and their `contentDigest` values own the source identity for every metamorphic relation.
- `scripts/generate-metamorphic-nil.mjs` deterministically derives variants from the committed PT2B artifacts and materializes the NIL fixture.
- `manifests/catalog.json` owns base pins, transformation kinds, scoped preserved claims and the NIL expectation contract.
- `scripts/validate-catalog.mjs` owns fail-closed relationship identity and schema enforcement.
- `scripts/validate-known-answers.mjs` owns independent byte-level metamorphic comparison and recomputation of every preserved claim.
- Nemosyne Rust/WASM and Moneta remain product authorities. This repository may define a falsifier but may not mark the NIL outcome production-verified itself.

The evidence path is:

```text
PT2B governed base bytes + digest
  -> deterministic transformation
    -> committed variant bytes + relationship manifest
      -> structural comparison against exact base
        -> independent recomputation of preserved answers
```

For NIL:

```text
governed identity-only bytes
  -> independently verified distinct identity cardinality
    -> scoped simultaneous-individual-inspection + identity-preservation + explicit per-element capacity
      -> expected NIL, explicitly awaiting production-path evidence
```

## Failure modes

1. A variant points to a mutable dataset ID without pinning the exact base content digest.
2. A row permutation drops, duplicates or changes rows while preserving only aggregate totals.
3. A graph permutation reorders rows without the corresponding durable row IDs, or changes edge order/content and silently alters topology.
4. An irrelevant-column variant changes a base value or calls a field globally irrelevant rather than claim-scoped.
5. Preserved claim IDs are missing, duplicated, unknown or silently skipped by the verifier.
6. A metamorphic relation targets another variant, creating chains or cycles that obscure authority.
7. Generator and verifier share one transformation output and therefore validate a self-fulfilling representation instead of comparing committed base and variant bytes independently.
8. The NIL dataset alone is treated as sufficient proof of a Moneta outcome.
9. NIL is declared without task, observation level, required information, positive resource bound or independently checked identity cardinality.
10. A future model change invalidates the outcome while the corpus continues to call it production-verified.
11. Schema `2.1` is tightened in place instead of advancing to a new public contract identity.
12. Candidate real datasets or PT2B base identities are mutated as a side effect of variant generation.

## Falsifying evidence

- require exactly two direct variants for each of the five PT2B base families: one row permutation and one irrelevant-column addition;
- require every relation to pin the current base `contentDigest` and reference every base known-answer ID exactly once;
- compare complete projected row multisets, not only computed summaries;
- prove row-permutation order actually changes while base schemas and values remain identical;
- prove irrelevant-column variants preserve base row order and values and add exactly the declared schema fields;
- compare graph row-ID/row pairs and complete source-edge multisets across variants;
- execute all PT2B recipes against both variants and require the same expected result;
- mutate a base pin, projected field and graph row-ID pairing in negative tests and require refusal;
- verify the NIL identity-cardinality answer independently and require it to exceed the declared positive simultaneous identity capacity;
- regenerate all PT2C artifacts and require a clean data diff;
- inspect the final diff for Nemosyne application imports and ungoverned completion claims.

## Non-goals and dependencies

- No valid unit transformation, controlled-noise, missingness or duplicate/near-duplicate variants in this finite tranche.
- No hierarchy, temporal, geospatial, spectral or additional scientific families.
- No Nemosyne application integration or product-path Moneta/NIL completion claim.
- No real-source acquisition or promotion.
- No claim that row order or added fields must leave every possible future learned model decision unchanged; only named known answers are preserved here.
- Production verification of the NIL expectation and edge-preserving graph catalogue ingestion remain downstream integration work.

## Promotion gate

Promotion requires the formal and executable contract to advance explicitly, deterministic regeneration, exact byte/digest validation, complete metamorphic structural comparisons, recomputation of every preserved answer, fail-closed negative tests, and a distinct post-implementation adversarial disposition with no unresolved blocker.

## Post-implementation adversarial disposition

### BLOCKER — fixed

The initial `individual-inspection` plus `maxElements` formulation did not exclude pagination or sequential reuse of a smaller element pool, so cardinality alone could not prove that no representation was feasible. The final contract scopes the task to `simultaneous-individual-inspection`, renames the resource bound to `maxConcurrentElements`, and fixes `maxObservationIdentitiesPerElement` at one. The independent check now proves that 1,000 distinct identities exceed the declared simultaneous capacity of 500. Negative evidence raises the capacity to 1,000 and requires the NIL argument to fail.

### DEFER

- Nemosyne production-path consumption and proof of the governed NIL outcome remain required before `evidenceStatus` can change.
- Edge-preserving graph catalogue ingestion remains a downstream integration dependency; this corpus proves committed DatasetJSON structure and known answers only.

### SUGGESTION

- A later schema version may generalize the task/capacity vocabulary once more representation impossibility families exist. PT2C deliberately freezes only the bounded case it can prove.

### Evidence

- Schema advanced from `2.1` to `2.2`; corpus advanced from `v0.3.0` to `v0.4.0`.
- Both generators run successively with no diff in committed data artifacts.
- Catalogue validation covers 22 datasets, 20 governed artifacts and 26 fail-closed contract cases.
- Known-answer validation recomputes 18 direct answers, 34 preserved-answer executions across 10 variants and 12 fail-closed analytical/structural cases.
- Complete CSV row structures, graph durable-row-ID pairs and source-edge identity multisets are compared; the validator does not accept summary equality as structural evidence.
- No Nemosyne application module is imported, and the NIL evidence status remains `requires-production-path`.

**Disposition:** PT2C corpus implementation is internally verified for its bounded claims. There is no unresolved blocker to review, while product integration remains explicitly deferred and must not be promoted by this work.
