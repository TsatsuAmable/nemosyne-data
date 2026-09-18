# UXR3/UXR4 — Adversarial Research Report
## Bounded Semantic Working Sets for Long VR Sessions (nemosyne.world)

**Epistemic status of this document.** Per the governing criterion *model consensus is not authority*, this report is a **hypothesis ledger + experiment plan, not evidence**. We tag every load-bearing statement: **[C]** governing criterion (given, not ours to question), **[O]** observation (publicly verifiable platform fact, cite-checkable), **[H]** hypothesis/claim (attackable, must be falsified before it becomes design authority). We could not clone current main within this session; all statements about existing code are **[H] pending verification**. No PRs opened; at most one forward implementation PR is proposed (§8), preserving the one-forward-PR rule.

---

## 1. Problem

**Working definition.** The *semantic working set* (SWSet) is the set of semantic entities referenced within a recent window of the user's attention/traversal stream — Denning's working-set model **[O]** (Denning 1968) applied to semantic payloads rather than pages. The system must keep *resident* semantic material ≈ this working set under hard bounds.

**Constraints.**

- **Frame budget** [O]: 72–90 Hz XR gives 11.1–13.9 ms/frame total; WASM analysis on the main thread must be a strict time-slice (~2–3 ms), or move to a Worker.
- **Memory** [O]: wasm32 linear memory is grow-only at 64 KiB page granularity (`memory.discard` is recent/Chrome-only, verify); mobile XR browsers cap heaps well below desktop; JS-side render resources (geometries, textures) are reclaimable by the browser without notice (WebGL context loss [O]).
- **Long sessions**: hours of churn; leaks compound; counters must not wrap; eviction/revisit cycles must not fork identity; telemetry must remain complete or the run is *inadmissible* **[C]**.
- **Truth location** [C]: Rust/WASM is analytical authority; Three.js/`userData` may not hold durable semantic truth; ABSTAIN must exist as a first-class outcome, not silent degradation.

**Failure classes the assignment names, made precise:**

1. **Queue starvation**: cheap-and-numerous COARSE ops flooding a shared queue so expensive-and-rare REFINED ops (or reconstruction, or telemetry flush) never run; and the inverse (refine lanes monopolized by one entity or one region).
2. **Stale-async misapplication**: late results clobbering newer state after eviction, collapse, supersession, or entity death.
3. **Resource leakage**: WASM live-bytes creep, JS closure retention of disposed Three.js objects, orphaned promises/envelopes, timer/listener accumulation, render-resource growth that never returns to baseline.
4. **Identity fork**: semantic identity tied to Object3D instances/array indices so evict→return, clone, pooling, or context loss forks or loses truth.

**Specification ambiguities found (flag, don't resolve):**

- **"Collapse" is undefined in the brief.** We distinguish **Collapse A** (involuntary teardown: XR session end, page hide, OOM, WebGL context loss) from **Collapse B** (intentional semantic fold: refined entities folded into coarse region summaries, e.g., on zoom-out). Both need fencing and reconstruction, but with different persistence obligations. Engineering must ratify this or a better taxonomy.
- **Authority boundary**: does "Rust/WASM analytical authority" mean client-only, or is a server allowed to be the *source* of semantic content with WASM as *adjudicator*? This changes the reconstruction tier architecture (§4.4) materially.
- **Multi-user continuity**: if sessions can be shared, identity continuity needs inter-client semantics (ORSet/CRDT-like) — a scope question, not a design detail.

---

## 2. Competing Approaches

| # | Approach | Mechanism | Fails on |
|---|---|---|---|
| A | Naive on-demand | request on attention, await, apply directly | unbounded memory; no fencing; starvation; leaks — keep only as bake-off baseline |
| B | Priority queue + LRU (three.js `LOD`/`LoadingManager` idiom) | single priority queue, LRU cache | starvation under coarse flood; no admission control; ad-hoc staleness; no fairness guarantees |
| C | **Composed OS-style stack** (proposed): working-set residency (Denning/PFF) + benefit/cost scheduling (Funkhouser & Sequin) + imprecise refinement (mandatory coarse / optional refined chunks, Liu et al.) + ARC-family adaptive cache + DRR/aging fairness + AIMD admission windows | see §4 | complexity — must be staged, each stage gated by a falsifier |
| D | Incremental-view/dataflow model | SWSet as maintained query results, epoch-based invalidation | strong if semantics are query-driven ("show all X"); heavy infra if purely attention-driven |
| E | Event-sourced resumability (Qwik-style) | full replay for reconstruction; deterministic derivations | great reconstruction, poor latency; viable as a *tier*, not the whole design |
| F | Worker-isolated authority | same algorithms, WASM authority in a Worker; fences via postMessage/SAB | SharedArrayBuffer requires COOP/COEP cross-origin isolation [O]; decision forced by experiment F9 |
| G | Server-paged semantics (MemGPT-like: client as thin pager) | server holds context, client pages | conflicts with the authority criterion *if* read as client-authoritative; conflicts are exactly why the boundary question (§1) must be settled first |

**Prior art closest to C:** CesiumJS's tile request scheduler (priority + cancellation of stale loads when the camera moves — a real-world precedent for epoch-fenced streaming in a browser 3D client; verify current main), game-engine HLOD/World-Partition streaming, imprecise-computation scheduling, and MemGPT (LLM context as an OS with paging). **Novelty claim [H, attackable]:** we find no prior system combining working-set paging + imprecise refinement + semantic zoom + WASM-authority-in-browser for VR semantics. This claim requires the §7 search pass before it may be asserted in docs.

---

## 3. Strongest Counterarguments

1. **"COARSE→REFINED may be a premature abstraction."** If coarse content requires an LLM round-trip, the two-stage path may *increase* time-to-useful-content and multiply cost under sweeps. Counterproposal inside our own design: **coarse must be derivation, refined may be computation** — coarse is deterministically derivable from resident/cheap sources (store fields, region summaries); anything needing generation belongs to refined. If even derived-coarse is never read before refined arrives (F6), the stage should be dropped in favor of Ghost→Refined with declared skeletons. We concede the premise is unproven until F6.
2. **"WFQ+AIMD+ARC is server-grade machinery for a client."** Rebuttal: the failure modes (starvation, thrashing, silent overload) are *structural*, not load-dependent — they occur at burst boundaries even at low average load. But we accept the discipline: adopt only components whose falsifier shows a measurable delta; the minimum viable fairness guarantee is **aging** (bounded max-wait per class), which is nearly free.
3. **"Generational identity breaks under world edits."** A generation-stamped slot handle gives continuity of *residency*, not of *content*. Content identity needs a second layer: content-addressed `SemanticKey` (same key ⇒ same content; edits mint new keys; world-key→content-key indirection). Without this, "identity continuity" is a slogan. Spec gap flagged.
4. **"The userData prohibition is puritanical; store round-trips cost frame time."** Observations favor prohibition [O]: `Object3D.copy`/clone duplicates userData (historically via JSON round-trip — verify in current three.js), so truth forks silently on clone; pooling/dispose drops it; it is untyped, so no enforceable invariants; context loss takes it hostage. The cost concern is real but is solved by a **read-only batched projection API** (`pull_display_state(handles)` per frame), not by relocating truth.
5. **"Telemetry at this fidelity measures itself."** Valid [H]. Mitigation: O(1) counters, sampled histograms, per-frame batched ring flush; F4 explicitly measures telemetry-on vs telemetry-off delta.
6. **"Long-session soaks rot in CI."** Valid. Mitigation: two harness forms — accelerated-clock (logic/starvation properties) and real-time (memory/GC realism, cannot be virtualized) — plus headless WebXR emulation; flag that no emulation reproduces mobile GC, so at least one quarterly real-device soak is mandatory.
7. **"ABSTAIN will read as 'the world feels dead.'"** ABSTAIN is a contract instrument: it converts silent degradation into declared, telemetered states, which is what makes SLOs honest. But the *rendering* of ABSTAIN (skeleton with visible state, not blank) is a UX decision the committee cannot make; flag it.
8. **"ARC's adaptation constants are wrong at VR timescales."** Possibly true [H]: ARC tunes recency↔frequency balance for storage I/O patterns; VR revisit behavior (hub-and-spoke tours vs. linear sweeps) may sit elsewhere. F5 exists to falsify the tuned-τ variant; if plain LRU-with-hysteresis is within threshold on real traces, **simplification wins** — our own complexity bias is a named risk (§6).

---

## 4. Proposed Algorithms & Designs

### 4.0 Identity layers (continuity before anything else)

- **L1 Handle**: `EntityId = (slot: u32, generation: u32)` via slotmap/generational arena [O] (Rust crates exist; verify). JS holds the opaque 64-bit handle only. Dead generations make stale references *impossible to confuse* with reborn entities.
- **L2 Key**: content-addressed `SemanticKey` for cross-epoch continuity (evict→return, collapse→reconstruct); world-key → content-key indirection absorbs world edits.
- **L3 Payload provenance**: every payload tagged `ground` (curated/source) vs `derived{derivation_version, inputs_hash}` vs `contested` (LLM output). Contested payloads are admissible content but never presented as ground truth — this is the in-system echo of the model-consensus criterion, and it feeds ABSTAIN (§4.7).

### 4.1 Fencing: the applier chokepoint (single writer)

All async results are **envelopes** carrying `(entity_id, session_epoch, op_seq, level, payload, provenance)`. One function may mutate entity payloads:

```rust
fn try_apply(env) -> Outcome {
  if env.epoch != self.epoch                    { StaleSession }     // fences collapse/teardown
  let Some(e) = self.entities.get(env.id)       else DeadEntity;     // slotmap generation check implicit
  if env.op_seq <= e.last_seq(env.op_class)    { Superseded }       // fences query changes
  if env.level < e.level                        { NonMonotonic }    // Ghost→Coarse→Refined only, per epoch
  if !self.budget.admit(env.bytes)              { BudgetRejected }  // park / evict / ABSTAIN
  e.apply(env); Applied
}
```

Every arm is a counter. **Key claim [H]:** *cancellation is an optimization, never a correctness mechanism.* JS `AbortSignal` stops useless work; correctness comes solely from epoch/generation/op_seq validation at apply time — abort semantics are best-effort [O] and cannot interrupt in-flight work. Falsify via F2/F7.

### 4.2 Scheduling: fairness against starvation

- **Classes**: C (coarse), R (refine), P (reconstruct/park), M (maintenance/telemetry-flush). M has a guaranteed minimum share or an overflow policy of *count-total/sample-subset* — losing evidence silently is itself an admissibility failure [C].
- **CPU axis**: per-frame slice budget split by deficit-round-robin across classes (DRR [O]; Shreedhar & Varghese 1996), with **aging**: any request older than class max-age is promoted. Per-entity cap: ≤1 pending refine per entity; per-entity share of window bounded (anti-monopolization).
- **I/O axis** (network/LLM/IndexedDB — non-blocking, separate from CPU): per-class in-flight windows controlled by AIMD against an SLO (Chiu & Jain 1989; Netflix adaptive-concurrency precedent). Window full ⇒ **shed to ABSTAIN with telemetry**, never block the frame loop, never grow queues unboundedly (hard queue caps).
- **Coarse-flood defense**: dwell/traversal gating with a hard cap (≤K coarse materializations/sec); sweeps over N entities leave most as Ghost until they clear the gate. **Prefetch is keyed to the traversal horizon (locomotion, predictable at 1–10 s), not gaze (saccades, 20–80 ms — too fast to serve [O])** — "arrive before the user does."
- **Thrashing rule (Denning's insight, adapted)**: when working-set demand persistently exceeds resident supply, the correct response is *shrinking concurrency* (wider Ghost gating, degraded mode), not more paging. **Refinement debt** ledger (attended-but-unrefined count) is the detection signal.

### 4.3 Cache & eviction

- v0: LRU + **hysteresis** (materialize at θ_on, evict at θ_off, gap between; dwell-pinning) to kill boundary flapping.
- v1 candidate, gated on F8: ARC-style adaptive recency↔frequency with ghost lists (Megiddo & Modha 2003) or benefit-weighted Greedy-Dual (Cao & Irani 1997) — evict `argmin benefit_decay(ref_recency, attention, importance) / cost_to_rematerialize`.
- **Park tier**: evict-to-park (fresh payloads retained in a bounded L0 in-memory park; L1 IndexedDB snapshot; L2 origin/derivation). ARC ghost lists operate at each tier boundary. Anti-gaming: return-boost (elevated benefit for previously-refined keys on return) is capped per key per session.

### 4.4 Collapse & reconstruction

- Single entry point `fence_and_collapse(kind)`: bump session epoch (fences all in-flight envelopes atomically), then per kind: **A** → park-what-you-can (graceful) or hard-drop (count everything), reset residency; **B** → fold children into parent region summaries, park payloads, bump child generations.
- Return path: re-reference of `SemanticKey` → tier lookup → Coarse applied synchronously if L0/L1 hit → Refined scheduled with return-boost. Snapshots are atomic/versioned (last-good-wins; WAL-style patterns) because mobile teardown can kill mid-write [O].
- **WebGL context loss** is a first-class reconstruction case, not an error path: authority is untouched (it lives in the store), render caches are invalidated and re-derived. Falsify by injecting `WEBGL_lose_context` mid-soak (F3).

### 4.5 The userData rule (enforced, not aspirational)

- **Invariant I1**: Three.js objects carry only `nsw.handle`, `nsw.displayEpoch`, `nsw.levelCacheTag` (epoch-stamped, reproducible display cache). No payloads, no priorities, no queue state, no truth.
- Enforcement: CI grep gate (whitelist), a soak-mode scene-walk validator (every N seconds: whitelist + cache-epoch coherence vs store), and a persistence gate (no `JSON.stringify(scene)`-style persistence; snapshots only via the store's typed serializer).
- Reads that need per-frame semantics go through the batched read-only projection API (§3.4), so the prohibition has no performance excuse.

### 4.6 Telemetry & admissibility

- Counters (monotonic u64): applied; dropped{stale_session, stale_generation, superseded, dead, non_monotonic, budget_rejected}; shed{class, reason}; abstain{class, reason}; queue-wait histograms per class; in-flight/window per class; tier hit/miss/evict/park; **live-bytes via counting `GlobalAlloc`** (honest WASM live-set; reserved-bytes from `memory.buffer`), JS heap via `measureUserAgentSpecificMemory` (cross-origin-isolated only [O]); `renderer.info` geometry/texture counts as *corroborating observation, not governing telemetry*; late-frame ratio; WASM slice histogram; refinement debt; collapse/recovery times.
- All records stamped `(session_epoch, frame, mono_time)`; clocks (`performance.now`, frame index, XR time) declared with drift notes. **Admissibility rule [C-adapted]: a run is inadmissible if any decision/apply point lacks a counter outcome** — F7 enforces this exactly.

### 4.7 ABSTAIN at three levels

1. **Request-level**: applier returns `Abstain{WindowFull|BudgetExceeded|EvidenceInsufficient}` — payload absent, never fabricated.
2. **Session-level**: sustained overload flips a *declared degraded mode* (no refine promises, coarse-only) — visible state, telemetered, honest SLO.
3. **Evidence-level**: if a benchmark run's telemetry coverage is incomplete, the evaluation itself ABSTAINs from conclusions.

---

## 5. Decisive Experiments (pre-registered; ABSTAIN if coverage incomplete)

| ID | Attacks | Method | Pass threshold (pre-registered placeholders — engineering must ratify) | If failed |
|---|---|---|---|---|
| **F1** Sweep-flood starvation | H: WFQ+aging+dwell-gating bounds both coarse and refine under floods | 4 h scripted: 500-entity sweeps every 60 s, 4 s dwell on 3 | refine p95 wait ≤ 10 s for attended entities; coarse p95 ≤ 250 ms; debt bounded | retune weights/lanes; consider class lanes |
| **F2** Theseus soak (identity + leaks) | H: generation fencing has zero misapplies; long-run memory plateaus | 8 h continuous evict/rebirth (0.5–5 s/entity) with async storm | zero envelope misapplies; live-bytes slope over last hour < ε; `renderer.info` returns to baseline after full-evict cycle; zero unresolved envelopes after fences | fencing redesign or leak fix; block v1 policies |
| **F3** Collapse & context loss at hour 3 | H: epoch fences all in-flight; authority survives renderer death | inject `loseContext()` + hard collapse mid-storm | zero post-collapse applies; identity key-set preserved; recovery ≤ bound; userData validator clean | reconstruction redesign |
| **F4** AIMD stability | H: windows converge under overload without frame damage | latency injection sawtooth 100 ms→10 s, offered load > capacity | windows converge, no runaway oscillation; late-frame ratio < 1%; sheds only via declared ABSTAIN; telemetry-on/off delta measured | simplify to fixed window + shed |
| **F5** Revisit economics | H: park + ARC-tuned-τ beats plain LRU on hub-and-spoke traces | Markov user model; park hit rate; reconstruct latency | ARC/benefit delta ≥ threshold vs LRU on miss-cost; else **keep LRU** (complexity bias check) | keep v0 policy; log the negative result |
| **F6** Coarse value (attacks the core premise) | H: coarse is read before refined arrives and improves time-to-useful | in-session A/B: coarse+refined vs refined-direct-with-skeletons | coarse read-rate ≥ threshold; time-to-useful not worse | drop/gate coarse stage |
| **F7** Telemetry exactness | H: applier rejects 100% of corrupted envelopes and counts match | inject mis-stamped envelopes in F2 run | rejection = injections, counters exact | admissibility gate fails; block all conclusions |
| **F8** Offline policy bake-off | H: policy deltas are real on *recorded real traces* (provenance recorded) | LRU vs ARC vs benefit-GD vs clock variants, deterministic replay | adopt complex policy only at ≥ 15% miss-cost reduction | simplification wins |
| **F9** Worker vs main-thread slicing | H: architecture fork decidable by measurement | same workload, Worker+SAB vs cooperative slicing | frame p99 delta decides | — |
| **F10** Clock/timer/counter integrity | H: no drift accumulation, no wrap, no timer leaks | 6 h low-event run; teardown audit | zero leaked timers; u64 epoch headroom; hysteresis flap-rate below bound | audit counter widths, add flap dampers |

Sequencing: **F2, F6, F7 first** — fencing correctness, the premise of coarse, and evidence exactness are upstream of all tuning.

---

## 6. Risks

1. **Over-engineering (named, self-directed)** — full stack C is a lot of client machinery. Mitigation: staged adoption; each stage survives only on falsifier deltas (F5/F8 are explicitly allowed to *fire us*).
2. **Single-threaded reality** — cooperative slicing can't enforce budgets on opaque third-party CPU work; anything non-sliceable must be worker-bounded or banned. SAB/COOP-COEP may be unavailable ⇒ F9 decides, and the fallback (time-slicing) must be designed first anyway.
3. **Mobile heap caps & grow-only WASM memory** [O] — counting allocator is mandatory; `memory.discard` availability is platform-fragile (verify Chrome version); budget must assume no shrink.
4. **IndexedDB is best-effort** [O] — browser evicts under pressure; `navigator.storage.persist()` is advisory; L1 is a cache tier, never a durability claim; ABSTAIN covers its loss.
5. **LLM nondeterminism** — refined payloads are only cacheable under content-addressing `(key, derivation_version, inputs_hash)`; without it, reconstruction can't be tested deterministically.
6. **Observer effect of telemetry** (F4 measures it); **soak rot** (dual harness + quarterly real-device soak); **ABSTAIN's product feel** (UX decision pending); **multi-user scope creep** (open question §1); **priority inversion via per-frame display pulls** (projection API must be O(1)/entity and budgeted).

---

## 7. Prior Art to Verify (search pass before any doc claims)

- **Working-set theory**: Denning 1968 (CACM); Denning 1980 "Virtual Memory" (CSUR); PFF; thrashing/working-set gap. Smith 1982 "Cache Memories" (50% rule).
- **Caches**: ARC (Megiddo & Modha, FAST '03); CAR (Bansal & Modha, FAST '04); GD/GD-size/GD* cost-aware caching (Cao & Irani, USITS '97); TinyLFU/W-TinyLFU (Einziger et al., ~2017; Caffeine).
- **Scheduling**: DRR (Shreedhar & Varghese, SIGCOMM '96); stride/lottery (Waldspurger & Weihl '94); DRF (Ghodsi et al., NSDI '11); imprecise computation (Liu et al., 1991); benefit/cost LOD (Funkhouser & Sequin, SIGGRAPH '93); AIMD (Chiu & Jain '89); singleflight (Go x/sync); Netflix adaptive concurrency.
- **3D streaming/LOD**: progressive meshes (Hoppe '96); chunked LOD (Ulrich '02); CesiumJS `RequestScheduler` (priority + cancellation — read the source); three.js `LOD`/`LoadingManager`; sparse virtual textures (Barrett '08); id Tech megatexture (van Waveren '08); Unreal HLOD/World Partition; WebGL context-loss handling (Khronos wiki + three.js behavior).
- **Semantic zoom / attention**: Pad++ semantic zooming (Perlin & Fox '93; Bederson & Meyer); gaze-contingent/foveated loading literature.
- **LLM memory**: MemGPT (Packer et al. 2023 — LLM context as OS paging); Generative Agents (Park et al. 2023 — relevance×recency×importance scoring); GPTCache; progressive summarization.
- **Web platform**: RFC 5861 (SWR); `AbortSignal` semantics (abort ≠ interrupt); `WeakRef`/`FinalizationRegistry` timing is implementation-defined [O] — never correctness-bearing; `scheduler.postTask` (Chromium-only); `performance.measureUserAgentSpecificMemory` (isolation-gated); SharedArrayBuffer/COOP-COEP; WebAssembly memory-control proposal (`memory.discard`, Chrome ~129 — verify); `XRSession.visibilitychange` (opportunistic maintenance window during blur — an unexploited design hook); WebXR emulators for headless soaks.
- **Identity/concurrency primitives**: slotmap / generational-arena crates; EBR/RCU (McKenney); SQLite WAL atomicity; Qwik resumability; React `useSyncExternalStore` tear-free reads (analogous problem shape).

---

## 8. Recommended Next Engineering Decision

**Ratify one forward implementation PR — the "Semantic Store Spine v0" — and nothing else yet:**

1. Slotmap with generations; session epoch; single applier chokepoint with all-outcome counters (§4.1).
2. Two bounded queue classes (C, R) + aging + hard caps + shed-to-ABSTAIN; per-frame cooperative slice budget.
3. LRU-with-hysteresis + dwell-pin + park L0 (in-memory only; IndexedDB tier deferred).
4. `fence_and_collapse(kind A|B)` entry point.
5. Counting-allocator live-bytes + telemetry ring buffer with schema; userData whitelist + soak validator + CI grep gate + persistence gate.
6. Batched read-only display projection API (removes the performance objection to I1).

**Acceptance gate:** F2-lite (1 h Theseus soak) + F7 (counter exactness) green. **Acceptance is falsification, not review.**

**Explicitly deferred pending falsifiers:** WFQ weights (F1), ARC vs LRU (F5/F8), Worker architecture (F9), coarse-stage retention (F6). **Rejected sequencing alternatives:** scheduler-first (policy results are inadmissible without a correct, instrumented spine); persistence-first (persisting unfenced state bakes races into snapshots).

**Three decision-forcing questions to resolve in a decision doc before/alongside the PR (no code):** the authority boundary (client-only vs server-source/WASM-adjudicated), the collapse taxonomy (A/B as defined here, or better), and multi-user identity scope.

*This committee's output is hypotheses until F1–F10 return verdicts; per the governing criterion, no portion of this document constitutes evidence, and consensus among models — including this one — confers no authority.*