# CROSS-EXAMINATION REPORT: SWSE-0 vs. STAIRCASE/SRA vs. OPTION C
## nemosyne.world representation/scheduler architecture decision

---

## 0. Epistemic status of this report

**This report is not evidence.** It contains hypotheses, falsifier designs, and evidence requirements. Nothing below is admissible as a decision input except through the shared substrate.

- Prior model reports were **not available to this examination** beyond the protocol's own summary. All definitions below are reconstructed from the protocol statement. If a reconstruction contradicts a prior report, the contradiction must be entered in the provenance ledger (§13) and the affected rows voided before evaluation proceeds. Evaluating a reconstructed strawman is worse than abstaining.
- Model agreement carries **zero** evidential weight, including agreement between this report and prior reports, and including consensus among architecture proponents.
- This report introduces **no numeric thresholds**. Every threshold is deferred to pre-registration on the shared substrate. Any constant appearing below is either a labeled hardware fact pending on-device verification or a placeholder.
- Per mandate: **no winner is chosen.** Decision authority belongs to the protocol owners; this document supplies falsifiers.

---

## 1. Governing criteria (pre-registered candidates — ordering is a protocol decision, not made here)

| ID | Criterion | Evidence class |
|----|-----------|----------------|
| C1 | Durable semantic truth is sole authority; zero contamination from scheduler/render/UX state | Code-path audit + invariant tests |
| C2 | Replay determinism: same (trace, seed, profile) → identical semantic outputs and scheduler decision logs under a logical clock | Differential replay (analytical) |
| C3 | Interactive frame pacing per hardware profile, including Quest physical devices | **Human/physical** |
| C4 | Multi-axis resource bounds (vector, never scalar): core CPU-ms, main-thread ms, GC pauses, linear-memory peak/delta, allocations, messages, bandwidth, storage | Statistical, protocol-owned criteria |
| C5 | No starvation of any capability class under pre-registered fairness criteria | Statistical |
| C6 | Identity continuity: no mixed-epoch artifact ever observable at a commit boundary | Analytical injection tests |
| C7 | Cancellation safety: partial work discardable at declared safe points; bounded waste | Statistical |
| C8 | Reconstruction equivalence and cost vs. fresh computation | Analytical + statistical |
| C9 | Long-session stability: bounded growth as a function of world churn (no absolute constants) | Statistical soak |
| C10 | Discoverability, comfort, semantic legibility | **Human/physical only** |
| C11 | Rust/WASM core retains analytical authority; browser glue non-authoritative | Code audit |
| C12 | Scheduler overhead within a pre-registered envelope derived from measured baseline | Statistical |
| C13 | Full provenance: every artifact traceable to (identity, epoch, capability, code version, seed); decision ledger retained | Audit |

---

## 2. Epistemic registers

### 2.1 Observations (from protocol statement + labeled platform facts)

- **O1.** The protocol itself mandates the shared substrate components (datasets, traces, seeds, hardware profiles, semantic identities, resource budgets, telemetry definitions, replay inputs, UX tasks).
- **O2.** "Quest" is named as a distinct evidence class → a physical VR-class device is in scope. This elevates C3 from a desktop proxy concern to a physically grounded one (verify on device: refresh cadence per headset model, achievable frame pacing via the target browser stack).
- **O3.** Shadow-mode measurement "before fixing level boundaries" is already proposed by the protocol — i.e., the protocol itself treats level boundaries as measured outputs, not design inputs.
- **O4.** *(Platform fact, verify per engine/device version)* WebAssembly linear memory does not autonomously shrink; worker↔main communication is message-passing or SharedArrayBuffer; running WASM is not preemptible, so cancellation must be cooperative.
- **O5.** *(Platform fact)* Rust `HashMap` iteration order is randomized per process (`RandomState`). Any logic that depends on iteration order is a replay-determinism hazard.
- **O6.** *(Prior-art observation, pending verification)* Shipped systems advertising "continuous" LOD typically implement discrete levels plus interpolation (geomorphing). "Continuous" is often a presentation property over a tiered substrate.

### 2.2 Assumptions (must be confirmed; each can void affected rows)

- **A1.** The reconstructions in §3 match the intended definitions of SWSE-0 and Staircase/SRA.
- **A2.** nemosyne.world presents a navigable, spatialized semantic world on desktop and Quest-class devices.
- **A3.** The durable semantic store is updatable during sessions (otherwise staleness/fencing claims are moot).
- **A4.** The UXR3 substrate already defines identity, evidence, and telemetry well enough to attach per-capability cost vectors without inventing new telemetry semantics.
- **A5.** Sessions are recordable and replayable (traces + seeds exist or can be produced).
- **A6.** Team capacity exists to run the falsifier suite. If not, the entire decision is ABSTAIN.

### 2.3 Unknowns

- **U1.** Actual and projected world sizes / dataset growth.
- **U2.** Whether locality is spatial, topological, or both — this determines which prior art transfers (§10).
- **U3.** What scheduling state already exists on main (a hidden scheduler would falsify SWSE-0's purity claim before any experiment runs).
- **U4.** Quest browser engine, WASM features, SharedArrayBuffer/COOP-COEP availability on target devices.
- **U5.** Telemetry overhead magnitude (observer effect on shadow measurements).
- **U6.** Whether invented constants from prior reports have already entered the codebase.
- **U7.** Whether UXR3 has pre-registered comfort/legibility instruments (if not, all C10 claims are structurally ABSTAIN).

---

## 3. Architecture definitions (hypothesis status; verify before use)

**SWSE-0** *(reconstructed)*: Single semantic representation level. All capabilities (search, layout, render, evidence derivation, identity resolution) evaluate directly over durable-truth projections at query time. No precomputed fidelity tiers. Scheduling, if present, is a single coarse job queue.

**Staircase/SRA** *(reconstructed)*: A small ordered set of per-entity representation levels; a scheduler manages promotion/demotion between levels driven by salience, viewport, interaction, and budgets, with hysteresis and prefetch. The disputed property: **scheduler sophistication is coupled to fidelity levels** — level transitions *are* the scheduler's decision vocabulary.

**Option C — Measure-first projections + mechanism/policy-split scheduler** *(the proposed stronger orthogonal alternative)*:
1. Durable semantic truth is the only authority (shared invariant).
2. All derived artifacts are **disposable, epoch-fenced projections** of type "anytime pipeline with recordable cut points."
3. The scheduler **mechanism** (queues, deadlines, aging, epoch fencing, group commit) is **representation-blind**: it sees jobs as {cost vector, deadline, priority, provenance, group}.
4. Any fidelity awareness lives in a **swappable policy module** whose parameters are derived from measured cost vectors, never asserted.
5. If staircase-like levels emerge, they are cache cut points measured into existence — not architectural commitments.

*Orthogonality claim to be attacked in §4.5–4.6.*

---

## 4. Strongest case and strongest attack per architecture

### 4.1 SWSE-0 — strongest case
- **Identity continuity (C6)** is near-trivial by construction: one artifact class, one epoch check, no cross-level drift. Semantic legibility is structurally uniform — what is rendered is what the system means, for every user, every frame.
- **Replay determinism (C2)** is easiest: no scheduler decision vocabulary to record, minimal state.
- **Scheduler overhead (C12)** is minimal by definition; cancellation surfaces are few.
- The entire complexity budget goes to the analytical core, preserving Rust/WASM authority (C11) with the smallest validation surface of the three.
- Its failure mode is honest: it fails *slowly and visibly* rather than *subtly and wrongly*.

### 4.2 SWSE-0 — strongest attack
- **Cost scales with world size, not user intent.** On large worlds, worst-case interactive cost on the worst hardware profile (Quest) plausibly violates C3 regardless of micro-optimization. *Axes: representation levels, multi-axis cost bounds.*
- **The purity claim is unstable.** Any mitigation — viewport culling, progressive query results, time-slicing — is already a scheduler. SWSE-0 therefore converges either to unacceptable latency or to a *reinvented, unmeasured* Staircase with none of the discipline. This is the decisive attack: SWSE-0 as described is probably not a stable point. *Axis: scheduler levels, coupling.*
- **Cancellation:** coarse cancellable units mean a large in-flight job cannot yield; latency spikes under update bursts. *Axis: cancellation.*
- **Long-session:** eager recomputation on updates produces recurring stalls; caching without fencing design inherits the fencing problem minus the fencing. *Axes: leakage, stale async fencing.*
- **Comfort/discoverability:** slow first-paint and stalls in VR are comfort hazards (hypothesis only — human evidence required, C10).

### 4.3 Staircase/SRA — strongest case
- **Structural decoupling of frame cost from world size:** the interactive path touches only coarse levels; cost scales with salience. This is the only architecture whose worst-case interactive cost is bounded *by construction* rather than by tuning (claim — E1/E5 must confirm).
- Levels are natural cancellation checkpoints, natural fence points (invalidate below level k on epoch change), and natural fairness classes. *Axes: cancellation, stale async fencing, starvation.*
- Mature prior art exists: tile pyramids, LOD with hysteresis, HLOD (§10) — known pitfalls have known mitigations (popping → geomorphing; thrash → hysteresis; missing tiles → parent fallback).
- Semantic zoom as an affordance (cluster → entity → evidence) is a coherent UX hypothesis for discoverability (hypothesis only — human evidence required).

### 4.4 Staircase/SRA — strongest attack
- **Level boundaries are invented constants until measured.** The protocol's own shadow-mode mandate (O3) implies boundaries must be *outputs* of measurement — which dissolves the Staircase's distinctive claim (tiers as design commitments) into Option C. Wrong boundaries are worse than none: boundary thrash, memory spent on unused tiers. *Axes: representation levels, multi-axis cost bounds.*
- **Coupling multiplies state space:** promotion × demotion × hysteresis × budget × axis. Fairness analysis becomes per-tier; demotion starvation causes memory bloat (a direct long-session leak path); scheduler bugs become user-visible semantic/visual anomalies. *Axes: starvation/fairness, leakage, scheduler overhead, coupling.*
- **Cross-level drift is the hardest fencing case:** L1 and L3 artifacts must be proven to denote the same identity at the same epoch; multi-level interleaved updates are precisely where mixed-epoch worlds appear. *Axes: identity continuity, stale async fencing, semantic legibility.*
- **Overhead at Quest-visible entity counts** may consume the frame budget in per-entity tier bookkeeping (E8 decides). *Axis: scheduler overhead.*
- **Complexity claim is unsupported at nemosyne's evidence level.** Prior art (e.g., Nanite-class systems) shows the approach works only with large engineering investment; the burden is on the claimant to show validation is feasible at this team scale — otherwise this is an unsupported complexity claim, which the protocol requires rejecting.

### 4.5 Option C — strongest case
- **No invented constants:** any tiers that exist are measured cut points, falsifiable and revisable without architectural surgery. This is the only option *structurally compatible* with the protocol's shadow-mode mandate.
- **Scheduler complexity is quarantined** in one well-studied mechanism (deadline + priority + aging + epochs) testable with synthetic job traces, independent of representation. The fidelity-coupling dispute is moved into a swappable policy module with its own falsifiers.
- **Identity continuity via a single fence mechanism** at artifact commit: one epoch rule for all capabilities, no per-level fencing logic.
- **Replay determinism:** logical clock; scheduler decisions are pure functions of (recorded inputs, logical time); cross-hardware divergence is confined to ephemeral quality and can never reach durable truth (C1).
- Coherence worries (mixed-fidelity neighborhoods) are addressable without coupling: jobs carry group IDs; group commit enforces coherence at the artifact contract, not inside the scheduler.

### 4.6 Option C — strongest attack
- **"Anytime" is a strong per-capability assumption.** Not every capability has a useful monotone-quality decomposition (search ranking? layout? evidence derivation?). Where it fails, Option C silently degenerates into SWSE-0 (full compute) or into unacknowledged fallback tiers — **the Staircase reappears as hidden state**, which is worse than an explicit staircase because it is unfenced and unledgered. *Axes: representation levels, scheduler levels.*
- **O6 cuts against Option C's core distinction:** if "continuous" in practice means tiered substrate + interpolation, the difference from Staircase collapses to (a) whether boundaries are measured or designed and (b) where policy lives — both real, but much smaller than the orthogonality claim implies. The claim of orthogonality must be attacked as possibly verbal.
- **Boiling artifacts:** continuous refinement can produce constant low-amplitude churn, which in prior art is a *worse* comfort problem than occasional popping (hypothesis — human evidence required). *Axes: comfort, semantic legibility.*
- **Deadline smuggling:** if deadlines are assigned as a 1:1 function of fidelity class, the scheduler is fidelity-coupled after all, just illegibly. This is the sharpest internal attack: Option C's honesty depends on auditability of its deadline policy (D8).
- **Overhead is per-job, not per-entity:** WFQ/deadline bookkeeping plus provenance tagging on every artifact; E8 must normalize granularities across arms or the comparison is rigged.

---

## 5. Disputed claims → decisive falsifier → admissible evidence

| Axis | Claim (owner) | Decisive falsifier | Admissible evidence | ABSTAIN if |
|---|---|---|---|---|
| Representation levels | Single-level envelope suffices at target scale (SWSE-0) | E1: measured single-level cost vector exceeds pre-registered interactive bound on worst profile for any core UX task | Substrate cost telemetry, protocol-owned bound | Bound not pre-registered |
| Representation levels | Tier boundaries are stable designable constants (Staircase) | E1 + boundary-perturbation sensitivity: metric cliffs or thrash near proposed boundaries | Cost-vector telemetry, pre-registered sensitivity criterion | Boundaries asserted without E1 |
| Representation levels | Every capability admits monotone anytime decomposition (Option C) | E-ANYTIME: per-capability intermediate-utility measurement shows non-monotone or useless intermediates | Protocol-defined utility instrument per capability | No instrument defined |
| Scheduler levels / coupling | Fidelity-coupled scheduling is *necessary* for coherence (Staircase) | Policy-equivalence test: fidelity-blind policy + group commit matches fidelity-aware policy on all pre-registered coherence metrics at equal budgets | E-POL on shared traces | Coherence metrics not pre-registered |
| Scheduler levels / coupling | Deadlines don't smuggle fidelity (Option C) | Audit: deadline assignment correlates 1:1 with fidelity classes across all workloads → coupling-by-another-name confirmed | Policy code audit + job logs | Policy unauditable |
| Identity continuity / stale async fencing | Epoch fencing suffices in worker topology (all) | E2: scripted durable-truth commits during in-flight derivations, incl. multi-level interleavings; any mixed-epoch commit refutes | Injection tests; deterministic post-state | Architecture lacks an explicit fence mechanism |
| Cancellation | Cooperative safe-point cancellation suffices (all) | E3: cancellation latency, un-reclaimed allocations, partial-work waste exceed pre-registered limits | Cancellation telemetry on burst traces | Safe points undeclared |
| Starvation/fairness | Aging within multi-axis budgets prevents starvation (all) | E4: any capability class exceeds pre-registered lag/progress criterion under sustained interactive + background overlap | Per-class progress vs. logical time | Fairness criterion not pre-registered |
| Multi-axis cost bounds | Any single-scalar budget suffices (any arm implies it) | E5: violations on a non-frame axis under reduced budgets (memory ceiling, throttled network) | Per-axis violation counts | Budget vector not defined |
| Reconstruction | Reconstruct ≡ fresh, affordable (all) | E9: reconstruction output fails protocol equality, or re-derivation cost exceeds envelope | Differential artifact comparison + cost telemetry | Equality class undefined |
| Long-session leakage | No unbounded growth (all) | E6: soak exceeds growth-as-function-of-churn bound | Multi-hour loop telemetry | Growth bound not derived from measured baseline |
| Replay determinism | Quality-only divergence across profiles; zero semantic divergence (all) | E7: cross-profile differential replay shows semantic output divergence or scheduler decisions depending on wall clock | Differential replay logs | Logical clock not implemented |
| Discoverability / comfort / semantic legibility | Any ordering among arms on these axes | **E10 only.** No analytic proxy is admissible, including frame-rate proxies for comfort | Human/physical-device studies, UXR3-pre-registered instruments | Instruments not pre-registered; study not run on devices |
| Scheduler overhead | Overhead negligible (all arms assert some version) | E8: per-decision/per-entity bookkeeping cost exceeds pre-registered fraction of frame budget | Overhead telemetry at baseline entity counts | Fraction not derived from E1 |
| Zero contamination | No scheduler/UX path writes durable truth (all) | Audit: any durable-store write path reachable from scheduler/render/UX modules | Reachability audit on main | Audit not performed |

---

## 6. Common invariants (all three arms must satisfy these regardless of outcome)

- **I1.** Durable semantic truth is the sole authority; every ephemeral artifact carries (identity, epoch, capability, code version, seed); commits fence on epoch.
- **I2.** No scheduler, render, or UX state may write durable truth. Ever. This is the zero-contamination invariant and it is non-negotiable across arms.
- **I3.** Semantic outputs are pure functions of (durable truth, recorded inputs, seed). Hardware affects only ephemeral quality.
- **I4.** Cancellation is cooperative at declared safe points; all partial work is side-effect-free and discardable.
- **I5.** Every capability class has a pre-registered starvation criterion with aging or equivalent; parameter values are measured, never asserted.
- **I6.** Budgets are vectors. Any scalar reduction is a labeled projection with its own recorded cost.
- **I7.** Replay uses a logical clock; all nondeterminism sources (wall clock, GC timing, hash iteration order, engine-dependent math via JS imports) are identified and pinned; cross-profile comparisons use pre-registered semantic tolerance, not bit-exactness claims.
- **I8.** Human-facing claims (C10) are ABSTAIN until physical-device human studies run under UXR3.
- **I9.** Rejected alternatives, reasons, and evidence pointers are retained immutably in the decision ledger (§13).
- **I10.** The Rust/WASM core retains analytical authority; the browser layer is a non-authoritative shell.
- **I11.** *Mechanism/policy split:* the scheduling **mechanism** is representation-blind; any fidelity awareness is quarantined in a swappable, auditable **policy** module. This invariant is admissible to all three arms and dissolves part of the coupling dispute into an implementation-seam question.

---

## 7. Irreducible disagreements

1. **Is salience-scaled representation necessary at all?** (SWSE-0: no; others: yes.) Settled only by E1 measured envelopes at U1 world sizes. Until measured: ABSTAIN.
2. **Are tier boundaries design commitments or measured outputs?** (Staircase vs. Option C.) Partially a values question (stability/legibility of visible tiers vs. adaptability). E1 + E9 cache telemetry inform it; E10 legibility evidence may inform but not settle it.
3. **Should the scheduler know about fidelity?** The mechanism/policy split (I11) shrinks this to: *can coherence be enforced at the artifact contract (group commit) as cheaply as inside the scheduler?* E-POL decides the empirical residue; the residue may still be a values question about where debuggability should live.
4. **O6 collapse:** "continuous vs. tiered" may be a presentation distinction over a shared tiered substrate. If E-ANYTIME confirms O6 for nemosyne's capabilities, the Staircase/Option C dispute reduces to items 2 and 3 — and the ledger must record that the orthogonality claim was partially verbal.
5. **Popping vs. boiling vs. stalls for comfort, and tiers vs. uniformity for legibility:** strictly human/physical questions. No amount of model reasoning or desktop telemetry is admissible. Permanent ABSTAIN until E10.
6. **Energy/thermal claims on Quest:** physical-device evidence only. No proxy admissible.

---

## 8. Shared evaluation substrate contract + experiment matrix

**Substrate contract (mandatory, identical across arms):** frozen dataset versions and identity manifests; recorded traces with seeds; logical-clock replay inputs; pinned hardware profiles (desktop tiers + Quest physical devices, per-device refresh cadences verified on hardware); identical pre-registered budget vectors per profile; **one** telemetry definition module, versioned; identical UX task battery for human experiments; identical epoch-update scripts for injection tests. Arms may not tune budgets or telemetry per-arm — that breaks comparability and voids results.

| ID | Experiment | Decides | Evidence class | ABSTAIN condition |
|---|---|---|---|---|
| E1 | Per-capability cost-vector baseline across profiles × datasets (shadow mode, no user exposure) | D1, boundaries, overhead envelope, all complexity claims | Statistical | Telemetry overhead unmeasured (U5) |
| E2 | Stale-async fencing injection: durable commits during in-flight derivations, incl. multi-level interleavings | C6, fencing claims | Analytical | — |
| E3 | Cancellation burst traces at varying safe-point densities | C7 | Statistical | Safe points undeclared |
| E4 | Starvation probe: sustained interaction overlapped with background ingestion | C5 | Statistical | Fairness criterion not pre-registered |
| E5 | Multi-axis budget sweep: reduced frame budget, memory ceiling, throttled network | C4 | Statistical | Any arm granted different budgets |
| E6 | Long-session soak: recorded session looped, growth vs. churn | C9 | Statistical | Growth bound not baseline-derived |
| E7 | Differential replay: record on profile A, replay on A and B | C2, divergence-classification | Analytical | Logical clock absent |
| E8 | Scheduler overhead microbench: decision cost vs. entity count, normalized across per-job/per-entity granularities | C12 | Statistical | Normalization scheme not pre-registered |
| E9 | Reconstruction equivalence: evict-then-reconstruct vs. never-evicted | C8 | Analytical + statistical | Equality class undefined |
| E10 | Human battery on physical devices: discoverability tasks, comfort instrument (per UXR3), identity-change detection for legibility | C10 | **Human/physical** | Instruments not pre-registered; desktop-only data offered |
| E-POL | Policy-equivalence: fidelity-aware vs. fidelity-blind policy over identical mechanism and budgets | D4, D8 | Statistical + audit | Coherence criteria not pre-registered |
| E-ANYTIME | Per-capability intermediate-utility measurement | D7, O6 applicability | Statistical | No protocol utility instrument |

---

## 9. Shadow-mode minimal implementation — assessment

**Admissible because it is upstream of the disputed claims and architecture-neutral.** Adopting it does not decide among the three arms.

**Minimal scope:**
1. Instrument per-capability cost vectors (latency, core CPU-ms, allocations, linear-memory delta, message count, cache outcome) on the existing UXR3 substrate, with epoch provenance on every measurement.
2. A job/decision log under a logical clock: {job class, cost vector, deadline/priority, epoch at start, epoch at commit, outcome, cancellation reason}.
3. Shadow execution of candidate policies (Staircase-style, deadline-style, minimal) over identical recorded + live-mirrored traces, with no user exposure and no writes to durable truth.
4. A decision ledger (§13) capturing every boundary/policy value as *provisional, measurement-derived*.

**What it settles:** the analytic/statistical subset — E1–E9, E-POL, E-ANYTIME. Critically, it converts the level-boundary dispute from a design argument into a measurement output, and SWSE-0's measured envelope becomes the falsifier for the necessity claim of tiers.

**What it cannot settle:** E10. Comfort, discoverability, and legibility remain ABSTAIN regardless of shadow results. It also cannot fully prove production concurrency behavior (live interleavings absent) — mitigate with fuzz traces and recorded live sessions.

**Risks:** observer effect (telemetry cost must itself be measured and labeled — U5); job-log volume; logical-clock discipline during live capture; and the temptation to treat shadow cost vectors as UX evidence, which they are not.

---

## 10. Prior art requiring verification

*These are verification pointers, not evidence. Adoption on this report's assertion is prohibited by the protocol itself.*

| Item | Relevance | Verify |
|---|---|---|
| Hoppe, *Progressive Meshes* (SIGGRAPH ~1996) | Continuous LOD, geomorphing; supports/refutes O6 and D7 for spatial payload | Paper |
| Luebke et al., *Level of Detail for 3D Graphics* (~2003) | LOD selection, hysteresis, popping mitigation for Staircase | Book contents |
| Chunked LOD (Ulrich, ~2002); Geometry Clipmaps (Losasso & Hoppe, ~2004) | Tiered streaming + scheduler interaction | Papers/talks |
| **Vector tile pyramids (Mapbox/OGC spec + shipped clients)** | Closest production analog of Staircase/SRA: tiered world serving, parent fallback, stale-while-revalidate, viewport-priority queues | Spec + production behavior; verify transferability given U2 locality |
| RFC 5861 (stale-while-revalidate) | Battle-tested bounded-staleness serving | RFC |
| Nanite (Karis, SIGGRAPH course ~2021) | Fidelity-coupled sophistication works at scale — *with* large cost; tests the complexity-claim bar | Course notes |
| Percolator (OSDI ~2010) | Epoch-style incremental indexing at scale; fencing precedent | Paper |
| Anytime algorithms (Dean & Boddy ~1988; Zilberstein ~1996) | Utility-profile theory + known difficulty of characterizing intermediates; core Option C risk | Papers |
| EDF (Liu & Layland ~1973); lottery/stride scheduling (Waldspurger ~1994–96); EEVDF (Linux, ~2023) | Mechanism prior art for Option C scheduler | Papers/kernel docs |
| React concurrent rendering / Suspense | Cooperative cancellation, priority lanes, policy/mechanism separation in shipped UI schedulers | Docs + issue history |
| VR latency/frame-drop discomfort literature | Physical grounding of C3 | Specific refs; on-device confirmation |
| Generational indices / ECS patterns | Epoch fencing precedent in games | Published patterns |
| SharedArrayBuffer/COOP-COEP + WASM threads on Quest browser | Feasibility seam (U4) | On-device test |

---

## 11. Implementation seams to inspect on current main

1. **Identity resolution paths**: are render caches and query results stamped with identity + epoch, or by pointer/hash alone? (C6)
2. **Contamination reachability**: any durable-store write path reachable from scheduler/render/UX modules. (I2)
3. **Cancellation**: do long core loops have declared safe points / a cancellation token type, or are there unyielding loops over entity sets? (C7)
4. **Clock discipline**: `performance.now`/`Date.now` reads inside scheduler or render *decision* paths (as opposed to pure telemetry) — wall clock in decisions breaks E7. (C2)
5. **Randomness and iteration order**: `HashMap` iteration dependence; seeds; JS `Math.*` imports into WASM decision paths (engine-dependent results). (C2)
6. **Worker/main messaging**: structured-clone costs; SharedArrayBuffer availability (COOP/COEP headers present?); in-flight message handling on epoch change. (C6, U4)
7. **Frame pacing path**: rAF/WebXR callback cadence; does the scheduler consume wall clock or logical frame index? (C2, C3)
8. **Eviction/demotion paths**: is freed memory actually reclaimed (given linear-memory ratchet, O4); does epoch metadata grow unboundedly? (C9)
9. **Persisted state**: any scheduler/UX state in localStorage/IndexedDB → contamination + determinism. (I2, C2)
10. **Telemetry unity**: one shared cost-vector definition module vs. scattered ad hoc instrumentation — substrate mandate requires one source of truth.
11. **Hidden schedulers**: any existing queue/priority logic — find and classify its fidelity coupling. If present, SWSE-0's purity claim is already falsified on main.
12. **Async failure handling**: on derivation failure, is partial state rolled back and fenced by epoch, or does it leak? (C6, C7)

---

## 12. ABSTAIN register

1. **Any ordering of the three arms on comfort, discoverability, or semantic legibility** — human/physical evidence pending (E10).
2. **Any claim that tiers help or harm UX at nemosyne's scale** — prior-art transferability unverified (U2) + E10 pending.
3. **Energy/thermal bounds on Quest** — no physical-device instrumentation.
4. **Scheduler-overhead negligibility for any arm** — E8 pending.
5. **All fairness weights, aging constants, deadline values** — E1/E4 pending; pre-register, do not invent.
6. **All level boundary values** — E1 pending; boundaries remain provisional until measured.
7. **Whether world growth will exceed any measured envelope** — U1 unknown.
8. **Quest browser feature support (SAB, threads, refresh cadences)** — verify on device (U4).
9. **Correctness/incorrectness of prior reports' contents** — inaccessible and inadmissible; unverifiable from here.
10. **Whether main already contains a hidden scheduler** — seam inspection pending (U3).
11. **All comparative superiority judgments among the arms** — mandated by this protocol; no winner is chosen here.

---

## 13. Provenance: rejected alternatives and decision ledger

**Ledger rule:** every rejected alternative gets an immutable entry: {alternative, reason, evidence pointer, date, code SHA}. Superseded entries are retained, never deleted.

Pre-ledgered rejections from this examination:
- **Nanite-style cluster DAG (full adoption)** — rejected: complexity claim unsupported at current evidence level; addresses geometry-class payload only; revisit if E1 shows spatial payload dominating.
- **Pure spatial tile pyramid without semantic tiering** — rejected pending U2 locality determination; transfers only if locality is predominantly spatial.
- **Fully synchronous / no-scheduler design** — rejected as candidate: pending E1 confirmation, cooperative scheduling appears required by VR pacing (O2, O4); ledger as hypothesis-rejection, not measured.
- **ML-learned scheduler policy** — rejected: replay determinism burden + evidence burden unmeetable pre-E10.
- **Optimistic concurrency without epoch fencing** — rejected: no fence mechanism → auto-fails E2 by construction.

**Closing constraint:** no architecture is adopted consequentially until its falsifiers have run on the shared substrate and the relevant prior art (§10) has been verified. This report is discharged of decision authority by design.