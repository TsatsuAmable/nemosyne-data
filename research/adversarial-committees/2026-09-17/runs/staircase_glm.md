# Adversarial Research Memo — Staircased Rendering Architecture (Candidate "Architecture A") vs. Policy-Neutral SWSE-0

**Committee charter:** research only. No source edits, no PRs opened, no durable artifacts written. All content below is a proposal for evaluation, not a decision. Model consensus (including this committee's own) is non-authoritative.

**Epistemic tags used throughout:**
- **[G]** governing criterion (invariant we are directed to preserve)
- **[O]** observation (source: the tasking prompt, or stated prior art at concept level)
- **[C]** claim — testable, currently unverified; each carries an experiment ID
- **[U]** unknown — requires codebase/user verification
- **[ABSTAIN]** — we decline to assert; evidence missing

---

## 1. Assumptions Under Explicit Uncertainty

We have no direct observation of the nemosyne.world codebase. The following tasking terms are treated as given roles, not verified facts:

| Term | Working assumption | Status |
|---|---|---|
| UXR3 / UXR4 | Upcoming UX-readiness milestones whose exact gate definitions live in project docs | [U] [ABSTAIN on definitions] |
| SWSE-0 | The current policy-neutral render baseline; scheduler added later ("SWSE-0 + later scheduler") | [U] [ABSTAIN on exact contract] |
| Durable semantic truth | Claim-bound evidence store with stable entity identity; render layer is downstream, lossy projection | [G], role per tasking |

If any of these roles differ from the actual project docs, Sections 5 and 6 are **conditional** on that difference and must be re-derived.

**ABSTAIN register (not asserted anywhere below):** current renderer API; WebGL2 vs. WebGPU; worker topology and SharedArrayBuffer/COOP-COEP availability; actual entity counts, graph shape, and claim densities; existing telemetry infrastructure; existing test/replay harness; user population size available for A/B.

---

## 2. Governing Criteria and Derived Requirements

**[G] Invariants (from tasking):**
1. Rust/WASM analytical authority — scheduling/admission decisions live in Rust/WASM, not JS heuristics.
2. Stable semantic identity — entity identity never changes as a function of representation level.
3. Bounded long-session resources — no unbounded accumulation over multi-hour sessions.
4. Claim-bound evidence — nothing derived at render time becomes durable truth.
5. Deterministic replay where feasible — same inputs → same scheduler decisions, or explicitly recorded decisions.
6. One-forward-implementation-PR discipline — a single forward path; experiments additive and feature-flagged, never forking mainline or durable truth.

**Derived requirements (committee, tagged):**
- R1: Every rendered datum must have an unconditional *presence floor* — no entity may become invisible merely because a smart scheduler declined it. [C, from G3 + fairness; tested by E7]
- R2: All policy must be explicit and measurable; silent constants are covert policy. [C; motivates §5]
- R3: The architecture must be implementable as one PR-sized, flag-isolated tranche. [G6]
- R4: Derived visual state must be reconstructible after eviction from a bounded residue, and reconstruction must be perceptually continuous. [C; tested by E4]

---

## 3. Architecture A — Banded Admission Ladder

### 3.1 Representation ladder (as tasked, five bands)

Each band is defined by a **cost vector**, not a narrative. Cost vectors are data, to be measured first (Experiment E0). Bands are **cost bands, not an implementation ontology** — see §4.1.

| Band | Representation | Cost model (claim, to measure) | Contract |
|---|---|---|---|
| **L0 Presence** | Point/glyph, instanced | O(1) per entity; ~tens of bytes/entity GPU-side; no per-entity CPU work [C] | Always on. Unconditional floor (R1). Hit-testable for identity. |
| **L1 Structure** | Cluster/container/hull; cluster-level edges only | O(clusters), not O(entities) [C] | Containers must conservatively contain members under current layout epoch. Membership is **derived, never durable** [G4]. |
| **L2 Semantic** | Labels, typed edges on admitted subset | Dominated by text layout + collision avoidance, not geometry [C] | Labels must not move anchors. Edge sampling must be deterministic given epoch. |
| **L3 Geometry** | Full per-entity geometry, local layout refinement | Dominated by GPU upload + layout passes [C] | Anchor position changes only via explicit layout-epoch animation. |
| **L4 Analytical** | Interactive/analytical views (expansion, cross-filter, on-demand WASM analysis) | Dominated by CPU/WASM analysis ops [C] | Invoked per-task, fenced by epoch; results are claims-adjacent outputs only if they enter the evidence store through normal claim channels. |

**Critical separation (committee position):** *identity resolution* (hover/selection hit-testing) is **not** a band capability. It must be available at L0 via spatial index, or identity continuity collapses at the floor (§4.4, F2). "Interactivity" as a cost ladder rung conflates two things: always-on affordances (cheap, mandatory) and admitted analytical depth (expensive, scheduled).

### 3.2 Identity continuity contract

- `EntityId` is durable and level-invariant [G2].
- Each entity carries an **anchor**: layout-space position bound to a `layout_epoch`. Band transitions **never** mutate anchors. Only explicit layout-epoch advancement moves anchors, and that motion is animated, not incidental. [C — this single rule prevents the dominant class of "promotion jumps" perceptual breaks; tested by E4]
- L1→L2 must not reveal an entity visually outside its L1 container; container geometry recomputes on layout-epoch change, atomically at a frame boundary.

### 3.3 Scheduler staircase

Tasking asks whether scheduler sophistication should staircase with representation cost. Two hypotheses:

- **H_A (coupled):** L0 under S0 (fixed budget/round-robin, deterministic); L1–L2 under S1 (cache/value admission); L3 under S2 (perceptual QoS); L4 under S3 (predictive/learned). Rationale: dumb-but-fair where cost is trivial, smart where value justifies complexity.
- **H_B (decoupled substrate, tiered parameters):** one scheduler core — a pure function of (queue, budget vector, epoch, seed) → admission decisions — with per-band policy *parameters*. Sophistication ramps across *deployment tranches* (S0→S1 in the first PR; S2 later; S3 only in shadow mode), not as parallel scheduler implementations.

**Committee position (proposal, not verdict):** H_B with an unconditional S0-semantics floor for L0. Rationale: H_A's four schedulers × five bands is a ~20-cell test matrix (§4.5 trap T2); H_B keeps one replayable decision function and lets E0 measurements assign bands as data. The floor guarantee (R1) is a constraint under both hypotheses and is not negotiable.

**S3 (learned) is quarantined:** shadow-decision mode only — it may *log* predictions, never *act*, until it beats S2 by a pre-registered margin on E1/E2/E7, and it must run inside the Rust/WASM core with recorded-decision replay [G1, G5]. Its nondeterminism is a direct threat to G5.

### 3.4 Contracts

**Promotion.** Trigger: attention/value score ≥ θ_up AND per-axis budget headroom AND current epoch. Effects commit **atomically at a frame boundary**: the new band's resources are prepared asynchronously, staged, and swapped in at frame commit; old resources freed after a fence grace (e.g., 2 frames). Cross-fade is a visual overlay of two fully-formed states, never a state blend. Direct multi-band jumps (e.g., L0→L2 for a search hit) are permitted with priority tokens — this is the discoverability bypass (§4.6).

**Demotion.** Score < θ_down where θ_down = θ_up − margin (hysteresis), after minimum dwell time, under LRU pressure, or global rate cap. Pressure demotion may drop multiple bands at once (graceful degradation); ascension is normally one band per entity per commit.

**Hysteresis/cooldown.** Per-entity cooldown after any transition; global promotion rate cap R/sec bounds worst-case frame cost during attention storms. Selection pins an entity's current band (never demote below L2 while selected) **with a bounded pin budget** (e.g., 256) [G3].

**Multi-axis budgets.** Not one scalar. Axes: frame ms, WASM heap bytes, GPU upload bytes/frame, text-layout ops, analysis ops, upstream event queue depth. Per-axis hard caps; greedy admission ordered by (band delta, value, staleness) — *not* per-frame knapsack solving, which is itself trap T3.

**Cancellation/stale fencing.** Every async promotion request carries `(epoch, intent_hash, entity, band)`. On epoch bump (camera/task scope change), in-flight results with stale epochs are **fenced** — dropped and freed — never committed. Results arriving with current epoch but stale intent hash (user changed their mind) go to derived cache or drop, per policy. Fenced counts are distinct telemetry from deferred counts (§3.5).

**Backpressure/fairness.** Deficit round-robin buckets keyed by (band, spatial tile, data source); no hot region monopolizes admission bandwidth. Upstream semantic events coalesce per entity (latest-wins); durable writes always land in the evidence store — only the *render projection* is lossy.

**Eviction/reconstruction.** Demotion-to-L0 retains a bounded **residue**: `(EntityId, anchor, glyph params, last band reached, input hashes, cost hints)`. Residue store size must be O(entities), never O(transitions) [G3]. Reconstruction = re-promotion, validated against input hashes (layout epoch, claim revision). Derived-geometry caches are optional, hash-keyed, byte-capped, session-local, and **never durable truth** [G4]. Initial tranche: no persistence of derived caches at all.

**Truthful telemetry.** "Visible" = committed at a frame boundary, not requested. Record per frame: admitted / deferred / fenced / rate-capped / hysteresis-rejected; per-transition cost vectors; **thrash events** (reversals within cooldown). Telemetry is bounded (ring buffer, sampled), namespaced under the feature flag, never written to the durable store, and aggregated in Rust [G1]. Deliberate anti-metric: "promotions completed" must never be a success metric alone — it rewards thrash and gaming (§4.4, F6).

**Deterministic replay.** Wall-clock frame budgets are machine-dependent, so full replay determinism is likely infeasible [ABSTAIN on current harness]. Proposed safe mode: **decision-log replay** — persist `(inputs, decisions)` per frame; replay mode re-executes the pure decision function against recorded inputs and must reproduce the log byte-identically (E6). This satisfies "where feasible" [G5] without pretending wall-clock determinism exists.

### 3.5 Contract sketch (spec only — not for merge)

```rust
// Research spec. Illustrative; no PR will be opened.
#[repr(u8)] enum Band { Presence = 0, Structure = 1, Detail = 2 } // count = config data, not code (§4.1)

struct EntityId(NonZeroU64);            // durable, level-invariant [G2]
struct Epoch(u64);                       // monotonic; fencing token per focus/task scope
struct LayoutEpoch(u64);                 // orthogonal to band transitions

struct Anchor { pos: [f32; 2], layout_epoch: LayoutEpoch } // band transitions never touch this

struct Residue { id: EntityId, anchor: Anchor, glyph: GlyphParams,
                 last_band: Band, input_hash: u64, cost_hint: CostVector }

struct Budget { frame_ms: f32, heap_bytes: usize, gpu_upload_bytes: usize,
                text_ops: u32, analysis_ops: u32, queue_depth: u32 }

enum Decision { Admitted { frame: FrameId }, Deferred { axis: BudgetAxis },
                Fenced { stale: Epoch }, RateCapped, HysteresisRejected }

// The only scheduling authority: pure fn(queue, budgets, epoch, seed) -> Vec<Decision>
// [G1: lives in Rust/WASM; G5: seedable; E6: replayable via decision log]
```

---

## 4. Internal Attack on Architecture A

### 4.1 Challenge: are five levels right?

**No — five levels are a good communication persona and a poor implementation ontology.** Three arguments:

1. **The ladder assumes a total cost order that doesn't exist.** Semantic enrichment (L2), geometric fidelity (L3), and analytical interactivity (L4) are **partially ordered and budget-axis-separated**: label placement is text-layout-bound; geometry is upload-bound; analysis is CPU-bound [C, E0]. A user may need labels-without-geometry (dense map, names on clusters) or geometry-without-labels (organic structure). A strict ladder forces over-provisioning: to get labels you must pay for geometry, or the levels mis-order per workload.
2. **The number should be measured, not declared.** Bands should fall out of cost clustering from E0 (a cost census on real workloads). Pre-committing to 5 in code makes the ontology load-bearing.
3. **Alternative A′ — floor + orthogonal capability gates.** Three coarse bands: **Floor** (always-on presence), **Structure** (per-cluster, O(clusters)), **Detail** (per-entity admitted). Within Detail, three independent switches — `semantic`, `geometric`, `analytical` — each gated by *its own* budget axis and hysteresis. Reachable state lattice: 2³ = 8 detail states instead of stacked L2/L3/L4. Claimed benefits: decoupled thrash (labels survive while geometry demotes), cost-honest admission. Countered by: more state combinations to test, and a less legible mental model for debugging. **[C — decide via E0 and E2; committee does not pick A vs. A′]**

What is *not* negotiable in either variant: the unconditional floor (R1) and the admitted ceiling. The middle is tunable data.

### 4.2 Challenge: scheduler staircase itself

- **Coupling trap:** if policy tiers are bound to bands in code (H_A), every band re-assignment (which E0 will likely force) becomes a scheduler refactor. H_B makes bands data.
- **S3 is the highest-risk element of the entire design**: cold start, distribution shift, unreplayable decisions, and the temptation to optimize the telemetry rather than the user. Quarantine in shadow mode is a minimum bar; the committee's stronger position is that S3 may never graduate without a reproducible win over S2 on pre-registered metrics (E1, E2, E7) — treat model consensus on learned gains as non-authoritative evidence [G-consistent].
- **Counter-consideration (steelman for H_A):** a dumb deterministic floor and smart admitted tiers may genuinely be simpler to *reason about per band* even if H_B is simpler to *implement*. If E7 shows fairness reasoning is hard on a shared substrate, H_A deserves reconsideration.

### 4.3 Complexity traps

- **T1 — Ontology trap:** encoding 5 levels as enums/types across render, scheduler, telemetry, tests → every experiment touches everything. Mitigation: bands as data (§4.1).
- **T2 — Matrix explosion:** 5 bands × 4 scheduler tiers × 2 axes variants ≈ 40 policy cells to reason about. Mitigation: H_B, one substrate.
- **T3 — The scheduler becomes the expensive visualization:** per-frame knapsack, learned inference, or elaborate value models can themselves blow the frame budget. Rule: admission decision cost must be measured and capped like any other axis (E0). A scheduler that costs more than what it saves is a net loss.
- **T4 — Residue/cache drift:** unbounded residues, logs, or derived caches quietly violate G3. Long-session leak test is mandatory (E5).
- **T5 — Invalidation storms:** derived caches keyed on claims; a claims batch update could re-key everything at once. Mitigation: epoch-batched invalidation; measure worst case (E1 stress profile).

### 4.4 Failure modes (each with detection signal)

| # | Failure | Signal / detector |
|---|---|---|
| F1 | **Thrash** at θ boundary under oscillating attention | Thrash telemetry (reversals/cooldown); E2 |
| F2 | **Identity ambiguity at L0** — identical points lose referents | Misidentification rate in tracking task; E4 |
| F3 | **Discoverability collapse** — attention-gated promotion = UI echo chamber; unseen-but-relevant never surfaces | Findability task on unpromoted entities; E3 |
| F4 | **Starvation of cold regions** under greedy value admission | Max promotion latency per region under attention storm; E7 |
| F5 | **Popping** at band transitions (comfort) | Perceptual discontinuity reports; anchor-drift px measurement; E4 |
| F6 | **Telemetry gaming** (optimizing promotions-completed) | Metric audit: north star = task success + budget adherence |
| F7 | **Epoch race** — stale result committed after focus change | Fenced-commit counter must be structurally impossible (fuzz/property test) |
| F8 | **Heap/VRAM bloat** via residues, caches, pinned entities | E5 high-water marks |
| F9 | **GPU upload stall** straddling frame commit | Frame p99 under promotion bursts; E1 |
| F10 | **Cluster reveal discontinuity** (L1→L2 entity outside hull) | Layout-epoch consistency property test |
| F11 | **Replay divergence** from wall-clock-dependent decisions | E6 decision-log byte-identity |
| F12 | **Flag contamination** of durable truth | E8 byte-identical durable writes with flag off |

### 4.5 Comfort and discoverability implications

- **Comfort:** band transitions must be opacity/scale crossfades within a stable layout; reduced-motion preference respected; layout churn is an orthogonal but compounding risk — the staircase must not add to it. Flicker between bands (F1/F5) is the primary comfort risk of this architecture.
- **Discoverability:** this is the architecture's deepest UX risk. Attention/value-driven promotion structurally biases toward what the user already looks at. Mitigations to test, not assume: (a) search-hit direct promotion bypass (priority token); (b) a bounded *curiosity quota* — fairness-driven promotion sampling of unattended regions; (c) L1 structural band as always-derivable overview. **[C: whether mitigations suffice is exactly what E3 decides; ABSTAIN on the outcome]**

---

## 5. Comparison: Architecture A vs. SWSE-0 + Later Scheduler

**Honest framing first:** SWSE-0 is not actually policy-neutral. Any baseline has cutoffs, render order, and eviction constants; if they exist, they are **implicit policy** — unmeasured and unaccountable. The staircase's genuine advantage is not performance but **explicitness** (R2): policy becomes data, telemetry, and test surface.

| Dimension | A: Staircase | B: SWSE-0 + later scheduler |
|---|---|---|
| Front-loaded complexity | High (admission machinery, fencing, hysteresis, telemetry) | Low |
| Policy explicitness | High; measurable, tunable | Low until scheduler lands; hidden constants |
| Long-session bounding (G3) | Structural (floors, caps, residues, rate limits) | Coarse caps; capacity-cliff or silent-drop risk [C] |
| Graceful degradation | Laddered (floor never lost) | All-or-nothing tendencies |
| Discoverability | At risk (F3); mitigations speculative | Uniform — everything rendered or nothing |
| Identity continuity | Requires deliberate anchor contract | Trivial (uniform representation) |
| Replay determinism (G5) | Needs decision-log mode (E6) | Simpler by default |
| A/B baseline validity | Must be flag-isolated (E8) | Is the baseline |
| Risk profile | Interaction-quality risk; complexity trap T1–T3 | Capacity risk; "no policy" becomes policy at scale |
| Compatibility with G6 | One tranche, feasible as admission *shell* (§8) | Incumbent |

**Key structural insight:** because invariants [G2, G4] fix the semantic substrate, Architecture A does not need to replace SWSE-0's render paths — it can be a thin **admission/degradation policy shell** around them: floor rendering always; promotion gates entry into the existing richer paths. That reframes the comparison from "two architectures" to "one substrate, policy now vs. policy later" — and makes the A/B a single-flag experiment instead of a fork. **[C — feasibility depends on SWSE-0's actual render-path shape; U/ABSTAIN until inspected]**

**The real question A vs. B is therefore timing, not topology:** does building the admission shell *before* the scheduler evidence exists (A) risk premature abstraction, or does deferring (B) risk an unmeasurable baseline and a capacity cliff discovered in UXR3/UXR4 testing? **The committee abstains; E0–E3, E8 are designed to answer exactly this.**

---

## 6. Decisive Experiments (pre-registered; no winner without these)

| ID | Experiment | Metric | Abort/refactor criterion |
|---|---|---|---|
| **E0** | **Cost census.** Measure per-capability cost vectors (presence, cluster hull, label, geometry, analysis) on real workloads | µs CPU, bytes heap/VRAM, text ops per entity/capability | If costs don't cluster into distinguishable bands, both A's 5-level ladder and A′'s axis separation fail; redesign |
| **E1** | Budget adherence, N ∈ {5k, 50k, 500k} entities | p99 frame ms; budget-violation rate | Floor must hold at all N or R1 is false |
| **E2** | Promotion latency + thrash | p50/p95 attention→visible latency; reversals/entity/min | Latency > perceptual threshold or thrash unbounded → hysteresis redesign |
| **E3** | Discoverability: find unattended/unpromoted entities | Task success rate vs. uniform baseline | Success materially below baseline → staircase discoverability claim fails; weigh mitigations |
| **E4** | Identity continuity across transitions | Misidentification rate; anchor drift px | Any promotion-induced anchor movement = contract violation, not tuning |
| **E5** | 4-hour synthetic session with rolling queries | Heap/VRAM high-water; residue store size | Growth superlinear in entities or linear in transitions → G3 violated |
| **E6** | Determinism: replay decision log | Byte-identity of re-executed decisions | Any divergence → decision function not pure; fix before S2 |
| **E7** | Adversarial attention storm (rapid focus jumps) | Max cold-region promotion latency; starvation | Unbounded starvation → fairness policy (deficit quotas) failed |
| **E8** | Flag purity | Durable writes byte-identical, flag off vs. pre-tranche baseline | Any difference = contamination; kill switch, root-cause before any expansion |

E0 runs first and gates everything: the ladder is a hypothesis about cost structure; measure before committing to its shape.

---

## 7. Prior Art to Verify (verification targets, not endorsements)

| Source | What to verify | Bearing |
|---|---|---|
| Cesium 3D Tiles / HLOD (now OGC) | Tile LOD policy, bounding-volume visibility, transition hysteresis | L1/L3 streaming & atomicity contract |
| Unreal Nanite | Cluster LOD, error metrics, dithered crossfades to suppress popping | F5 popping; atomic transition visuals |
| Luebke et al., *Level of Detail for 3D Graphics* | Perceptually driven LOD; view-dependent degradation | S2 QoS tier legitimacy |
| Gaze-contingent / foveated rendering (Loschky & McConkie; VR fixed foveation) | Peripheral degradation thresholds, comfort findings | S2 thresholds; F5 comfort bounds |
| Furnas, *Generalized Fisheye Views* (1986); Furnas & Dill space-scale diagrams; Pad++/Jazz (semantic zoom) | Degree-of-interest as admission signal; semantic zoom contracts | Value admission (S1) precedent; discoverability caveats |
| Cockburn et al., overview+detail/zoom/focus+context review (2008) | Empirical trade-offs between zooming and overview | Directly bears on E3 design |
| van Ham & Perer, "Search, Show Context, Expand" (~2004); Abello et al. Ask-GraphView (~2006) | Graph sensemaking via progressive expansion vs. overview-first | L4 expansion pattern; discoverability |
| Multilevel graph layout (Walshaw; Harel & Koren) | Coarse-level layout stability across level refinement | L1 anchor stability under layout epochs |
| Progressive visual analytics literature (e.g., Zgraggen et al. ~2017; EuroVis STAR) | Does progressive refinement measurably help insight/comfort? | Whole-architecture empirical grounding |
| BlinkDB / online aggregation | "Good-enough now, refine later" contracts | Promotion semantics analog |
| DASH adaptive streaming; dynamic resolution in games | Quality-switch hysteresis and stall/backpressure handling | Hysteresis + rate cap design |
| React 18 concurrent lanes; Chromium frame pipeline | Interruptible work, lane priorities, frame pacing | Substrate (H_B) design |
| FoundationDB simulation testing; TigerBeetle VOPR | Deterministic testing of schedulers/state machines under fault injection | E6 decision-log + property testing method |
| ARC cache (Megiddo & Modha 2003); Deficit Round Robin (Shreedhar & Varghese 1996) | Self-tuning eviction with history; fair queueing | Eviction/reconstruction; backpressure buckets |
| Decima (learned cluster scheduling); learned OS scheduling (e.g., Paragon) | Claimed gains, overheads, determinism failures | S3 risk assessment; shadow-mode graduation bar |

All rows are concept-level observations [O]; specifics (dates, exact claims, effect sizes) are **to verify** before citing in project documents.

---

## 8. Minimal Implementation Tranche (spec for exactly one forward PR — not executed here)

**Scope discipline [G6]:** one PR, additive, behind `staircase` flag with kill switch; zero durable-schema changes; zero writes to the evidence store; no learned policy; no parallel render fork.

1. **Core (Rust/WASM):** band registry as *config data* (3 bands initially; E0 may re-cluster); `Residue`, `Epoch` fencing, `Budget` axes; one pure admission function with S0 floor + S1 value admission and hysteresis/cooldown/rate-cap. Skip S2/S3 entirely in tranche 1.
2. **Render binding:** shell over existing render paths — floor always drawn; promotion gates entry to existing richer paths; transitions commit at frame boundaries with fenced frees; anchor contract enforced by assertion (promotion that would move an anchor panics in debug).
3. **Telemetry:** namespaced, ring-buffered counters (admitted/deferred/fenced/rate-capped/thrash) + opt-in sampled decision log for E6; aggregated in Rust; never touches durable store.
4. **Shadow mode first:** `staircase.shadow = true` computes and logs decisions without rendering changes — near-zero contamination, validates cost models (E0/E1 predictions) *before* any user-visible A/B.
5. **Tests in the same PR:** property test — no thrash under oscillating scores given hysteresis; fuzz — epoch bump mid-promotion can never commit (F7); determinism — decision-log replay byte-identity (E6); budget violation tests with synthetic cost functions; **purity test — flag off yields byte-identical durable writes (E8)**; long-session leak test harness stub (E5).
6. **Graduation gates before any tranche 2 (S2/QoS):** E1 floor holds at 500k; E2 thrash bounded; E6 pass; E8 pass. **No expansion without these numbers.**

---

## 9. Verdict Status — Explicit Non-Verdict

The committee **does not select** between Architecture A, A′ (floor + orthogonal gates), or SWSE-0 + later scheduler. Decision rights are deferred to evidence:

- **E0** decides whether bands cluster as a ladder (A), as separable axes (A′), or not at all.
- **E3** decides whether attention-gated promotion survives the discoverability objection — the single largest unmitigated risk.
- **E7** decides H_B's shared-substrate fairness against H_A's coupled tiers.
- **E8** decides whether the flag-isolation claim is true; until it passes, no A/B evidence from this line is admissible.

**Claims we consider strong enough to act on now** (still [C] until E0/E4 confirm): the unconditional presence floor; the anchor-invariance rule; the decision-log replay mode; fencing at every async boundary; bands-as-data rather than bands-as-types. **Claims we refuse to act on without evidence:** any benefit of S3 (learned scheduling); any discoverability mitigation; the five-level count itself.

**Open questions for implementers [U]:** SWSE-0's actual render-path shape (determines whether the shell approach in §5 is real); UXR3/UXR4 gate definitions; worker topology and SharedArrayBuffer feasibility; realistic entity counts for E1 stress profiles.

No source was modified; no PRs were opened; nothing herein is durable truth.