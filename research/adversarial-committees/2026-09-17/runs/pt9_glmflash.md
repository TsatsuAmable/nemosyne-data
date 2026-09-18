# PT9 / Full Moneta Prerequisites — Adversarial Committee Report
## Candidate-specific effective dimensionality and small-n/high-p admission & stability policy

**Epistemic status of this report.** This session had no access to the nemosyne.world repository and no web access. Every statement about Moneta internals is a hypothesis tagged **[HYP]** and must be verified against `main` before any implementation scoping. Every literature item is tagged **[CLM]** and is *unverified* — model consensus (including this committee's) confers no authority; the prior-art table in §7 lists exactly what a human must check. Governing criteria the committee proposes for adoption are tagged **[CRIT]**. Established mathematics we rely on is tagged **[OBS]**. Falsifiers are tagged **[FALS]**.

---

## 1. Problem

**Decision space.** For each candidate representation *c* (assumed [HYP]: a (transform, metric, feature-family) triple), the policy must emit exactly one of:

- **ADMIT** (with an evidence class, see §4.5),
- **ABSTAIN(typed code)** — insufficient or invalid evidence; auditable, first-class,
- **REJECT** — only on *positive negative-evidence* (pre-registered equivalence bounds), never on mere instability **[CRIT]**.

**Core estimands.** "Effective dimensionality" is not one quantity. The committee insists on separating:

1. **ED_spec(c)** — number of spectral directions of *c* that exceed a *calibrated noise bulk* (Marchenko–Pastur / parallel-analysis). Answers "how many directions are not noise." [OBS: MP bulk edges at σ²(1±√γ)² for aspect γ=p/n; BBP phase transition separates supercritical spikes.]
2. **ED_eff(c)** — a continuous companion (participation ratio (Σλ)²/Σλ², or Roy–Vetterli effective rank exp(H(p̃))), on the *noise-subtracted* spectrum, with bootstrap CI. [CLM: Roy & Vetterli 2007; participation-ratio usage in neuroscience — verify.]
3. **ED_task(c)** — minimal prefix length k whose top-k structure preserves a declared task/information functional within tolerance ε (only defined when a target exists).

**[CRIT C1]** No ED number is admissible without a *declared geometry* (metric, scale handling, compositional transform, missingness mechanism) and a declared information functional. An unqualified "effective dimension" is rejected as ill-posed.

**Why this is hard (the constraints that shape everything below):**

- **[OBS]** In p ≫ n, selection among representations is fundamentally underdetermined without declared inductive bias; any policy is a prior wearing a lab coat. The requirement is therefore not "find the right selector" but "make the selector's assumptions explicit, null-calibrated, and falsifiable."
- **[OBS]** All downstream point estimates after selection are biased (winner's curse) unless inference is split, carved, or conditional on the selection event.
- **[HYP]** Memory-system data are *temporal and drifting*; i.i.d. exchangeability — which permutation nulls, stability selection bounds, and cross-validation all lean on — is likely false. This is the single most domain-specific threat and is under-addressed in the generic literature.
- **[OBS]** At n < ~20, virtually any admission decision is premature. The correct output of a rigorous small-n policy is *frequently ABSTAIN*; a policy that rarely abstains at small n should be presumed broken, not efficient.

---

## 2. Competing approaches

| Family | Core idea | Strengths | Weaknesses |
|---|---|---|---|
| **A. Spectral/RMT** (MP thresholding, BBP/spiked models, Gavish–Donoho thresholds; shrinkage variants) | Rank = spikes above calibrated bulk | Finite-sample theory exists; cheap; deterministic; benchmarkable | Sensitive to marginals, heavy tails, dependent noise; rank ≠ task relevance; shrinkage (Ledoit–Wolf) *biases rank estimates downward* — must not be applied before ED estimation |
| **A′. Parallel analysis** (Horn-style permutation nulls) | Null eigen-distribution via column permutations | Distribution-free w.r.t. marginals; well-behaved at small n; extends to distance-based geometries where MP does not | Permutation cost; null is "no cross-feature dependence," not "no structure" within features; B tuning |
| **B. Information-theoretic / MDL** (bias-corrected MI screens, Kraskov k-NN MI, prequential code length) | Admit by code-length or information gain vs. null code | Scale-agnostic; aligns naturally with "evidence admissibility"; no Gaussian assumption | Estimator bias at small n is severe and must be permutation-calibrated; computationally heavy; continuous MI unstable at n≲50 |
| **C. Stability / perturbation** (stability selection, bagged selectors, bootstrap ED) | Stability of decisions under resampling | Model-free; produces interpretable indices; cheap | Error-control assumptions fail under correlated features; **stable ≠ correct** (stable confounders); thresholds otherwise arbitrary |
| **D. Geometric/manifold ID** (twoNN, Levina–Bickel MLE, DANCo, HIDALG; Gower + PCoA for mixed data) | Local/global intrinsic dimension from distances | Handles nonlinearity; works on mixed-scale data via distance geometry | High variance and known small-n bias; noise dimension swamps local estimators; local≠global ambiguity |
| **E. Bayesian / hierarchical shrinkage** (spike-and-slab, horseshoe, EB over eigenvalues) | Posterior mass on "no effect" as abstention | Coherent uncertainty; abstention natural | Prior sensitivity conflicts with evidence-admissibility norms; MCMC is hostile to deterministic WASM; deferred |
| **F. Conservative abstention-only** | Admit only on external replication | Zero false admissions | Vacuous utility; not a policy |

**Committee stance [CRIT].** A *layered hybrid with lexicographic gates*, not a weighted score: A/A′ primary for ED_spec, D as cross-check, A′ as the primary null for distance geometries, B for scale-aware screens, C as a *necessary-not-sufficient* filter, E deferred. Lexicographic ordering removes policy-weight tuning — a major meta-overfitting vector. Two genuinely novel-ish design elements we propose: **(i)** the *disagreement between MP and parallel analysis used as an explicit specification test of the noise model* (heavy tails/dependent noise), and **(ii)** *decision-stability* (stability of ADMIT/ABSTAIN/REJECT vectors, including abstention behavior) rather than the classical selection-set stability.

---

## 3. Strongest counterarguments (steelman)

1. **"ED without a task is not identifiable."** Strongest conceptual attack; families A/D answer different questions and can disagree by design. *Response:* adopt the dual/triple estimand (C1) and **[CRIT C12]** candidate-specific ED is *advisory*; admission is decided only on a common evaluation protocol. *Concession accepted:* ED_spec alone never justifies admission.
2. **"You cannot validate an admission policy at small n — the benchmark suite has Monte Carlo error too, so policy rankings are noise."** *Response:* paired designs, large B, CIs on benchmark metrics; differences within CI are treated as **ties resolving to the simpler policy** [CRIT]. *Partial concession:* policy ranking near the noise floor is unknowable; the committee's answer is preregistration, not more tuning.
3. **"Exchangeability fails: memories accrue over time, with batch/drift effects; permutation nulls and CV are miscalibrated."** *Accepted as central.* Governing fix: time-ordered splits (train on past, validate on future), block permutations, and a drift gate (§4.1 G0) that compares noise-bulk location across temporal strata; nonstationarity ⇒ **ABSTAIN(NONSTATIONARITY)**.
4. **"Model-X knockoffs / second-order knockoffs are vacuous in p≫n because the feature distribution cannot be estimated."** *Accepted.* Knockoffs and polyhedral selective inference are demoted to *advisory* evidence classes, lexicographically below holdout-based evidence.
5. **"Stability thresholds are arbitrary and tuning them on your own benchmark is meta-overfitting."** *Response:* thresholds preregistered against a locked suite; validated on held-out *generator variants* (different seeds/SNR grids), not the tuning suite; every threshold change is a preregistered event.
6. **"The compositional framework may be the wrong frame: structural zeros, non-closed generative processes."** *Response:* closure diagnostics (total-sum stability across samples); count-model pathway as an alternative; excessive zeros ⇒ abstention, not imputation heroics.
7. **"ABSTAIN is gameable — a policy that abstains always is unfalsifiable and blame-free."** *Response:* abstention itself is benchmarked: decay curves (abstention rate must decrease in n), selective-risk acceptance criteria, and *trap benchmarks where correct behavior is abstention* (§5, F7). A policy that abstains everywhere fails the suite. **[CRIT C10]**
8. **"One-PR rule + layered design = shipping half a policy that later masquerades as full authority."** *Response:* the artifact schema carries a policy-version and evidence-class; when upper layers are absent the system fails **closed** (ABSTAIN), so a v0 gate cannot masquerade as admission authority.
9. **"Cross-platform determinism (x86 vs wasm32) may be unattainable with floating-point non-associativity."** *Accepted as a live governance risk.* Mitigations: pure-Rust deterministic decompositions (no BLAS divergence), quantized thresholds (e.g., 1e-10 spectra snapping), and a determinism falsifier (F9) treated as a *release blocker* because analytical authority lives in Rust/WASM **[CRIT C9]**.
10. **"This is over-engineered for current data volumes."** *Response:* then the policy's correct observable behavior is mostly ABSTAIN at small n, which is an acceptable outcome by design — but the machinery is still required so that the abstention is *typed, auditable, and decaying* rather than blanket.

---

## 4. Proposed algorithms / designs

### 4.1 Gate pipeline (lexicographic; every failure ⇒ typed ABSTAIN)

| Gate | Name | Test (summary) | Abstain code on failure |
|---|---|---|---|
| G0 | **Geometry/scale validity** | Declared scale ladder per feature (nominal/ordinal/interval/ratio + compositional flag + temporal index); permissible operations only (no cross-scale arithmetic; ordinal → rank transform, not raw centering; nominal → one-hot+ridge or declared distance; compositional → §4.3). Missingness mechanism screened by permutation-based missingness association test. | `GEOMETRY_INVALID`, `MISSINGNESS_UNRESOLVED` |
| G1 | **Null calibration** | The scoring function itself must be calibrated: on label/structure-destroyed permutations, score p-values must be uniform (KS on −log p vs Exp(1)); otherwise the score is invalid *for this dataset class* | `SCORE_MISCALIBRATED` |
| G2 | **ED estimation** | §4.2 algorithm; MP↔PA agreement required | `ED_DISAGREE`, `COMPUTE_DEGRADED` |
| G3 | **Perturbation stability** | §4.4 decision-stability index | `STABILITY_FLOOR` |
| G4 | **Post-selection evidence** | §4.5 evidence class present | `EVIDENCE_MISSING` |
| G5 | **Redundancy** | Incremental common-criterion utility vs already-admitted set (paired folds, paired permutation test) | `REDUNDANT`, `INCREMENTAL_EVIDENCE_INSUFFICIENT` |
| G6 | **Drift** | Noise-bulk and spectrum compared across temporal blocks; block permutation for nulls | `NONSTATIONARITY` |

**[CRIT C2]** Fail-closed: absence of an evidence class or a gate verdict ⇒ ABSTAIN. **[CRIT C3]** Instability ⇒ ABSTAIN, never REJECT; REJECT requires a pre-registered negative-evidence class (e.g., TOST-style equivalence bounds). **[CRIT C8]** Scale/composition validity precedes all computation.

### 4.2 Moneta-ED (primary algorithm)

```
fn ed_profile(X, geom, cfg) -> Result<EdProfile, Abstain> {
  let Xg = transform(X, geom)?;                    // G0, fail-closed; zeros policy first
  let lam = eigenvalues(cov_or_gram(Xg));          // deterministic pure-Rust decomposition
  // Noise bulk, two independent estimators:
  let (k_mp, bulk) = mp_rank(&lam, gamma=p/n);     // robust σ̂ from median eigenvalue vs MP CDF
  let (k_pa, qnull) = parallel_analysis(&Xg, B=256, seed); // column-permutation nulls, q_{1-α}
  if |k_mp − k_pa| > 1 { return ABSTAIN(ED_DISAGREE); } // this is the noise-model spec test
  let lam_t = (lam − upper_bulk).max(0);           // noise-subtracted (Gavish–Donoho-style)
  let pr   = (Σλ_t)² / Σλ_t²;                      // participation ratio, BCa bootstrap CI
  // n ≥ 32 only: twoNN local-ID cross-check; |local/global| mismatch > 2× ⇒ flag (non-fatal)
  Ok(EdProfile { k: max(k_mp,k_pa), ci, pr, agreement, seeds, params, quantized_spectra })
}
```

- **[CLM — verify constants before coding]** MP density/edges; Gavish–Donoho optimal hard threshold (the "4/√3" and 2.858 constants must be taken from the paper, not from memory); twoNN MLE form (Facco et al. 2017).
- **Distance geometries (mixed data via Gower/PCoA):** MP is demoted to advisory; **parallel analysis is the primary null** [CRIT], because MP's iid-entries assumption does not transfer to Gram matrices of embedded mixed data.
- **Invariance checks:** ilr basis rotation must not change eigenvalues (orthonormal invariance — a cheap implementation bug detector, F11); seed and platform determinism (F9).
- **Compute reality [HYP/engineering]:** PA at B=2000 is infeasible in wasm32 at n≈512; ship B=256 with binomial CI on the quantile, truncated/randomized SVD with fixed seeds, and `COMPUTE_DEGRADED` abstention on budget overrun.

### 4.3 Compositional pathway

- Detect compositionality by schema (preferred) or closure diagnostics (constant totals); else treat as counts and route to count models. [CRIT]
- Transform: **ilr** (orthonormal; spectrum-invariant to basis choice) for spectral work; clr only for pairwise log-contrast interpretation.
- Zeros: distinguish structural vs rounded zeros where metadata allows; rounded → multiplicative replacement [CLM: Martín-Fernández et al.]; structural → subcomposition or abstention; **zero fraction > 25% ⇒ ABSTAIN(COMPOSITIONAL_ZEROS)** [CRIT — threshold preregistered].
- ED max rank is p−1 by construction; all reported EDs are relative to that ceiling. Closure-induced negative bias in raw-space correlations is expected [OBS] and is exactly what B2 (§5) verifies.

### 4.4 Stability layer (decision-stability, not just selection-stability)

For each candidate *c*, over B≈200 subsamples (rows without replacement at ρ∈{0.6,0.8}), instrument-noise jitter calibrated to a *declared measurement-precision field*, and K seeds:

- **S_c** = mean agreement of the full decision vector {ADMIT, ABSTAIN, REJECT} with the full-data decision; plus **stability of ED itself**: IQR(k̂)/median(k̂) ≤ 0.25 required for ADMIT-without-flag [CRIT; threshold preregistered].
- **[CRIT C3]** low stability feeds ABSTAIN, never REJECT.
- Stability-selection theory (Meinshausen–Bühlmann) is cited as inspiration only: its error bounds require sparsity and exchangeability assumptions that correlated candidates and drift violate [CLM; see critiques — Shah & Samant, verify].

### 4.5 Post-selection evidence taxonomy

| Class | Method | Assumptions | Small-n status |
|---|---|---|---|
| **E-HOLDOUT** | Time-ordered split; selection on train; effects + paired permutation test on future/hold-out; cross-fitted repeats | Only exchangeability of folds; strongest available | Preferred default |
| **E-CARVE** | Data carving / data fission (partial splitting) | Selection event modeled | Advisory at small n |
| **E-KNOCKOFF** | Model-X (second-order) knockoffs, FDR target q | Knows/approximates X distribution — **likely violated in p≫n** | Advisory only [CRIT] |
| **E-SELECTIVE-CI** | Polyhedral selective inference for the declared procedure | Gaussian-ish design, known selection event | Advisory; coverage poor at small n [CLM] |
| **E-DESC** | In-sample descriptive effect | none | **Not admissible as admission evidence** [CRIT C6] |

**[CRIT C6]** Any effect size attached to an admission must carry one of the admissible class tags; uncorrected in-sample effects are descriptive only.

### 4.6 Calibration & abstention governance

- Scores become p-values via per-feature permutation nulls (G1 uniformity gate); candidate-level multiplicity handled by BH (PRDS-aware) with BY fallback under unknown dependence; two modes: **EXPLORATORY** (q=0.2, provisional tags) and **CONSOLIDATION** (q=0.05, requires future/hold-out evidence) [CRIT].
- Conformal wrapper on validation folds sets the abstention threshold for a target selective error α.
- **Abstention is itself measured:** abstention-rate-vs-n decay curves and selective risk must satisfy: selective risk on ADMIT ≤ non-selective baseline by a preregistered margin; abstention decays with n on benchmarks. **[CRIT C10]** — otherwise ABSTAIN is decorative.

### 4.7 Governing criteria summary (proposed for adoption)

**C1** estimand-first (geometry + functional declared); **C2** fail-closed typed abstention; **C3** instability ⇒ ABSTAIN, never REJECT; **C4** per-feature permutation null calibration mandatory, miscalibration invalidates the score; **C5** two-null agreement (MP↔PA) for unsupervised rank claims; **C6** method-tagged effects only; **C7** redundancy gate (incremental utility vs admitted set); **C8** scale/composition validity first; **C9** bit-reproducible evidence artifacts (seeds, quantized thresholds, pure-Rust numerics); **C10** abstention must decay and beat selective-risk baselines; **C11** locked benchmarks; policy tuning preregistered, validated on held-out generator variants; **C12** candidate-specific ED is advisory; admission decided only on the common protocol.

---

## 5. Decisive experiments (each is a falsifier with pass/fail)

| # | Setup | Metric & pass criterion | Falsifies |
|---|---|---|---|
| F1 | **B1 Spiked**: X = UD Vᵀ + σZ, r∈{1,2,5}, n∈{16,32,64,128}, γ∈{2,10,100}, SNR sweep; locked seeds | ED_spec 90% CI coverage ≥ 0.8 conditional on not abstaining, for all cells n≥32 | MP/PA rank machinery at small n; the ABSTAIN rate must absorb the rest |
| F2 | **B4 Nulls**: Gaussian, heavy-tailed (t₃), AR(1) noise | On Gaussian: MP↔PA disagreement ≤5%; on heavy tails: disagreement *and* `ABSTAIN` — the falsifier is **any admission** under heavy-tailed nulls | The disagreement-as-specification-test design |
| F3 | **B2 Compositional**: known latent balances → closure + instrument noise + rounded zeros {0,5%,20%} | Raw-space ED deviates from truth (validates the gate); ilr pathway recovers rank ±1 on ≥90% runs; zero-rule triggers at 20% | Compositional handling and thresholds |
| F4 | **B3 Mixed-scale**: planted per-type dependencies; nominal card ∈ {2,8,50} | Naive pipeline false-admits high-cardinality nominal features; permutation-calibrated pipeline does not (FAR ≤ q) | Scale-aware screen necessity |
| F5 | **B5 Stable-but-wrong**: confounded proxy selected with S_c ≈ 1 | Policy must not attach evidence class above E-DESC/E-KNOCKOFF | "Stable ⇒ admissible"; stability sufficiency |
| F6 | Sweep stability floor S* on B1 vs B5 | Exists a floor separating true-stable from confounded-stable; if none, escalate evidence requirements instead of thresholds | Whether stability can carry decision weight at all |
| F7 | **Abstention traps**: generator families where correct behavior is ABSTAIN (miscalibrated score, nonstationarity, excessive zeros) | Abstention rate decreases in n on B1 (Spearman ≤ −0.5); selective risk ≤ baseline | Vacuous/gameable ABSTAIN |
| F8 | **Cross-geometry comparability**: same truth under raw/ilr/mixed geometries | Admission decisions agree ≥ 90% | C12; comparability of candidate-specific ED |
| F9 | **Determinism**: identical binary+seed+input on x86 and wasm32 | Bit-identical evidence artifact hashes | Rust/WASM analytical authority [release blocker] |
| F10 | **Compute budget**: n=128, p=20k full profile in wasm32 | ≤ 60 s with randomized SVD, B=256; else `COMPUTE_DEGRADED` is exercised correctly | Feasibility of PA-heavy design |
| F11 | **Invariance**: ilr basis rotation; seed variation | Spectra identical to quantization tolerance | Implementation correctness |
| F12 | **Closure diagnostics**: totals drift with informative totals | Closure-assumption flag fires; count-model route offered | Compositional framing applied to non-compositional data |

**Meta-overfitting guard [CRIT C11]:** B1–B5 parameters locked at v1; every policy change validated on held-out *generator variants* (different seed family and SNR grid); paired comparisons with CIs; ties resolve to the simpler policy.

---

## 6. Risks

- **Scientific.** ED non-identifiability without task context (mitigated by dual estimand, never fully removed); benchmark Monte Carlo error making policy rankings noise; exchangeability violations under drift (the biggest uncontrolled threat); heavy tails silently breaking MP (F2); stability thresholds becoming cargo-cult constants; conformal/calibration wrappers themselves overfit at small n.
- **Engineering.** wasm32 compute ceilings for PA; floating-point non-associativity across platforms threatening C9 (mitigation: pure-Rust deterministic decompositions, quantization; escalate if F9 fails); memory blowups at p~1e5 (streamed Gram accumulation).
- **Governance.** ABSTAIN gaming; a v0 gate being misread as a full policy (mitigate: policy-version field in artifacts, fail-closed defaults); one-PR friction encouraging bundling (resist — sequence §8); "model consensus is not authority" applies to this report too — every [CLM] must be independently verified before it enters implementation.
- **Operational [HYP].** Missingness mechanisms and instrument-precision fields may not exist in current schemas; if absent, G0 fails closed and much of the corpus will abstain initially — acceptable, and diagnostic.

---

## 7. Prior art to verify (all items **[CLM]** — unverified this session)

| Item | What it claims | What to verify | Design element depending on it |
|---|---|---|---|
| Marchenko–Pastur (1967); Baik–Ben Arous–Péché (2005); Johnstone spiked eigenvalues (2001) | Bulk edges; spike phase transition; TW test | Exact constants, aspect-ratio conventions | G2 MP rank |
| Gavish & Donoho, optimal singular-value threshold (2014) | Hard-threshold constants (≈4/√3 · σ√n; unknown-σ variant) | **Do not hand-copy constants**; take from paper | Noise subtraction in ED_eff |
| Horn parallel analysis (1965); Dinno (2009) comparison | Permutation-null eigenvalue quantiles | Exact permutation scheme, small-n behavior | Primary null for distance geometries |
| Onatski (2010) eigenvalue-edge test; Ahn & Horenstein (2013) eigenvalue ratio | Factor-count tests | Small-n behavior | G2 cross-checks |
| Levina & Bickel MLE ID (2004); Facco et al. twoNN (2017); DANCo; HIDALGO; ID-estimator benchmarks (Campadelli et al. 2015; later surveys) | Local ID estimators and their small-n bias | Bias direction/variance at n≤64 | D-family cross-check |
| Roy & Vetterli effective rank (2007); participation-ratio usage in neuroscience (verify, e.g., Recanatesi et al.) | Entropy/PR definitions | Definitions and prior art for "novelty" claims | ED_eff definition |
| Aitchison (1986); Egozcue et al. ilr (2003); Pawlowsky-Glahn & Buccianti (2011); Martín-Fernández zero replacement; Gloor et al. (2017) | Log-ratio geometry; zero handling | Method choice for rounded vs structural zeros | §4.3 |
| Benjamini–Hochberg (1995); Benjamini–Yekutieli (2001); Efron empirical null (2004–07) | FDR under dependence; null modeling | Applicability at small m_eff | Candidate-level multiplicity |
| Meinshausen & Bühlmann stability selection (2010) + critiques (verify: Shah & Samant ~2017) | Error bounds + fragility under correlation | Bound conditions; critique content | G3 demotion to necessary-only |
| Barber & Candès knockoffs (2015); Candès et al. model-X (2018); Katsevich & Ramdas conditional CRT | Finite-sample FDR; CRT validity | Feasibility of second-order knockoffs in p≫n | E-KNOCKOFF advisory status |
| Lee et al. polyhedral selective inference (2016); Taylor & Tibshirani (2015); Fithian, Sun & Taylor data carving (~2014); data fission (Neufeld et al., ~2023–24) | Post-selection inference options | Current best practice at implementation time | §4.5 |
| van de Geer et al. desparsified lasso (2014); Zhang–Zhang; Javanmard–Montanari | Debiased CIs | Documented small-n coverage failures | Advisory status |
| Ledoit & Wolf (2004) shrinkage | Covariance shrinkage | Shrinkage *biases rank* — split ED-estimation from downstream estimation | Numerics policy |
| Kraskov et al. k-NN MI (2004); Bergsma & Wicherts bias-corrected Cramér's V (2013); Miller–Madow correction | Scale-aware association estimators | Small-n bias corrections | B-family screens |
| Vovk et al. conformal prediction (2005); Angelopoulos & Bates tutorial (2021) | Distribution-free coverage | Split-conformal at tiny calibration folds | Abstention thresholds |
| Chow (1970); Geifman & El-Yanov selective classification (2017) | Reject-option theory | Modern selective-risk metrics | C10 acceptance criteria |
| Fan, Han & Liu (2014) high-dim challenges | Survey of p≫n pathologies | Framing support | §1 |
| TOST equivalence testing (Schuirmann 1987; Lakens) | Pre-registered negative evidence | Small-n power implications | REJECT-with-negative-evidence class |

---

## 8. Recommended next engineering decision (single forward implementation PR)

**Ship S1: `moneta-ed-profile-v0` — the fail-closed core.** One PR, feature-flagged, containing:

1. **Scale/geometry declaration + G0 validation** (scale ladder, compositional flag, missingness screen) — fail-closed.
2. **Moneta-ED core**: deterministic pure-Rust spectrum (no BLAS divergence), MP rank with robust σ̂, parallel analysis B=256 (seeded, stored), agreement gate, participation-ratio ED_eff with subsampling CI, quantized thresholds.
3. **Typed ABSTAIN codes** for every gate, plus `COMPUTE_DEGRADED`; evidence-artifact schema with seed/input/binary hashes and a `policy_version` field.
4. **Moneta-Bench-lite**: B1 (spiked) + B4 (nulls, incl. heavy-tail) generators with locked seeds; CI-runnable rank-recovery and null-uniformity harnesses with preregistered pass thresholds (F1/F2/F9/F11).

**Explicitly out of scope (sequenced for subsequent single PRs):** S2 stability layer; S3 evidence classes (holdout/carve/knockoff); S4 admission fusion + redundancy gate + drift gate; S5 compositional zero-replacement beyond refuse/abstain.

**Rationale.** S1 is fail-closed (a half-policy defaults to ABSTAIN, never to false authority), directly falsifiable via F1/F2/F9, and it fixes the estimand and artifact formats everything else depends on — the correct first brick under the one-forward-PR rule.

**Verification checklist against `main` before S1 scoping [HYP items to confirm]:** (a) current candidate/representation schema and whether measurement scales/precision fields exist; (b) current linear-algebra dependencies and their wasm32/determinism posture; (c) existing evidence-artifact format and hashing conventions; (d) the ABSTAIN enum's shape and propagation path; (e) confirm no existing ED/admission policy to avoid duplicate prior art inside the codebase.

**Committee's closing position:** the most likely correct behavior of this policy at small n is frequent, typed, auditable abstention. If the benchmarks show otherwise, that is a finding about the benchmarks, not permission to admit.