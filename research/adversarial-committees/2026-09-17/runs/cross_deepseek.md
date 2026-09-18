Status: **ABSTAIN on architecture winner.** No prior model report is treated as evidence. I cannot verify nemosyne.world current-main seams or UXR3 schemas from this prompt. All architecture names below are therefore hypotheses. If SWSE-0 / Staircase/SRA have different local definitions, remap them before use.

## 1. Epistemic split

**Governing criteria**
- Durable semantic truth must remain uncontaminated by visual/scheduler approximations.
- Rust/WASM analytical authority must remain intact.
- Identity continuity across representation, scheduler, replay, and async transitions.
- Stale async fencing, cancellation safety, fairness/starvation bounds.
- Multi-axis cost bounds, not aggregate-only cost claims.
- Reconstruction/replay determinism for semantic outputs.
- Discoverability, comfort, semantic legibility, long-session stability.
- Scheduler overhead must be justified against saved cost.
- Prior-art verification before consequential adoption.
- Human/Quest claims require human/physical-device evidence.
- Statistical claims require protocol-owned criteria; otherwise ABSTAIN.

**Observations**
- None verified here against current main. No access to nemosyne.world repository, UXR3 identity/evidence substrate, telemetry definitions, datasets, hardware profiles, or UX task suite.

**Claims / hypotheses**
- SWSE-0, Staircase/SRA, and a stronger orthogonal alternative are candidate architectures.
- A shadow-mode implementation can share UXR3 identity/evidence substrate and measure a per-capability cost vector before fixing level boundaries.

**Assumptions**
- UXR3 identity/evidence substrate exists and is stable enough to mirror.
- Rust/WASM analytical authority is a hard invariant.
- Shadow mode can observe without mutating durable semantic truth.
- Replay inputs, seeds, hardware profiles, resource budgets, telemetry, and UX tasks can be frozen.

**Unknowns**
- Exact definitions of SWSE-0 and Staircase/SRA.
- Whether the “stronger orthogonal alternative” already exists or must be specified.
- Current scheduler, renderer, async, cancellation, fencing, and provenance seams.
- Protocol-owned thresholds, equivalence margins, comfort/legibility criteria.

## 2. Architecture hypotheses

**SWSE-0**
Minimal baseline: direct semantic-to-visual mapping, minimal scheduler sophistication, few or no representation tiers. Value is simplicity, determinism, low overhead, and reduced identity/leakage surface.

**Staircase/SRA**
Staged representation and/or scheduler levels. Likely couples visual fidelity to scheduler sophistication. Value is graceful degradation and explicit level boundaries.

**Stronger orthogonal alternative**
Candidate: separate semantic truth, representation fidelity, and scheduler policy into independent axes. Representation and scheduling boundaries are derived from shadow-mode capability cost vectors, not fixed a priori. Treat as candidate, not authority.

## 3. Strongest case and strongest attack

| Architecture | Strongest case | Strongest attack | Decisive falsifiers | Admissible evidence |
|---|---|---|---|---|
| SWSE-0 | Lowest complexity; fewer seams; easier replay determinism; identity continuity simpler; low scheduler overhead; durable truth easier to protect. | May fail multi-axis cost bounds under load; no graceful visual degradation; may starve capabilities or lack cancellation/fencing if minimal; comfort/legibility may degrade without adaptive representation. | At shared substrate, SWSE-0 violates any guardrail invariant, or a candidate meets all bounds where SWSE-0 does not. Simpler scheduler meets all deadlines/fairness, making higher scheduler sophistication unnecessary. | Telemetry, replay diffs, fault injection, durable-truth hashes, human/Quest tasks. |
| Staircase/SRA | Explicit levels can degrade gracefully; can target multi-axis budgets; scheduler tiers can prioritize; transitions can be logged as provenance. | Level boundaries may be invented; coupling scheduler sophistication to visual fidelity can starve semantic tasks or cause jitter; transitions can break identity/stale fencing; replay nondeterminism; long-session leakage; discoverability/comfort can worsen from pops; complexity may be unsupported. | Boundaries cannot be derived from shadow cost vectors; transitions violate identity/evidence; scheduler sophistication fails to reduce missed deadlines/jitter at fixed budget; replay diverges; human comfort/legibility worsens. | A/B under same traces/seeds/hardware; UXR3 provenance; async fault injection; human/Quest physical-device evidence. |
| Stronger orthogonal alternative | Separates axes; avoids forced coupling; can subsume SWSE-0 or Staircase as adapters; supports per-capability cost bounds; shadow-mode discovery before fixing levels; provenance-friendly. | May be under-specified; more knobs; dynamic nondeterminism; scheduler overhead; harder discoverability/comfort proof; may be Staircase renamed. Requires rigorous fencing, telemetry, replay. | Independent axes fail to outperform simpler/coupled variants on any primary axis and add guardrail violations. Shadow cost vector does not predict adoption outcomes. Complexity lacks prior-art support. | Controlled adapter comparison; shadow cost vectors; replay determinism; human/Quest evidence; prior-art verification. |

## 4. Disputed design claims: falsifiers and evidence

| Disputed claim | Decisive falsifier | Admissible evidence |
|---|---|---|
| Representation levels improve cost/UX. | At matched budget/traces, added levels do not improve any primary axis beyond protocol-owned equivalence margin, or worsen guardrails. | Per-axis telemetry; replay semantic diffs; human tasks. |
| Scheduler levels improve fairness/deadlines. | Simpler scheduler meets all protocol-owned deadlines/fairness bounds under worst admissible traces. | Long-trace queue/jitter/deadline telemetry. |
| Scheduler sophistication should couple to visual fidelity. | At fixed visual fidelity, simpler scheduler meets all bounds; or coupled version harms semantic fairness/legibility/comfort. | Controlled A/B with fidelity held constant. |
| Identity continuity is preserved across transitions. | Same UXR3 identity yields divergent evidence chain, query result, or reconstruction after transition/replay. | UXR3 hashes, provenance logs, replay diffs. |
| Stale async fencing is necessary/sufficient. | Delayed stale async result is accepted after newer epoch; or valid fresh result is rejected incorrectly. | Fault-injected async delays; epoch/generation traces. |
| Cancellation is safe. | Canceled operation mutates durable semantic truth, leaks resources, or corrupts identity/evidence. | Cancellation injection; durable-truth hash before/after. |
| Starvation/fairness is bounded. | Any capability exceeds protocol-owned starvation bound while others are overserved. | Long-session queue service telemetry. |
| Multi-axis cost bounds hold. | Aggregate budget holds but one axis exceeds bound. | Per-axis CPU/GPU/WASM/memory/latency/jitter telemetry. |
| Reconstruction from durable truth is valid. | Rebuild from durable semantic truth plus inputs differs in semantic hash/identity. | Reconstruction replay harness. |
| Long-session leakage is bounded. | Memory, handles, tokens, IDs, or evidence grow beyond protocol-owned bound or drift semantically. | Soak tests; heap/handle/telemetry profiling. |
| Replay determinism holds. | Same semantic inputs/seed/hardware profile/code yields divergent semantic output. | Replay harness; semantic diff. |
| Discoverability is acceptable. | Users fail to find/understand features or transitions versus baseline. | Human UX tasks; think-aloud; task success/time. |
| Comfort is acceptable. | Increased discomfort/sickness versus baseline at same content. | Quest/physical-device evidence; questionnaires; physiological if claimed. |
| Semantic legibility is acceptable. | Task accuracy/time worsens versus baseline under same content. | Human task metrics. |
| Scheduler overhead is acceptable. | Scheduler overhead exceeds saved cost or causes jitter; simpler policy meets same bounds. | Profiling; trace comparison. |

## 5. Common invariants

- Durable semantic truth is never written by visual fidelity or scheduler approximation.
- Rust/WASM analytical authority remains authoritative.
- Every semantic identity has continuity across replay, async, cancellation, and representation transitions.
- Evidence/provenance is append-only for consequential decisions; rejected alternatives and reasons retained.
- Async results are fenced by epoch/generation; stale results cannot commit.
- Cancellation is idempotent and cannot produce partial durable commits.
- Replay determinism applies at least to semantic outputs; full hardware scheduling determinism is not assumed.
- Cost bounds are multi-axis, not aggregate-only.
- Fairness/starvation bounds are explicit and protocol-owned.
- Human/Quest claims require human/physical-device evidence.
- Statistical claims require pre-committed protocol criteria; otherwise ABSTAIN.
- Model agreement is never a decision rule.

## 6. Irreducible disagreements

- Explicit fixed representation levels versus continuous capability-vector gating.
- Scheduler sophistication coupled to visual fidelity versus orthogonal scheduling policies.
- Determinism scope: semantic layer only versus full async/scheduler replay.
- Whether shadow-mode cost vectors are sufficient to set boundaries or only to falsify claims.
- What counts as admissible comfort/legibility evidence.
- How to normalize hardware profile variation across shared substrate.
- Whether prior art is sufficient for adoption or only for design caution.
- How identity/evidence continuity is defined across reconstruction.
- Whether the orthogonal alternative is genuinely distinct or Staircase/SRA with renamed knobs.

## 7. Experiment matrix

Shared substrate mandatory for every row: same datasets, traces, seeds, hardware profiles, semantic identities, resource budgets, telemetry definitions, replay inputs, UX tasks.

| ID | Question | Variants | Primary measurements | Decisive falsifier | Evidence class |
|---|---|---|---|---|---|
| E1 | Do representation levels help? | SWSE-0 vs Staircase vs orthogonal | Per-capability cost vector; semantic hashes; UX | No primary gain beyond margin, or guardrail loss | Telemetry + human |
| E2 | Do scheduler levels help? | Minimal vs tiered vs orthogonal policy | Deadline misses, jitter, starvation, fairness | Simpler meets all bounds | Telemetry |
| E3 | Must scheduler sophistication couple to fidelity? | Coupled vs decoupled at fixed fidelity | Cost vector; fairness; comfort/legibility | Coupling adds no benefit or harms guardrails | Telemetry + human |
| E4 | Identity continuity | All variants | UXR3 identity/evidence diff | Divergence after transition/replay | Replay/provenance |
| E5 | Stale async fencing | All variants | Accepted stale commits; rejected fresh commits | Any stale commit or false rejection | Fault injection |
| E6 | Cancellation safety | All variants | Durable truth hash; leak counters | Mutation/leak/corruption | Fault injection |
| E7 | Fairness/starvation | All variants | Service bounds per capability | Any bound violation | Long trace |
| E8 | Multi-axis bounds | All variants | CPU/GPU/WASM/memory/latency/jitter | Any axis violation | Telemetry |
| E9 | Reconstruction | All variants | Semantic hash after rebuild | Hash/identity divergence | Replay |
| E10 | Long-session leakage | All variants | Memory/handles/tokens/evidence drift | Unbounded growth or drift | Soak |
| E11 | Replay determinism | All variants | Semantic diff over replay | Divergence under same substrate | Replay |
| E12 | Discoverability/comfort/legibility | All variants | Human task success, comfort, understanding | Worsening vs baseline | Human/Quest |

## 8. Minimal shadow-mode implementation

Preconditions:
- Freeze UXR3 identity/evidence schemas for the experiment.
- Freeze telemetry definitions, replay inputs, hardware profiles, resource budgets, UX tasks.
- Feature-flag all candidates; shadow mode observes only.

Minimal components:
1. **Shadow capability tagger**: attach capability IDs to UXR3 events without mutating durable truth.
2. **Cost-vector recorder**: per capability, record multi-axis cost, queue depth, jitter, cancellation latency, stale rejections, fairness, and scheduler overhead.
3. **Replay harness**: same inputs/seeds/hardware profile/code version; compare semantic hashes.
4. **Fence/cancel simulator**: inject delays, cancellations, and stale results; verify durable truth remains unchanged.
5. **Adapter shims**: SWSE-0 baseline, Staircase/SRA, orthogonal candidate behind flags.
6. **Provenance log**: record hypotheses, rejected alternatives, reasons, and ABSTAIN decisions.

Rules:
- Do not fix level boundaries until prior art is verified and protocol-owned criteria exist.
- Do not let shadow mode write durable semantic truth.
- Do not accept model agreement as evidence.
- Retain rejected alternatives as provenance.

## 9. Prior art requiring verification

- Adaptive fidelity/LOD: Clark, Funkhouser, HLOD, impostors, continuous LOD, Nanite-like virtual geometry claims.
- Real-time scheduling: rate-monotonic, EDF, CFS, deadline scheduling, work-stealing, priority inheritance, fair queuing.
- Async safety: epoch-based reclamation, hazard pointers, RCU, seqlocks, generation counters, cancellation tokens, structured concurrency.
- Determinism/replay: deterministic simulation, lockstep, event sourcing, CRDTs, time-travel debugging.
- VR/Quest comfort: OpenXR, reprojection, late latching, phase sync, Application SpaceWarp, frame timing, vection/cybersickness.
- Semantic world state: scene graphs, ECS, entity identity, provenance, semantic web/world models.
- Rust/WASM: wasm-bindgen, WASI, threads, atomics, shared array buffers, zero-copy boundaries.
- UX discoverability/legibility: wayfinding, cognitive maps, spatial UI, LOD transition perception.

## 10. Implementation seams to inspect on current main

- UXR3 identity/evidence substrate: schema, hashing, provenance, migration.
- Durable semantic truth store: write path, transactions, versioning, integrity checks.
- Scheduler: queues, priorities, deadlines, work stealing, cancellation.
- Async/fencing: epoch/generation tokens, stale rejection, commit gates.
- Renderer/representation: scene graph, LOD, culling, materials, animation.
- WASM boundary: Rust exports, JS glue, memory, threads, atomics.
- Telemetry: definitions, clocks, sampling, hardware profile, replay inputs.
- Shadow mode: feature flags, adapters, no-op sinks, isolation.
- Tests: determinism, soak, fault injection, UX task harness.
- Provenance: rejected alternatives, decision records, ABSTAIN log.

## 11. Explicit ABSTAIN register

| Item | Reason | Required before decision |
|---|---|---|
| Architecture winner | No shared-substrate evidence; definitions opaque | Controlled experiments E1–E12 |
| Number of representation levels | No cost-vector evidence | Shadow-mode boundaries; prior art |
| Scheduler algorithm/tier count | No deadline/fairness evidence | E2; protocol-owned bounds |
| Coupling scheduler to visual fidelity | Disputed; no fixed-fidelity A/B | E3 |
| Comfort/legibility thresholds | Human/Quest evidence absent | Human/Quest protocol |
| Cost-budget thresholds | No protocol-owned criteria | Pre-committed budgets |
| Determinism scope | Semantic vs full hardware unclear | Replay policy |
| Identity continuity mechanism | UXR3 seams unverified | Current-main inspection |
| Stale fencing mechanism | No fault-injection evidence | E5 |
| Cancellation semantics | No durable-truth evidence | E6 |
| Fairness/starvation bounds | No long-trace evidence | E7 |
| Long-session leakage bound | No soak evidence | E10 |
| Prior-art sufficiency | Not verified | Literature/engineering verification |
| Orthogonal alternative distinctness | Definition unknown | Specification + prior-art check |
| Adoption readiness | Consequential decision | Full evidence package |

No winner selected. Decision remains **ABSTAIN** until the shared-substrate experiments, prior-art verification, human/Quest evidence, and current-main seam inspection are complete.