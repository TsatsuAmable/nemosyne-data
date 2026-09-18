# Adversarial Research Committee Report — UXR3/UXR4
**Subject:** Bounded semantic working sets for long VR sessions (progressive materialization, fencing, backpressure, reconstruction, telemetry, falsifiers)
**Status:** Research only. No code edited, no PRs opened. One-forward-implementation-PR rule respected throughout.

**Access caveat (admissibility note):** The committee has no repository, issue-tracker, or telemetry access in this session. Therefore **no claim below is an observation about current main**. Everything about the existing system is conditioned and marked for verification. The committee explicitly **ABSTAINS** on all system-specific behavioral claims until instrumented baselines exist (see ABSTAIN register, §8). This is a governance output, not indecision: each abstention is paired with the decisive experiment that lifts it.

---

## 0. Governing criteria (normative; everything else is claim or observation)

These are the criteria any proposed algorithm must satisfy. They are **criteria**, not claims — they do not require evidence, only enforcement.

- **G1 — Sole durable authority.** All durable semantic truth (identity, presence/level, edges, containment, provenance, durable poses) lives in Rust/WASM. Three.js objects, `userData`, scene graph structure, and JS-side maps are projections.
  - *Operational form:* the criterion is **not** "userData must be empty" (unenforceable, drives truth underground into closures and module state). It is the **wipe-rebuild test**: delete all JS-side state, rebuild the scene solely from WASM commands, and require semantic-hash equivalence (§4.7) plus visual equivalence modulo transient refinement.
- **G2 — Identity continuity.** Entity identity is stable across level changes, eviction, collapse, re-expansion, and return, for the whole session. Ids are opaque, monotonically allocated, **never recycled** (ABA protection), and represented across the WASM↔JS boundary in a lossless form (**no u64→f64 round-trip**; use paired u32, BigInt, or interned string tokens — a real bug class, verify the current boundary encoding).
- **G3 — Exactly-one projection.** For every id whose authoritative level ∈ {Coarse, Refined}, there is exactly one live Object3D; for Implicit/Collapsed/Evicted, zero (≤1-frame transition tolerance). Violations are detected, counted, and self-healed — never silently tolerated.
- **G4 — Boundedness by construction.** All working-set resources (presence count, refined bytes, in-flight bytes, activation backlog) are bounded **at admission**, not by hope or GC pressure.
- **G5 — Fairness is perceptual, not queue-shaped.** Fairness is defined as bounded worst-case wait, in frames, per perceptual class, under adversarial load — not as queue-internal metrics.
- **G6 — Resource hygiene.** Steady-state leak slopes ≈ 0 for GPU resources, listeners, WASM pools, shader-variant count. Divergence between renderer-reported resource counts and the authoritative manifest raises an alarm.
- **G7 — Comfort.** No frame exceeds budget; peripheral change rate is bounded via hysteresis; materialization mutations occur at XRFrame boundaries only.
- **G8 — Evidence admissibility.** A claim is admissible as *decisive* only if reproducible in the deterministic replay harness (recorded command trace + seed → identical semantic-hash timeline), or as *observational* with error bars from instrumented sessions. Model consensus — including this committee's — is not authority.
- **G9 — Eviction ≠ collapse.** Resource demotion is engine-owned; semantic collapse/expand is user/semantic-authority-owned. The working-set engine must never auto-collapse user-visible structure. Conflating these lets a value function destroy user intent.

---

## 1. Problem statement

A long VR session (hours, not minutes) over a large semantic world cannot affordably keep everything materialized. The system needs a **bounded working set** with:

1. **Progressive materialization:** a cheap, identity-stable COARSE projection (glyph/label/impostor/stub-edges) present immediately; asynchronous promotion to REFINED with no identity flicker and no half-committed states.
2. **Stale-work fencing:** user attention moves constantly; refinement must be cancellable or at least discardable without orphaning GPU/CPU resources or committing out-of-order results (races: *demote-while-refining*, *collapse-while-refining*, *re-admit-while-refining*).
3. **Backpressure and fairness:** bounded queues with guarantees that reflexive/structural needs cannot be starved by speculative prefetch, and that stale jobs do not occupy queue capacity (dead-weight starvation).
4. **Reconstruction:** after collapse, eviction, or departure-and-return, entities return with identical identity, explicit referential partiality (edges to absent neighbors), and container summaries rebuilt from authority, not from cached JS state.
5. **Telemetry** cheap enough to run every frame for hours, admissible under G8.
6. **Long-session survival:** no monotonic leaks, no fragmentation death spirals, no thrash oscillation at budget boundaries, survival of WebGL context loss (generalized wipe-rebuild).

**Special attention areas and their failure modes:**
- *Queue starvation:* five distinct mechanisms — (a) L3 flood, (b) stale-but-uncommitted dead weight, (c) activation-backlog FCFS ordering (big completions hide small ones), (d) admission-order starvation on mass re-admission (teleport: far objects processed before near), (e) priority inversion from a long transcode holding a worker.
- *Identity continuity:* duplicates (two live objects, one id), ghosts (manifest present, no projection), id recycling, boundary precision loss, epoch write-back, JS/authority level disagreement, resurrection via retained closures.
- *Leakage:* undisposed geometry/texture/material, render targets, **shader-variant explosion** from per-entity material tweaks, listener accumulation, rAF-closure retention, WASM pool growth, unbounded decode caches, worker-wedging.
- *Durable truth in `userData`:* the temptation is not only literal `userData` writes but structural truth leaking into scene-graph parenting, object names, GLTF metadata, and JS caches — G1's wipe test is the only check that catches all of these.

---

## 2. Competing approaches

| # | Approach | Core mechanism | Strength vs. requirements | Weakness / risk | Prior-art anchor |
|---|----------|----------------|---------------------------|-----------------|------------------|
| A | Geometric LOD streaming | Distance/screen-space-error driven level selection, budgets | Mature, perceptually grounded, hardware-friendly | Semantic relevance ≠ geometric proximity; edges/containment integrity unaddressed; identity continuity out of scope | 3D Tiles (OGC); Funkhouser–Séquin 1993 adaptive display; Hoppe progressive meshes; Luebke et al. LOD book (hysteresis) |
| B | Buffer-cache working set | LRU-K/ARC/LIRS/TinyLFU-style admission+eviction over entity ids, count-bounded | Bounded by construction; trivial hit/thrash telemetry | Count ≠ bytes; stationary-access assumptions violated by bursty spatial attention; no perceptual deadlines | Denning 1968 working-set model; O'Neil LRU-K; ARC; TinyLFU |
| C | QoS lane scheduler | Strict-priority lanes (reflex/structural/foveal/speculative) + per-lane reserves + within-lane aging + admission caps | Directly targets starvation (G5); composable with any working-set policy | Control-system tuning risk (oscillation); weights can be arbitrary without SLA derivation | DRR (Shreedhar–Varghese); EDF (Liu–Layland); WFQ; browser `scheduler.postTask`; React lanes |
| D | Demand-driven incremental (pull) | Materialization as derived demand; change propagation along queries; staleness/cancellation by construction — no speculative queue | Eliminates queue starvation *and* cancellation as separate problems | Latency under push-style perceptual urgency is awkward to express; WASM↔JS bridge cost; harder worst-case bounds | Adapton; Salsa; differential dataflow; self-adjusting computation; Elliott push-pull FRP |
| E | Actor/worker pool with bounded mailboxes | Refinement jobs off-main-thread; backpressure by mailbox bound; drop/redirect policy | True parallelism for transcode/decode; isolation; explicit backpressure | Upload still main-thread; transferable double-memory; SAB/COOP-COEP availability; pool hygiene under hard-cancel | Erlang/Akka bounded mailboxes; Reactive Streams; Akka Streams bounded stages |
| F | Implicit/GPU-native COARSE | COARSE = instanced glyphs/impostors/SDF points in stable instance buffers; REFINED = mesh swap | COARSE nearly free; identity continuity trivial via stable instance slots; uniform cost | Text/relations may not compress to impostors; authoring cost; less applicable to non-geometric semantic content | QSplat; impostor literature (verify); Nanite (conceptual) |
| G | Two-phase commit (prepare→activate) | All expensive work off critical path; atomic swap at frame boundary under byte budget | Eliminates torn states by construction; trivial fencing at activation | Double-memory until activation; needs frame-time-aware activation scheduler | Game streaming "ready gates"; KTX2/Draco async + upload budgeting |

**Committee reading:** these are **not mutually exclusive**. The strongest composite is F+B+C+G (implicit COARSE, cache-style bounded admission, lane QoS, two-phase activation), with D (pull) as the primary *competitor to C* and E as an implementation substrate question, not an architecture question. Whether C or D wins is exactly Experiment E1 — the committee **ABSTAINS** on that choice pending data.

---

## 3. Strongest counterarguments (assumptions under attack)

**A1. Attack on "bounded semantic working set" as the abstraction.**
A count-bounded working set is not a bandwidth-bounded one: entity cost variance can be 10³×. A memory-bounded set can thrash GPU upload while looking "bounded." *Counter-position:* budgets must be **multi-axis** (count, refined bytes, in-flight bytes, activation bytes/frame) with a calibrated per-class cost model. *What settles it:* F6/F9 under both budget schemes; if count-only violates activation bounds at equal hit-rate, the abstraction gains an axis.

**A2. Attack on the necessity of queues and cancellation.**
The ready-queue is an artifact of push. A demand-driven pull model (D) has no queue to starve and no cancellation to get wrong — staleness is structural. *Counter-position:* pull expresses perceptual urgency (deadlines in frames, foveal reflexes) awkwardly and may pay bridge costs per demand. *What settles it:* E1 head-to-head on F1/F2/F5. If pull matches push's p99 time-to-coarse within ~10% with lower wasted work and materially less machinery, drop the queue.

**A3. Attack on async cancellation as a first-class requirement.**
If refinement jobs are short and idempotent, **commit-time fencing alone** (finish the work, discard the result if the epoch moved) is simpler and sufficient; true cancellation only matters for long transcodes, which can be chunked with abort checks or killed by worker termination. *What settles it:* E2 measures wasted-work ratio under F5; cooperative cancellation is justified only if discarded-completed-work exceeds a threshold or late commits cause hitches.

**A4. Attack on "stable ids ⇒ identity continuity."**
Ids are the cheap part. The hard parts are structural: duplicates, ghosts, container/child id aliasing on collapse, edge representation when one endpoint is absent, and boundary representation precision. *Committee position:* identity continuity is an **invariant system** (G2/G3 + the three race gates in §4.2), not a keying choice. *What settles it:* F3, F8 — and the invariant must be fault-injection-tested, not just exercised by happy paths.

**A5. Attack on the value function.**
Any V(id) with perceptual × semantic weights is unfalsifiable intuition unless weights are derived from SLAs. Worse, if V conflates resource pressure with semantic collapse (G9 violation), the engine destroys user intent at the boundary. *What settles it:* weights must be derived *from* the perceptual SLAs (§4.4), and the falsifier suite must include the collapse-thrash case where correct behavior is "demote, never auto-collapse."

**A6. Attack on hysteresis as thrash protection.**
Schmitt triggers fail under adversarial oscillation exactly at the boundary (F1): a 2 Hz gaze oscillation across the threshold still toggles state every crossing if both thresholds are crossed. *Counter-position:* hysteresis must be paired with **cooldown (min-dwell)** and **churn penalties**, and pass criteria must be churn-rate bounds, not "no oscillation." *What settles it:* F1 pass/fail with measured thrash index.

**A7. Attack on telemetry admissibility and observer effect.**
Per-frame telemetry can itself cause GC pressure and jank (string allocation, map churn), and nonstandard memory APIs (`performance.memory`) are deprecated/privacy-gated; `performance.measureUserAgentSpecificMemory` is gated. If instrumentation changes p99, all downstream claims are contaminated. *What settles it:* E6 A/B under F7; telemetry must be allocation-free on the hot path (WASM ring buffers, §4.5).

**A8. Attack on "long-session failure = leak."**
The dominant hour-scale failures are often **not** monotonic leaks: fragmentation and growth cycles, shader-variant accumulation, event-listener accumulation that plateaus at a high level, WebXR session-level handle accumulation, and context loss destroying continuity. Soak criteria must test slopes *and* divergence alarms *and* recovery, not just high-water marks.

**A9. Attack on determinism of replay.**
Async workers complete in nondeterministic order; naive replay equivalence is unachievable. *Counter-position:* determinism is required at the **manifest level**, not the scheduler level: the commit gate serializes transitions; replay records commit decisions. Where full determinism is impractical (worker pool), evidence splits into two admissibility classes: full determinism (single-threaded algorithm tests) and statistical bounds (integration). State this now or every later claim is unfalsifiable.

**A10. Attack on the authority criterion's strict form.**
A literal "nothing in userData" rule drives truth into worse hiding places (closures, module-level maps, GLTF metadata). *Committee position:* adopt the operational form (wipe-rebuild test, G1) with a dev-mode whitelist linter on `userData` keys, and treat **transform authority as an open question** requiring its own governing decision — drag/kinematics is where this rule gets violated by accident.

---

## 4. Proposed algorithms and designs

**Status: all of §4 is *claims* (proposals). None is evidence. Each carries its falsifier.**

### 4.1 Architecture: SWSE (Semantic Working-Set Engine) — layers

1. **Authority layer (WASM):** `EntityId` (monotonic u64, never recycled; opaque token at boundary), manifest `id → {presence ∈ {Implicit, Coarse, Refined, Collapsed, Evicted}, level, epoch, class_cost, last_perceptual_touch, pin, semantic_value}`, edge table, containment table, content hashes, budget state. Content-addressed **decode cache** (bounded bytes) keyed by content hash — permissible because it is not identity-truth and lives in WASM.
2. **Projection layer (JS/Three.js):** `ProjectionRegistry: id → {object3d, level, epoch}`, a cache of commands already applied. `userData` may hold only the handle `{id, level, epoch}`; dev-mode whitelist lint; scene-graph structure must mirror WASM containment (audit compares).
3. **Scheduler layer:** lanes (C) or demand (D) — **ABSTAIN pending E1**. The commit gate, budgets, and invariants below are scheduler-agnostic and should be built regardless.
4. **Activation layer (G):** prepared assets commit atomically at XRFrame boundaries under a per-frame activation byte cap; dispose of superseded resources on the following frame boundary.

### 4.2 Fencing and the commit gate (handles all three races)

Every refinement job carries `(id, from_level, to_level, epoch, content_hash, est_bytes)`.

```rust
fn commit(job, assets) -> Decision {
    let st = manifest.get(job.id) else { return Discard("no_entity") };
    if st.epoch  != job.epoch       { return Discard("stale_epoch");   }   // re-admit/return race
    if st.level  != job.from_level  { return Discard("level_moved");   }   // demote-while-refining
    if st.presence in {Evicted, Collapsed} { return Discard("absent"); }   // collapse-while-refining
    if !budget.admit_activation(assets.bytes) { return Defer(job); }        // bounded, not unbounded
    manifest.promote(job.id, job.to_level, assets.refs);
    emit(Command::Promote { id, level, epoch, assets });
    Commit
}
```

- **Discard frees assets at the worker before the job record is recycled** — orphaned transcodes are structurally impossible, not discouraged.
- Long tasks (transcode/decode) are **chunked with fence checks between chunks**; a wedged worker is terminated and the pool slot recycled (counted as `hard_cancel`). Fetch/decode paths use `AbortController`.
- Cheap staleness re-check **at dequeue** (epoch compare) so stale jobs don't occupy queue capacity — dead-weight starvation is handled at two points, not one.
- A1: keep "demote while refine in flight" legal at any time; the gate makes it safe.

### 4.3 Working-set policy: two-tier presence, Schmitt boundaries, cooldown

Two nested bounded sets: **PRESENCE** (Coarse; cheap; larger bound; preserves identity continuity) ⊇ **REFINED** (bytes-bounded).

```text
V(id) = w_p·perceptual(lane, id) + w_s·semantic_value(id) − w_c·churn_penalty(id)

refine_on:    V > T_high  ∧ bytes_free(est) ∧ cooldown_elapsed
refine_off:   V < T_low            (T_low < T_high — Schmitt)
presence_off: V < T_low_pres ∧ ¬pinned ∧ ¬open_frontier   # engine demotes; NEVER auto-collapses (G9)
churn_penalty(id) = α·exp(−t_since_demote/τ)              # discourage immediate re-refine
```

Key design choices:
- **Demote refinement before presence** (Refined→Coarse first). Coarse presence is the identity-continuity mechanism: return-after-evict is a level promotion of an existing identity, not a re-creation.
- **Cooldown + hysteresis together** (A6); neither alone survives F1.
- **Collapse reconstruction:** collapsing subtree S creates container node C with a *persistent id* while the branch exists in any state; children → Implicit; **frontier stubs** are canonical on the *outside* node (rule: "the stub lives on the node that exists"), so collapse/expand toggling can never duplicate or lose an edge. Container summaries (child count, centroid, bounds, frontier list) are rebuilt **from the manifest only** — never from JS caches (G1).
- **Return path:** re-admission emits `(id, level=Coarse, epoch+1)`; the JS registry asserts zero live objects for the id — if one exists, that is a G3 violation: record, self-heal by adopting the existing object, never create a second.

### 4.4 Fairness: lanes, reserves, within-lane aging (candidate design — claim, gated on E1)

- **Lanes:** L0 reflex (fixation/near-field/interaction), L1 structural (containers, edges to materialized endpoints — referential integrity), L2 foveal/peripheral refinement, L3 prefetch.
- **Strict lane order** with **per-lane reserves** r_i (guaranteed service share) and caps. Reserves give the starvation-bound; strict order gives reflexes their deadline.
- **Aging is within-lane only** — cross-lane aging reintroduces inversion and is forbidden.
- **L3 admission gate:** depth cap ∧ in-flight byte cap ∧ recent utility > τ (utility = refined-at-fixation rate attributable to prefetch). Prefetch may wait forever; it may never starve others.
- **Activation scheduler is fair by bytes, not FCFS by completion** — else one large finished mesh hides ten small finished glyphs (starvation mechanism (c)).
- **Perceptual SLAs (frames, not ms — deterministic in tests):** e.g., fixation ≥300 ms in near-field → Coarse ≤ k₀ frames; pinned entity → Refined ≤ k₁ frames; anything admitted → presence ≤ k₂ frames under teleport flood. **These SLAs generate the weights w_p, w_s; weights are never hand-tuned intuition** (A5).
- Worst-case L0 wait is analytically bounded by (L0 queue depth + one round of other lanes' reserves); assert it in tests — a fairness claim must come with its proof obligation, not just a benchmark.

### 4.5 Telemetry (admissibility-first design)

- WASM **ring buffers**, zero JS allocation on the hot path, frame-boundary flush of aggregates; sampled per-event records only for promote/demote/cancel/lane-transition; **dropped-event counter is itself reported** (silent loss breaks admissibility).
- Core metrics: `time_to_coarse`, `time_to_refined` (per admission), cancel rate + `wasted_work_bytes` by reason, queue depth p50/p99 per lane, `stale_fraction_in_queue`, `thrash_index` (refine→demote→refine cycles/min/id), presence/refined sizes, `bytes_inflight`, `activation_backlog_bytes`, **renderer.info-vs-manifest divergence** (G6 alarm), **duplicate/ghost violation counters (must be 0)**, WASM memory high-water, shader-variant count, rAF frame-time p95/p99, sampled GC-pressure proxies.
- **Semantic hash:** canonical serialization of (ids, levels, edges, containment) hashed at frame boundaries — the substrate for replay equivalence (E7) and the wipe-rebuild test (G1).

### 4.6 Leakage defense (G6 operationalized)

- Single-owner GPU resources with refcounts; demote → registry mark → **deferred dispose queue with a per-frame byte cap** (never dispose mid-frame; G7).
- Listener hygiene: every `addEventListener` paired through a per-projection Disposable; audit counts.
- WASM: per-frame scheduling metadata in a reset arena; job records pooled; caches bounded.
- Dev builds: `FinalizationRegistry` canaries (correctness may **not** depend on GC timing — detector only), heap-snapshot diffs in harness, forced-GC injection during storms (F10).
- Context-loss is the generalized wipe test: on `webglcontextlost/restored`, rebuild projections **from manifest only**; this is G1 being exercised in production conditions, not just in the lab.

---

## 5. Decisive experiments and adversarial falsifiers

**Falsifiers** (each names what it kills and its pass criteria; thresholds are calibrated against instrumented baselines, not invented):

| ID | Pattern | Falsifies | Pass criteria (calibrated) |
|----|---------|-----------|---------------------------|
| F1 | Peripheral churn storm: 2 Hz gaze oscillation across Schmitt boundary, 30 min | A6, hysteresis adequacy | thrash_index ≤ bound; refined churn ≤ bound/min; p99 frame OK; duplicates = 0 |
| F2 | Prefetch flood: 500 L3 req/s + concurrent L0 demand | starvation (a) | L0 worst-case wait ≤ SLA; L3 drop rate ≥ expected; wasted_work bounded |
| F3 | Reverse traversal: depart (eviction cascade), return faster than eviction | identity continuity, reconstruction | same ids return at Coarse; 0 duplicates; ghosts >1 frame = 0; stubs correct |
| F4 | Collapse thrash: 1 Hz toggle of large subtree, 10 min | G1, G9, container reconstruction | summary from manifest; renderer.info steady-state; semantic hash stable under toggles |
| F5 | Cancellation storm: 95% of refines cancelled pre-commit | A3 | wasted_work ratio below threshold OR cooperative path engages; pool stable; 0 orphaned transcodes |
| F6 | Budget squeeze: 98% bytes budget, adversarial request mix | A1, budget axes | activation backlog bounded; pinned SLA met; no OOM; WASM plateaus |
| F7 | 8-hour soak, mixed adversarial pattern | A8, G6 | post-warmup slopes ≈ 0 (WASM mem, geometries, textures, listeners, programs); violations = 0; no queue growth |
| F8 | Fault injection: fabricate duplicate + ghost + stale commit in dev build | G3 detector/self-heal | alarms fire, self-heal converges, counters increment — tests the audit, not the happy path |
| F9 | Teleport flood: 10k entities visible in one frame | starvation (d), activation fairness | activation spread by byte cap; time-to-first-content bounded; no >budget frame |
| F10 | GC pressure storm: forced GC during refinement storm | resurrection/retention bugs | FinalizationRegistry canaries report 0 undisposed after settle |

**Comparative experiments** (each with a pre-registered decision rule):

- **E1 — Push (C) vs Pull (D):** run F1/F2/F5 under both. *Rule:* adopt pull if p99 time-to-coarse within ~10%, wasted work lower, and machinery materially smaller. Committee **ABSTAINS** until run.
- **E2 — Commit-fence only vs cooperative cancellation:** F5 wasted-work ratio. *Rule:* cooperative cancel justified only above calibrated threshold or on late-commit hitches.
- **E3 — Count-only vs multi-axis budgets:** F6/F9 activation backlog + OOM proximity.
- **E4 — Single-tier vs two-tier + hysteresis:** F1/F3 thrash index and time-to-coarse.
- **E5 — Worker pool vs main-thread chunked refinement:** F5/F9 frame p99 + total latency; verify SAB/COOP-COEP availability first (deployment-dependent).
- **E6 — Telemetry cost A/B under F7:** *Rule:* p99 impact must be under a small fixed fraction of budget, else redesign telemetry before trusting any other experiment.
- **E7 — Replay equivalence:** 30-min recorded trace replayed twice → identical semantic-hash timelines; fault-injected runs recover. Establishes which evidence class each future claim belongs to (G8).

---

## 6. Risks

1. **Control-loop oscillation.** Lanes+reserves+aging is a feedback system; mistuned, it oscillates worse than the disease. *Mitigation:* ship with two lanes (reflex/structural) + a hard L3 cap; add lanes only when a falsifier demands one.
2. **Cost-model drift.** Estimated vs actual bytes diverges across asset variety; budget policies silently wrong. *Mitigation:* telemetry reconciliation + conservative padding + recalibration.
3. **Determinism burden.** Worker nondeterminism vs replay equivalence (A9). *Mitigation:* manifest-level commit serialization; two evidence classes, stated in advance.
4. **Platform gating.** `SharedArrayBuffer` (cross-origin isolation), `performance.measureUserAgentSpecificMemory` gating, `performance.memory` deprecation. Telemetry design must degrade honestly.
5. **Rule erosion.** "No truth in userData" gets gamed into closures/module maps; transform authority is the likeliest accidental violation (drag interactions). *Mitigation:* wipe test + whitelist lint + an explicit governing decision on transform authority — **this decision is currently missing and should not be deferred silently**.
6. **Comfort regressions.** Progressive materialization done wrong is a peripheral strobing source — potentially worse than hard cuts. The "no progressive materialization, hard cuts + collapse-first" null hypothesis must be kept on the table until F1/F9 perceptual proxies say otherwise.
7. **One-PR tension.** Everything above could tempt a big-bang rewrite, violating the rule. The recommendation in §8 is sized to a single forward PR; everything else is sequenced behind evidence gates.
8. **Value-function unfalsifiability.** If weights stay hand-tuned, the whole policy is unfalsifiable (A5). SLA-derived weights or nothing.

---

## 7. Prior art to verify

Committee cannot browse; items are anchored from knowledge and marked with confidence. **Verification is an assigned task, not a formality** — several citations below are load-bearing.

| Item | Relevance | Verify | Confidence |
|------|-----------|--------|------------|
| Denning 1968, working-set model | The literal ancestor of "semantic working set"; paging analogy and its limits | Exact framing; whether working-set theory's non-stationarity critiques apply here | High |
| Funkhouser & Séquin 1993, adaptive display | Cost/benefit-bounded LOD selection — closest ancestor of the whole problem | Algorithm details; whether its benefit function maps to semantic value | High |
| Hoppe 1996/1997 progressive + view-dependent meshes; QSplat (Rusinkiewicz–Levoy 2000) | Progressive refinement machinery | Applicability to semantic (non-mesh) content | High |
| Luebke et al., *Level of Detail for 3D Graphics* | Hysteresis in LOD switching (A6) | That hysteresis is actually treated there; quantitative guidance | Medium-high |
| OGC 3D Tiles; Cesium | Streaming refinement modes, SSE budgets; traversal ordering fairness | Whether 3D Tiles addresses starvation/identity continuity at all (suspected gap) | High |
| Karis et al., Nanite deep dive (SIGGRAPH 2021) | Virtualized geometry as COARSE/REFINED conceptual anchor | Portability lessons to Three.js/WebGL2 | High |
| Impostors / image-based rendering (Schaufler et al., 1990s) | COARSE as impostor (approach F) | Exact citations, applicability | Medium |
| Foveated rendering literature (Watson/NVIDIA and others) | Perceptual cost model, peripheral-change comfort (G7) | Concrete change-blindness/comfort thresholds usable as SLA constants | Medium-high |
| LRU-K (O'Neil 1993), ARC (FAST '03), LIRS, TinyLFU, 2Q | Working-set admission/eviction (B) | Which policy fits bursty spatial access; scan-resistance evidence | High |
| Liu & Layland 1973; DRR (Shreedhar–Varghese 1995); WFQ | Reserves/fairness proof obligations | Applicability of network fairness proofs to frame-budget service | High |
| Adapton / Salsa / self-adjusting computation / differential dataflow; Elliott push-pull FRP | Pull architecture (D) — the main competitor | Bridge cost to WASM/Three.js; worst-case propagation bounds | High (existence), Medium (fit) |
| Erlang/Akka bounded mailboxes; Reactive Streams; Akka Streams bounded stages | Backpressure-by-construction (E) | Web-worker transfer costs for large meshes; SAB preconditions | High |
| Browser `scheduler.postTask`, `AbortController`, React concurrent lanes | In-platform scheduling/cancellation prior art | Cancellation semantics worth copying | High |
| Three.js dispose patterns; `renderer.info`; KTX2/Draco async pipelines; `FinalizationRegistry` caveats | Resource hygiene (G6) | Current dispose recommendations; canary feasibility | High |
| FoundationDB simulation; TigerBeetle VOPR; Jepsen/Maelstrom | Deterministic replay/fault-injection harness design (E7, F8) | Applicability of deterministic-simulation patterns to render-loop systems | High (existence), Medium (transfer) |
| Virtual texturing (id Megatexture lineage) | Bounded upload/backlog prior art | Frame-budgeted upload scheduling references | Medium |
| **Semantic-graph streaming visualization** | Likely thin — the semantic dimension may be the genuinely novel part | Existence of any LOD/streaming work over semantic graphs with identity continuity; if absent, record as a novelty claim with evidence | **Gap — verify** |

Also: request access to any internal nemosyne design docs; absence of internal prior art is itself a finding the committee must record.

---

## 8. Recommended next engineering decision

**Committee verdict: ABSTAIN on scheduler family, cancellation depth, LOD tier count, and worker topology — each paired with its lifting experiment (E1, E2, E4, E5). DO NOT implement the scheduler yet.**

**Recommended single forward implementation PR — "SWSE-0": the contract + evidence layer, not the policy.**

Contents (all additive, feature-flagged, revertible, sized to one reviewable PR):
1. **Identity contract:** opaque, monotonic, non-recycled EntityId with a lossless boundary encoding; no id recycling anywhere.
2. **ProjectionRegistry + exactly-one invariant (G3)** with audit/self-heal, duplicate and ghost counters, and a dev whitelist linter on `userData` keys (G1 enforcement aid).
3. **WASM telemetry ring buffers + semantic hash** (§4.5) with honest drop counters.
4. **Falsifier harness for F3 (reverse traversal), F8 (fault injection), F9 (teleport flood)** runnable in CI **against current main**, producing the baseline observations the committee currently lacks.
5. **Wipe-rebuild test** (G1) and **replay trace recorder** (G8 substrate).
6. **Budget counters exposed but unenforced** (presence/refined/in-flight bytes) — measurement before enforcement.

Acceptance criteria: zero behavior change on existing paths; E6 telemetry-cost budget met; E7 replay equivalence demonstrated on the recorded subset; F8 proves the audit actually fires (fault-injection-tested enforcement).

**Explicitly deferred behind gates:** lane weights and lane count (needs E1 + SLA derivation); cooperative cancellation (E2); third LOD tier (perceptual evidence, F1); worker pool (E5); prefetch policy (F2 data). Any subsequent policy PR must name the falsifier it is designed to pass and the invariants (G1–G9) it preserves — a PR that cannot name its falsifier is not ready under this committee's criteria.

**Why this and not a scheduler now:** every open choice (§2 table) is contested by a live counterargument (§3), and every contest is decidable only by the falsifiers above. The contract layer is the one component that is *necessary under every branch* of the decision tree, is itself falsifiable (F8/E6/E7 test it), and converts the committee's abstentions from indecision into a scheduled decision procedure. That is the strongest move compatible with ABSTAIN, evidence admissibility, and the one-forward-implementation-PR rule.