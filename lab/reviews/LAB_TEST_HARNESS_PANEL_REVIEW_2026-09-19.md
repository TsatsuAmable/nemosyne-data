# Adversarial Research + QA Engineering Panel Review

**Subject:** `LAB_AND_TEST_HARNESS_WORKFLOW_PLAN_2026-09-19.md`  
**Disposition:** **CONDITIONALLY ACCEPTABLE; proceed in staged implementation with mandatory amendments below.**

## Panel roles

1. Simulation credibility/VVUQ researcher
2. Experimental-methods and statistics reviewer
3. XR/WebXR/OpenXR systems researcher
4. Senior QA/test-architecture engineer
5. Reliability/chaos engineering reviewer
6. Reproducibility/evidence-custody reviewer
7. Human-factors/VR validity reviewer
8. Red-team reviewer for process theatre and false confidence

## Findings

### A. The architecture is directionally sound
The strongest feature is the refusal to create a second product-validation authority. Native runners retain dispositions while the lab owns experiment design, cross-runtime comparison and durable research evidence. This avoids the previous scheduler-reinvention failure mode.

### B. 'Run everything after every merge' would be a mistake
A complete browser x simulator x device x fault x dataset x repetition matrix grows combinatorially, consumes scarce physical hardware time and increases flaky-test surface. The plan must use claim-impact selection plus covering-array/pairwise sampling for routine work, with preregistered full cells only for qualification. A scheduler that maximizes job count is not evidence engineering.

### C. Simulator diversity is not runtime independence
Quest 2/3/Pro envelopes sharing IWER are correlated observations. They must never be counted as three independent confirmations. Evidence summaries need a `runtimeLineage`/independence field and should report correlated groups.

### D. Calibration is currently the largest scientific gap
The laboratory has profiles and perturbations but little quantified mapping from simulator observations to physical-device observations. Without paired runs, numeric simulator performance thresholds risk pseudo-precision. LAB-V5 should begin earlier, immediately after durable episode capture, and calibration uncertainty should gate claims.

### E. Browser breadth needs semantic tiering
Firefox/WebKit failures may reflect unsupported WebXR rather than Nemosyne defects. Desktop product tests, WebXR API support tests and XR interaction tests need separate expected-capability manifests. Otherwise cross-browser expansion will generate noisy false failures.

### F. Visual regression can become brittle theatre
Pixel snapshots are host-sensitive. Use them only with pinned environments and combine them with semantic geometry/layout assertions. Never accept a baseline update solely because 'the UI intentionally changed'; require review of the claim the baseline protects.

### G. Physical Quest remains a single-vendor reference
Quest is valuable but cannot validate generic WebXR, Apple transient-pointer, PCVR or professional engineering-headset claims. The evidence vocabulary must prevent 'physical XR tested' from being generalized beyond the tested device/runtime/input topology.

### H. Professional XR needs a requirements model before a simulator
Do not begin by inventing a 'Varjo simulator'. First specify professional-use claims: angular legibility, dense semantic working set, gaze precision/latency, workstation rendering budget, sustained-session stability, precision selection and perhaps passthrough/AR requirements. Then choose vendor runtime/simulator/hardware capable of testing each claim. Otherwise the simulator will encode assumptions rather than test them.

### I. OpenXR CTS is useful but easy to misuse
Khronos CTS tests runtime conformance, including invalid API behavior; it is not an application correctness suite. Use CTS/conformance status to characterize runtimes and borrow boundary cases, but do not report CTS success as Nemosyne qualification.

### J. Statistical multiplicity and adaptive search need stronger governance
Large perturbation/evolution matrices invite post-selection bias. Experiments must distinguish exploratory from confirmatory runs, freeze confirmatory criteria, preserve all attempted cells, and account for repeated comparisons. Evolutionary search outputs require sealed independent confirmation.

### K. Fault models need empirical provenance
'Noisy' and 'hostile' values are useful engineering stressors but should not be described as realistic hardware distributions without measurement. Label synthetic stress vs calibrated distributions explicitly.

### L. Evidence freshness needs dependency-aware invalidation
Age alone is insufficient. A browser test may remain valid across a Moneta analytical change while a semantic rendering test may not. Freshness must derive from changed capabilities/dependencies plus runtime/browser/firmware changes, with time-based expiry only where justified.

### M. Flakiness must itself be measured
Retries can conceal nondeterminism. Record first-attempt result, retry result, runtime variance and intermittent-failure rate. Repeated flaky success should become a finding rather than PASS.

### N. Negative controls are underemphasized
Every major campaign family should include cases expected to fail/refuse/ABSTAIN. A harness that only demonstrates successful specimens cannot establish that its gates discriminate.

### O. Cost must be a first-class experimental constraint
Record machine/device minutes, wall time and artifact volume. Establish budgets for per-merge, nightly and qualification campaigns. Otherwise evidence abundance can recreate the attention/operations bottleneck the lab is intended to reduce.

## Mandatory amendments before LAB-V4+

1. Add runtime-lineage/independence metadata.
2. Move initial simulator-to-Quest calibration into LAB-V1/V2, not V5 only.
3. Add browser/runtime capability manifests so unsupported features become explicit SKIP/INAPPLICABLE rather than false PASS/FAIL.
4. Add first-attempt/retry/flakiness metrics.
5. Add negative-control requirements to each campaign family.
6. Add synthetic-vs-calibrated fault provenance.
7. Define dependency-aware evidence invalidation.
8. Define resource/cost budgets and bounded artifact retention.
9. Specify professional-XR requirements before selecting/building its simulator profile.
10. Require exploration/qualification separation and multiplicity handling for large/adaptive campaigns.

## QA acceptance gates for each new native worker

A worker is not integrated merely because it runs. It must demonstrate: exact specimen identity; deterministic or explicitly statistical replay; timeout and cancellation; cleanup/isolation; intentional-failure detection; malformed-artifact rejection; native disposition preservation; bounded evidence; failure diagnostics; no secret/data leakage; concurrency safety where applicable; and a self-test proving the coordinator cannot convert missing/invalid evidence into PASS.

## Research acceptance gates for each simulator/model

Document referent, intended claims, excluded claims, modeled/unmodeled variables, calibration evidence, validity domain, uncertainty/discrepancy, runtime lineage and out-of-domain behavior. Until calibrated, performance observations remain diagnostic/falsification evidence rather than physical-equivalence evidence.

## Final verdict

Proceed with LAB-V0 through V3, but fold early calibration and the mandatory amendments into those tranches. Prototype vendor runtimes in parallel as research spikes, but do not promote PICO/VIVE/Varjo profiles to qualification workers until their evidence contracts and validity domains exist. The highest-value near-term work is durable simulator evidence + cross-browser capability manifests + paired Quest calibration, not adding the maximum number of simulators.
