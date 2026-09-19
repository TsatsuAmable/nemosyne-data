# Nemosyne Data Laboratory and Test Harness Workflow Plan

**Status:** proposed operating plan after adversarial research + QA review  
**Date:** 2026-09-19  
**Boundary:** `nemosyne` owns product/runtime/QV authority. `nemosyne-data` owns experiments, cross-runtime campaigns, evidence indexing, preserved research evidence and research adjudication. The lab never reimplements Moneta analytical truth or QV promotion authority.

## 1. Objective

Turn the existing collection of deterministic tests, Playwright browser verification, IWER/USIM, lifecycle simulation, XR device/fault envelopes, Quest QV, known-structure/perturbation campaigns and future vendor/professional XR lanes into one continuously sampled, claim-bound evidence workflow without replacing their native runners.

The operating question for every specimen is: **what can this exact build defensibly do, under what conditions, how fresh is that evidence, and what observation would falsify the claim?**

## 2. Three planes

### Product verification plane (`nemosyne`)
Owns unit/integration/WASM tests, Playwright production-browser tests, WebXR/IWER adapters, lifecycle scenarios, product telemetry, physical Quest launch/capture, QV4 adjudication/finalization/custody, and production promotion semantics.

### Laboratory plane (`nemosyne-data`)
Owns benchmark corpora/oracles, perturbation plans, cross-runtime experiment definitions, compute staircases, simulator/device comparison campaigns, evolutionary research, research committees, preserved evidence and portable evidence bundles.

### Coordination plane (thin, non-authoritative)
Indexes native run IDs and dispositions against exact specimen SHA; exposes READY/RUNNING/TERMINAL linkage, freshness, supersession and findings; never executes analytical work or recomputes a native verdict.

## 3. Evidence classes

E0 static/unit/property/fuzz evidence; E1 production desktop-browser evidence; E2 WebXR simulator evidence; E3 vendor emulator/mock-runtime evidence; E4 independent PC OpenXR/runtime evidence; E5 automated physical-device evidence; E6 human-on-device evidence; E7 investigator outcome evidence. Evidence is non-substitutable upward unless a protocol explicitly establishes equivalence.

Every artifact records evidence class, specimen SHA, native runner/runtime version, host/device identity where relevant, scenario/protocol version, seed, criteria/falsifier version, start/end time, disposition, raw/derived hashes and supersession lineage.

## 4. Merge-to-evidence workflow

1. A merge produces immutable `main@SHA` and changed-capability metadata.
2. Deterministic CI remains the immediate code gate.
3. A claim-impact mapper selects relevant existing native workers rather than firing the entire matrix.
4. Cheap asynchronous lanes fan out: Playwright browser smoke, applicable USIM/lifecycle scenarios, known-structure/metamorphic checks and bounded perturbations.
5. Findings are recorded against the originating SHA. Development continues unless the finding invalidates a prerequisite claim or creates safety/data-integrity risk.
6. Expensive lanes are scheduled by risk, freshness and change impact: extended cross-browser, hostile/long-session simulation, cross-runtime/vendor emulator, Quest, PCXR/professional hardware and human studies.
7. Native systems adjudicate their own evidence. The lab indexes dispositions and preserves evidence.
8. A finding creates a fix-forward linkage. The remediation SHA must rerun the smallest sufficient falsifier plus any dependency-sensitive regression set.
9. Superseded evidence remains immutable but is marked stale for claims affected by later changes.
10. Roadmap/promotion decisions consume the evidence index, not undocumented recollection.

## 5. Core test matrix

### Desktop/browser
Playwright projects: Chromium, Firefox, WebKit; selectively Chrome and Edge stable/beta. Preserve exact production build. Use traces on failure/retry and deterministic visual comparisons only under pinned rendering environments. Browser compatibility and product UX claims remain separate from XR claims.

### WebXR simulation
USIM controller, hand/pinch and 6DoF pose scenarios; USIM-A lifecycle/concurrency scenarios; Quest 2/3/Pro, generic WebXR, constrained-standalone and transient-pointer envelopes; clean/noisy/hostile faults. Persist bounded `XREvaluationEpisode` artifacts with exact specimen identity.

### Cross-runtime/vendor
Replay semantically equivalent scenarios through independent runtimes where possible: IWER; PICO emulator/OpenXR; HTC VIVE OpenXR mock/editor/runtime; PC OpenXR/SteamVR; Apple/visionOS/Safari; future vendor simulators. Differences are evidence, not noise to normalize away.

### Professional engineering XR
Maintain a distinct PCXR lane, initially targeting Varjo-class/high-resolution OpenXR capability: dense information legibility, high angular resolution, gaze/eye interaction, workstation GPU pressure, sustained sessions, large semantic working sets and precision selection. Consumer-headset thresholds cannot be copied into this lane without evidence.

### Physical devices
Quest remains the currently governed physical reference lane. Add non-Meta physical lanes only with machine-captured identity and native evidence contracts. Pair selected simulator scenarios with physical runs for calibration.

### Data/Moneta laboratory
Known-structure corpora, null/negative controls, metamorphic perturbations, scale/dimensionality/structure axes, resource pressure, compute staircase, semantic-preservation falsifiers and eventually evolutionary representation exploration. Qualification remains frozen-candidate/sealed-evidence work, separate from adaptive exploration.

## 6. Sampling policy

Use four cadences:
- **Per PR/merge:** deterministic CI plus change-selected cheap browser/simulator falsifiers.
- **Nightly/idle:** broader browser matrix, hostile faults, perturbation samples, long-session/resource campaigns.
- **Milestone/release:** complete relevant matrix, physical Quest, cross-runtime confirmation, custody/finalization and adversarial review.
- **On demand:** a finding, new dependency/runtime version, device firmware/browser update, architecture change or research question triggers targeted campaigns.

Matrix selection must be deterministic from changed capabilities + claim dependencies + evidence freshness. Random sampling may supplement but never replace required cells. Store the selection rationale.

## 7. Simulation credibility and calibration

Treat every simulator as a model with a validity domain. For each device/runtime profile maintain: intended physical referent, modeled variables, unmodeled variables, calibration date, paired physical scenarios, discrepancy metrics, uncertainty/known biases and prohibited claims. A simulator that has not been calibrated may falsify implementation assumptions but cannot establish hardware-equivalent performance/comfort.

Run paired simulator/device scenarios periodically and after major simulator/runtime/firmware changes. Track discrepancy distributions rather than a binary 'matches hardware'. Where extrapolation exceeds the calibrated domain, mark evidence OUT_OF_DOMAIN/ABSTAIN.

## 8. Visual/spatial verification

Add a governed visual/spatial evidence lane: pinned browser/OS/GPU mode; deterministic camera/pose; screenshots plus semantic geometry assertions; target/ray intersections; clipping/occlusion; text angular-size/legibility proxies; world-space layout; HUD state; frame evidence where needed. Golden images are diagnostic evidence, not semantic truth, and must be regenerated only through reviewed baseline changes.

## 9. Reliability, fuzzing and metamorphic testing

Expand property/fuzz tests at protocol and lifecycle boundaries: malformed datasets, cancellation/re-entry, generation changes, resource exhaustion, event ordering, network loss, persistence failure and input disconnect. Metamorphic tests must preregister transformations that should preserve or destroy specific analytical/semantic claims. Never treat arbitrary perturbation invariance as desirable.

## 10. Research/QA panel workflow

Every consequential new harness/campaign receives two independent reviews before being allowed to support promotion:
- **Research validity:** claim definition, construct validity, confounding, leakage, multiplicity, benchmark representativeness, calibration/domain validity, uncertainty and falsifiability.
- **QA engineering:** determinism/flakiness, observability, failure injection, cleanup/isolation, reproducibility, platform diversity, artifact custody, false pass/fail modes and operational cost.

Review outputs are versioned evidence. Unresolved material objections produce ABSTAIN or an explicitly scoped evidence class, not a negotiated PASS.

## 11. Implementation tranches

### LAB-V0: Inventory and contracts
Finish the capability register; map every existing runner, command, evidence path and authority; remove duplicate scheduler concepts; define evidence-class/freshness/supersession schemas.

### LAB-V1: Durable native evidence
Persist USIM/XREvaluationEpisode outputs; index live QV, Playwright and simulator artifacts; add exact-head binding and native runtime versions.

### LAB-V2: Desktop breadth
Add Playwright Firefox/WebKit and selected branded channels; traces and controlled visual/spatial regression; classify browser-specific expected limitations.

### LAB-V3: Simulation matrix automation
Make device x fault x dataset scenario campaigns runnable from the portable lab engine; use pairwise/covering-array reduction for routine sampling and full relevant matrix at qualification.

### LAB-V4: Independent XR runtimes
Prototype PICO and HTC/OpenXR lanes, then PC OpenXR/SteamVR. Require the same semantic scenario contract but preserve runtime-native observations.

### LAB-V5: Calibration
Create paired simulator-to-Quest experiments, discrepancy reports, validity domains and automatic staleness after relevant runtime/firmware changes.

### LAB-V6: Professional XR
Define engineering-grade criteria and add Varjo-class/high-resolution PCXR simulation/runtime capability; later physical qualification when hardware exists.

### LAB-V7: Continuous orchestration
Merge-trigger claim-impact fanout, nightly breadth campaigns, WIP/freshness dashboard, fix-forward/reverification links, cost/resource budgets and no-silent-disappearance invariant.

### LAB-V8: Moneta research expansion
Only after the harness is credible: compute staircase, evolutionary representation exploration, sealed qualification, semantic-gain and complexity accounting, out-of-grammar reporting.

## 12. Exit criteria

The harness is operationally credible when: every important claim maps to one or more evidence classes; every native subsystem is discoverable; current-main freshness is visible; required cross-browser lanes execute reproducibly; simulator episodes are durable; at least one independent non-IWER XR runtime is replayable; simulator/Quest discrepancy is measured; findings have fix-forward/reverification lineage; no simulator is allowed to establish human claims; and a clean machine can reproduce a portable campaign from pinned inputs.

## 13. References / prior art to retain in design rationale

- Playwright projects, traces and visual comparison facilities for browser/platform matrices and diagnosability.
- Khronos OpenXR Conformance Test Suite as a runtime-conformance reference, not an application correctness suite.
- WebXR/Web Platform Tests as the normative browser API conformance reference where applicable.
- Engineering V&V/VVUQ practice: verification, validation, calibration and uncertainty/domain-of-validity must remain distinct.
