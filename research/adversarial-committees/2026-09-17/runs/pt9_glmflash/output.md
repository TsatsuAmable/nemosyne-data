# Adversarial Research Committee Report
## PT9 / Full Moneta Prerequisites: Effective Dimensionality and High-Dimensional Admission/Stability Policy

**Committee posture.** This report researches against current main; it edits no code and opens no PR. All recommendations below are *claims with attached falsifiers*, not findings. Where this committee (or any ensemble of models) converges on a view, that convergence carries no evidential weight; only harness outputs from the pinned Rust/WASM core under pre-registered designs are admissible. Internal artifacts referenced (PT9 draft, Moneta spec, admissibility/ABSTAIN rules) are items **to verify against main**, not asserted contents.

**Standing vocabulary.** Statements are tagged:
- **[O] Observation** — reproducible by running pinned code (spectra, p-values, benchmark operating characteristics).
- **[C] Claim** — a hypothesis with a kill condition attached.
- **[G] Governing criterion** — a binding rule on what counts as evidence or a decision; violations make a claim *inadmissible*, not merely wrong.

---

## 1. Problem

**Setting.** Moneta must decide whether to admit candidate representations (feature sets, embeddings, kernels, compositional blocks) into memory when the candidate pool is large (p) and the evidence base is small (n). The problem decomposes into three decisions that prior art and naive policies habitually conflate:

1. **H1 — Structure exists.** Does the candidate's spectrum carry directions distinguishable from its declared noise floor? (effective dimensionality)
2. **H2 — Structure is stable.** Do the same directions/selections recur under pre-registered perturbations (row resampling, per-scale jitter, preprocessing variation, seed)?
3. **H3 — Structure is relevant.** Does the candidate carry marginal information about the retrieval/task target beyond what is already admitted?

Each decision has different error semantics. Admissions control **familywise error (FWER)** at the portfolio level (conservative, consistent with the evidence-admissibility ethos); exploratory results go to a separate tier that never feeds reported metrics.

**Two levels of "effective dimensionality."**
- **(A) Within-candidate d_eff:** how many directions of a candidate are real. Operationally: *the integer spike count k̂ surviving a step-down, familywise-calibrated edge test under the candidate's declared null* — not a metaphysical quantity.
- **(B) Across-candidate m_eff:** the effective number of independent admission tests in the pool (correlated candidates double-count evidence). This governs multiplicity, not structure.

**Identifiability limit (must be stated in every claim).** [G] Under any noise model, population spikes below the detection edge (BBP: λ ≤ (1+√γ)·σ², γ=p/n) are *not adjudicable*, and no policy may assert **absence** of structure below the edge — only "not detected at (n, α, null N)." A d_eff claim without its (null model, α, n) triple is inadmissible.

**Why this is hard here specifically.** Sample covariance eigenvalues of pure noise follow the Marchenko–Pastur (MP) bulk with upper edge (1+√γ)²σ² — naive "count eigenvalues above 1" admits enormous noise floors at γ = p/n ≫ 1; sample spikes are additionally biased upward; analytic thresholds assume i.i.d. entries and Gaussian tails, both false for compositional/ordinal/count data; and any statistic computed after selection is biased (winner's curse) unless the selection event is accounted for.

**ABSTAIN as a decision class.** [G] ABSTAIN is triggered by **power**, not by weak p-values: before testing, compute the minimum detectable effect (MDE) for the candidate's null at (n, 80% power). If the profile-declared effect of interest is below MDE → ABSTAIN, never "reject." ABSTAIN, REJECT, and PROVISIONAL-ADMIT are distinct outputs with distinct downstream consequences.

---

## 2. Competing approaches

| # | Approach | Core claim | Strengths | Failure modes (falsifiable) |
|---|----------|-----------|-----------|------------------------------|
| A | **Analytic spectral** (MP/BBP/Tracy–Widom edges; BIC/IC rank, Onatski, Ahn–Horenstein ER/GR, Trapani randomization) | Thresholds from random matrix theory | Fast, closed-form, no tuning, strong priors on edges | Brittle to non-Gaussian tails, dependence, γ>1, n<100; TW finite-n approximations degrade; wrong scale geometry silently accepted |
| B | **Permutation / parallel analysis only** (Horn; Buja–Eyuboglu; column- and label-permutation nulls) | Everything is calibrated empirically | Scale-agnostic, auditable, works for kernels/embeddings where analytic laws fail | Column permutations destroy cross-feature dependence (that dependence may *be* the hypothesis); cluster/batch structure breaks label exchangeability; O(n²p)·B cost in WASM |
| C | **Information-theoretic relevance gates** (distance correlation, HSIC, MI) | Admit what carries dependence on the target | Model-free, works on any scale given a metric embedding | MI/dCor estimates badly biased at small n; still needs nulls; says nothing about structure/stability; O(n²) fine at small n |
| D | **Bayesian rank** (PPCA marginal likelihood, IBP/beta-Bernoulli) | Posterior over dimension | Naturally yields abstention via posterior mass on "no signal" | Prior-dominated at small n; Gaussian misspecification; audit burden; hard to verify deterministically in WASM |
| E | **Predictive/CV admission** | Value = out-of-sample usefulness | Directly aligned with retrieval value; no structure claims needed | Small-n CV variance; nested selection invalidates CV; can't adjudicate ties; leakage is the dominant failure |
| F | **Stability selection** (Meinshausen–Bühlmann; Shah–Samworth CPSS) | Stable selections are controlled | Finite-sample bound on expected false selections; intuitive | **Stability ≠ validity**: correlated noise blocks are stably selected (classic trap); threshold sensitivity; assumes base procedure has controlled noise |
| G | **Sketching / randomized trace** (JL projections, Hutchinson) | Make p tractable | Cheap in WASM; trace moments without eigendecomposition | **Random projection attenuates population spikes by ~p′/p** — pushes marginal spikes below the projected edge (see §4.6); JL weak under heavy tails |
| H | **Pure task-conditional** (no structure layer) | Only retrieval improvement matters | Simplest | Cannot adjudicate among equally useful representations; no retraction semantics; selection effects still invalidate its own metrics |

**Committee verdict.** [C] No single layer survives the benchmark battery; the defensible design is *triangulation*: scale-contracted preprocessing → spectral existence test with **triangulated noise floor** (analytic + permutation + fit, disagreement ⇒ flag) → stability layer → held-out relevance confirmation → portfolio FWER via permutation maxT → abstention ladder. Each layer's necessity is itself falsifiable (§5).

---

## 3. Strongest counterarguments (attack list)

1. **"d_eff is purpose-relative; a scalar is a category error."** *Conceded in part.* Response: define d_eff operationally (spike count at declared null/α) and bind every value to a **comparability token** — hash(n, γ, preprocessing version, null id, α, policy version). [G] Cross-candidate d_eff comparisons without a shared token are inadmissible.
2. **"Below-edge structure is unidentifiable, so any k̂ is arbitrary."** Response: accepted, hence the scope-of-claim rule above; the policy's honesty about the edge *is* the contribution.
3. **"At n<50 you are doing statistics on noise."** Response: that is precisely what the ABSTAIN layer formalizes; MDE tables per (n, γ, noise family) are a deliverable, and abstain-rate calibration (E8) is falsifiable.
4. **"Permutation nulls are not nulls — they destroy the dependence you're testing for."** Response: match null to hypothesis. Column-permutation null = "no joint structure beyond marginals." Parametric bootstrap from a fitted dependence model = "no structure beyond declared dependence." Block/cluster permutations = "nothing beyond cluster effects." [G] The null id is part of the evidence bundle.
5. **"Stability is not validity."** Agreed — E6 builds the correlated-noise trap as a standing regression benchmark; any policy passing stability alone must fail it.
6. **"Post-selection inference machinery is overkill for a memory system."** Response: minimal viable version is cheap: seeded selection/inference split + **contamination ledger** (provenance of every admitted artifact; downstream metrics exclude selection rows). Full polyhedral selective inference is deferred. [G] No reported metric may include rows that influenced its own admission.
7. **"Z-score everything and move on"** (scale-agnosticism). Provably wrong for compositional data (spurious correlation since Pearson 1896; subcompositional incoherence). E3 is a cheap, decisive regression test.
8. **"Your benchmarks are circular — same team builds generator and policy."** Mitigation: red-team generator authored by an independent subgroup, frozen validation grid disjoint from the calibration grid, adversarial scenario backlog.
9. **"ABSTAIN will be gamed (resample until not-abstain)."** [G] Attempt aggregation: candidate identity = content hash; all prior data seen for that identity accumulates into the decision; the decision conditions on the superset, not the latest draw.
10. **"Determinism in WASM floats is fiction."** Partially true (reassociation, FMA). Response: fixed reduction orders, counter-based PRNG (seeds in ledger), release-gate E13 (bit-identical outputs native vs wasm32 across seeds). [G] Non-bit-identical builds cannot sign admission certificates.
11. **"Model consensus is not authority — including this report."** Accepted. Every design choice below carries a falsifier; the go/no-go rule for the engineering decision is the pre-registered benchmark suite, not committee agreement.
12. **"This overfits the generator families you can imagine."** Mitigation: negative controls, identifiability-boundary controls (λ = 0.9×MDE must *not* produce confident admission), real-data anchors with approximate known structure, and a standing red-team backlog.

---

## 3a. Governing criteria (binding)

- **G1.** Every admission decision emits an evidence bundle: data fingerprint, preprocessing version, null model id, thresholds, seeds, spectra, stability rates, MDE. Uncited decisions are inadmissible.
- **G2.** Every d_eff claim cites (null, α, n); below-edge non-detection is never phrased as absence of structure.
- **G3.** Admission FWER controlled at portfolio level via permutation maxT under coupled nulls; exploratory tier never feeds reported metrics.
- **G4.** Stability is necessary, never sufficient; a confirmation gate (fresh split) is mandatory for the validated tier.
- **G5.** ABSTAIN is power-triggered; abstain-rate must itself be calibrated (E8).
- **G6.** All analysis (generators included) runs in the deterministic Rust/WASM core; external tooling is exploratory only.
- **G7.** One forward implementation PR per decision cycle; this committee produces designs and falsifiers, not code.

---

## 4. Proposed algorithms / designs

### 4.1 Scale contract (precondition for everything)

Each candidate declares a **scale contract**: per-feature type {nominal, ordinal, interval, ratio, count, compositional, circular}, missingness mechanism, allowed statistics, allowed nulls. Binding rules:
- Compositional blocks: analyze in log-ratio coordinates (CLR/ILR) after an explicit zero policy; zero-replacement enters a sensitivity grid. Block contributes rank ≤ k_b − 1; p_eff is computed block-wise (this is "measurement-scale-aware p").
- Nominal blocks: constraint-respecting embeddings (categories − 1); never full one-hot into a spectral analyzer.
- Ordinal: rank statistics; interval/ratio: robust centering (median/MAD), winsorization declared.
- [G] A statistic forbidden by the contract (e.g., Pearson on raw proportions) makes the analysis inadmissible.

### 4.2 NS-ED: Noise-aware Spectral Effective Dimension (per candidate)

```
Input: X (n×p) or kernel K; scale contract; seeds
1. Z ← preprocess(X, contract); analyzer ∈ {SVD on robust-centered Z,
   rank/Kendall variant (heavy tails), double-centered kernel}
2. Λ ← spectrum (desc); γ ← p_eff/n
3. Noise floor σ̂² by triangulation:
   a. MP-median fit;  b. B column-permutation nulls → per-order edges;
   c. trimmed bulk variance
   disagreement(a,c) > tol ⇒ flag "null-model disagreement"
4. Per-order permutation p-values: p_i ← (rank of λ_i among null's i-th
   largest)/B  (parallel-analysis comparison, order-aligned)
5. Step-down Holm over ordered p_i ⇒ k̂ (FWER α); no flags
6. De-bias retained spikes (σ²=1, BBP inversion, PLUS branch):
   λ ← [ (λ̂+1−γ) + sqrt((λ̂+1−γ)² − 4λ̂) ] / 2     (valid for λ̂ ≥ (1+√γ)²)
7. Secondary indices on de-biased, edge-clipped spectrum: PR_corr, stable rank.
   [G] PR-type indices alone cannot ground any claim (one dominant spike
   with noise bulk inflates raw PR to ≈ pn/(n+p) — computable anchor).
8. Subsample bootstrap (R≈200, 80% rows): CI(k̂), mean principal angle
   between subspace estimates.
9. Emit bundle {k̂, CI, σ̂² per estimator, flags, spectra, seeds}.
```
Notes: (i) analytic MP/BBP is the *prior*, permutation calibration is the *test* — this neutralizes Approach A's fragility while keeping its speed; (ii) at small n the finite-sample null distribution is Monte-Carlo-calibrated, never asymptotic; (iii) for kernel/embedding candidates, permutation calibration is invariant to the statistic used — any statistic may be calibrated this way, which resolves the A-vs-B dispute empirically (E2).

### 4.3 Admission gate (Moneta decision function)

Pre-check: **MDE/power gate** — if n insufficient for 80% power at the profile-declared effect → **ABSTAIN(A2)** before any test.

- **H1 Structure:** NS-ED k̂ ≥ 1, no flags.
- **H2 Stability:** subsample principal-angle ≤ tol; selection-frequency bound via complementary-pairs stability selection (CPSS) or standard π_thr with the q-bound; per-scale jitter grid flip-rate ≤ τ_flip.
- **H3 Relevance:** scale-aware dependence (distance correlation on the contracted embedding) vs. coupled permutation maxT across candidates; adjusted p ≤ α.
- **H4 Novelty:** marginal information over the admitted set (conditional d-cor / residualized gain) ≥ floor; else DEFER (re-adjudicate after pruning), not reject.
- **H5 Invariance:** preprocessing grid (zero-replacement values, winsorization depth, rank vs. VST) decision flip-rate ≤ tol; else **ABSTAIN(A3)** with engineering diagnosis.

Outputs: **ADMIT(validated)** — all gates on a fresh confirmatory split; **ADMIT(provisional)** — H1–H2 pass but n < confirmatory threshold (no confirmatory claims; excluded from reported metrics); **REJECT** — evidence against; **ABSTAIN(A2/A3)** — power, disagreement, CI width, or invariance failure, with reasons.

**Admission artifact = certificate, not blob.** Moneta stores: {representation ref, **validated subspace U_k**, preprocessors, null model, thresholds, CI, tier, comparability token}. This bounds memory cost to validated structure (d_eff becomes a *budget* quantity, not a vanity metric) and gives a clean retraction path. [G] d_eff is never used as a worthiness score: a one-directional candidate can be admissible; low d_eff ≠ low value.

### 4.4 Portfolio control

Coupled-permutation **maxT** over candidates sharing objects (same permutation index across correlated candidates) → exact-ish FWER under subset pivotality; **m_eff** estimators (eigenvalue-mapping family: Cheverud/Nyholt/Li–Ji; simpleM) reported as diagnostics and n-planning aids, not as the control mechanism. Selective accounting for the admitted set: interim = Σ min(1, p̂_i); target = Goeman–Solari-style selective confidence on false admissions (feasibility to verify, §7).

### 4.5 Ledger (post-selection inference, minimally viable)

Seeded selection/inference splits recorded; downstream evaluation excludes selection rows (contamination firewall); multi-split median-p for inference stability; effect estimates reported in two columns (selection-inclusive, fresh-data) with shrinkage to expose winner's curse. Policy versions are themselves candidates with provenance; re-calibration ⇒ new policy version, new ledger namespace.

### 4.6 Acceleration (with an explicit anti-claim)

- **[C-anti] Random projection is not a free lunch for spike detection:** projecting p→p′ attenuates a population spike by ≈ p′/p while the bulk stays σ², so marginal spikes fall below the projected edge (n=100, p=10⁴, p′=400: detection needs λ ≈ 225 vs. 11 unprojected). Sketches are admissible for **screening and null acceleration only** (permutation nulls remain valid: permute, then project, then compute — calibration is statistic-agnostic). Full-spectrum analysis is required for the validated tier.
- **Hutchinson trace estimation** gives tr Σ and tr Σ² (hence participation-ratio-type indices) in O(nnz) without eigendecomposition — useful for large-p WASM screening after edge-clipping; deterministic seeds required.

---

## 5. Decisive experiments (each pre-registered: claim, design, metric, kill rule)

| ID | Claim under test | Design | Metric / decision rule (pre-registered) |
|----|------------------|--------|------------------------------------------|
| E1 | Spike-edge tests are calibrated on Gaussian nulls | k=0; n∈{25,50,100,200}, p∈{n/2,n,4n,20n}; 2000 reps | FPR within [α±2·SE_bin]; fail ⇒ estimator's threshold rule killed |
| E2 | Power matches BBP; sketches adequate for screening | λ grid around (1+√γ)σ²; full vs. sketch (p′=2n,4n) | Sketch AUC gap ≤ .02, k̂ exact-rate gap ≤ 5pts at λ ≥ 1.3×MDE; else demote sketches |
| E3 | Scale-contract layer is necessary | Compositional nulls with marginal concentration; raw-Pearson vs. CLR/ILR policies | Raw-Pearson FPR ≫ α while log-rarm within band; if *not*, delete the scale layer (kills §4.1) |
| E4 | Robust variants survive heavy tails | t₃, elliptical-t nulls; classical vs. rank/spatial-sign | Classical fails band, robust passes; else drop robustness layer |
| E5 | Hypothesis-matched nulls fix clustered/batch data | 5-cluster row block null; naive label-perm vs. block-perm/parametric bootstrap | Naive fails, matched nulls pass; else null-matching is cosmetic |
| E6 | Stability ≠ validity trap | 50 correlated noise features (ρ=.6) + one weak true spike | Stability-only policy admits noise (must fail); full policy stays ≤ band; else confirmation gate is redundant |
| E7 | Ledger removes winner's curse | Effects on selection rows vs. fresh rows post-admission | Fresh-data estimates within declared CI coverage ≥ 1−α−ε; else inference layer killed |
| E8 | ABSTAIN is calibrated | Predicted P(ABSTAIN) from MDE tables vs. realized over grid | |diff| ≤ .1 and monotone decreasing in n; else abstention rule rejected |
| E9 | Invariance triggers fire correctly | Zero-replacement ×{0.1,0.5,1}, winsorization {0,1%,5%} | Flip-rate > tol ⇒ ABSTAIN(A3) fires; test the trigger, not the rate |
| E10 | m_eff diagnostics are informative | Equicorrelation / block dependence, known m_true | |m_eff − m_true|/m_true ≤ .25; else demote to qualitative |
| E11 | Real-structure anchors | Big Five (k̂∈[4,7]); Iris ([2,4]); controlled-topic embeddings with 3 encoders (d_eff concordance ±30%) | Systematic misses ⇒ estimator suspected; anchors are regression guards, not proofs |
| E12 | Runtime budget | n=200, p=5000 full policy | ≤ 2 s native / 15 s wasm; else sketch design triggered |
| E13 | Determinism (authority gate) | Native vs. wasm32, 100 seeds | Bit-identical spectra & decisions; else admission authority blocked (release blocker) |

Identifiability-boundary control across E1/E2: at λ = 0.9×MDE, confident admission must be rare (power-consistent), never an "admit with CI" — tests the honesty rule G2.

---

## 6. Risks

- **Meta-overfitting to generators.** Frozen validation grid, red-team generator, adversarial backlog; policy changes require re-run on the frozen grid.
- **Tuning leakage (the committee itself as leak path).** Pre-registration of every experiment; calibration/validation grid split; all tuning on calibration only.
- **ABSTAIN over/under-use.** Guarded by E8; abstain-laundering guard (G3/§3.9 attempt aggregation).
- **WASM numeric drift breaking authority.** E13 release gate; fixed reduction order; counter-based PRNG; seeds in ledger.
- **Correlated candidates double-counting.** maxT with coupled nulls; novelty gate H4.
- **Compositional zero-handling dominating conclusions.** Mandatory sensitivity grid; disagreement ⇒ abstain (E9).
- **d_eff misuse as a quality score** (dimension ≠ worth). Governing criterion G4/§4.3 note.
- **Small-n post-selection inference is weak; validated tier will be sparse.** Accepted product consequence; provisional tier exists but is firewalled from reported metrics.
- **Goodhart risk:** optimizing retrieval on admitted representations makes downstream metrics game the gate; the contamination ledger keeps reported numbers selection-clean.

---

## 7. Prior art to verify (with the specific thing to verify)

- **RMT thresholds & finite-n:** Marchenko–Pastur; BBP (2005) — exact visible-spike condition λ > 1+√γ; Johnstone (2001) Tracy–Widom; **finite-n adequacy for n<100** (verify via MC, not citation). BBP de-biasing plus-branch formula — verify against literature.
- **Optimal thresholds/shrinkage:** Gavish–Donoho (2014) hard/soft thresholds — verify exact constants per aspect ratio; Donoho–Gavish–Johnstone (2013); Ledoit–Wolf nonlinear shrinkage.
- **Rank/factor-count testing:** Bai–Ng (2002); Onatski (2009/2010); Ahn–Horenstein (2013) ER/GR; **Trapani (2016) randomization test** — closest prior art to our permutation-first design; Dobriban permutation factor selection — verify existence/details; parallel analysis (Horn 1965; Buja–Eyuboglu 1992; Glorfeld 1995 for high-percentile variants).
- **Stability selection:** Meinshausen–Bühlmann (2010); **Shah–Samworth (2013) complementary pairs** (small-n validity); Nogueira et al. (2018) stability metrics.
- **Post-selection:** Wasserman–Roeder screen&clean; Meinshausen–Meier–Bühlmann multi-split; Taylor–Tibshirani selective inference (polyhedral); debiased/desparsified lasso (van de Geer; Zhang–Zhang; Javanmard–Montanari); **Goeman–Solari (2011) selective confidence for selected sets** — best fit for "admitted-set" guarantees; selective inference for PCA/eigenvalues — verify current state; model-X/fixed-X knockoffs — small-n feasibility caveat.
- **Effective number of tests:** Cheverud (2001); Nyholt (2004); Li & Ji (2005); simpleM (Gao et al. 2008) — verify mapping formulas.
- **Dependence measures:** Székely–Rizzo–Bakirov distance correlation + small-sample bias correction; HSIC; KSG MI bias at small n; Kinney–Atwal critique of MIC.
- **Intrinsic dimension:** Levina–Bickel (2004); TwoNN (Facco 2017); DANCo; Ansuini et al. (2019); Pope et al. (2021); noise-robust ID (Tempczyk et al. 2022 and successors) — verify which survive ambient noise.
- **Neuroscience d_eff practice (transferable):** Gao & Ganguli dimensionality measures; split-half "noise ceiling"/reliability methods — a transferable triangulation idea.
- **Compositional:** Aitchison (1986); Pearson (1896) spurious correlation; Martín-Fernández zero replacement; Gloor et al. (2017) microbiome practice; Aitchison log-contrast PCA.
- **Conformal/ABSTAIN:** split conformal (Vovk); jackknife+ (Barber 2021) — verify small-n behavior; conformal risk control & Learn-then-Test (Angelopoulos); Chow (1970) reject option; El-Yaniv–Wiener selective classification.
- **CV-based rank selection:** Wold cross-validation in PCA/PLS; Bro et al. (2008) critical review — verify; clustering-stability caveats (von Luxburg 2010; prediction strength, Tibshirani 2005) as precedents for stability-gate pitfalls.
- **Randomized numerics:** Hutchinson (1989); Halko–Martinsson–Tropp (2011); sketch-based spectral detection — verify spike-attenuation results for projections.
- **Internal (verify against main, do not assume):** PT9 draft scope; Moneta admission spec; existing evidence-admissibility and ABSTAIN rules; the one-forward-PR rule's definition of "forward"; whether any calibration/benchmark harness already exists.

---

## 8. Recommended next engineering decision (single forward PR)

**Build and merge "Moneta-Admission Calibration Harness v0"** — the instrument that adjudicates every rival approach above — containing exactly:

1. Scale-contract type system + deterministic preprocessors (§4.1).
2. NS-ED v0 (§4.2) with triangulated noise floor, step-down edge tests, BBP de-biasing, subsample CIs, flags.
3. Gate v0 with MDE-first ABSTAIN ladder, provisional/validated tiers, certificate schema, contamination ledger (§4.3–4.5).
4. Benchmark generators B1 (spiked covariance, Gaussian/heavy-tailed), B3 (compositional), B4 (mixed-scale copula), B5 (clustered/batch adversarial nulls), all seeded and pinned; **explicit negative and boundary controls**.
5. Pre-registered acceptance = E1, E3, E4, E5, E8, E9, E13 pass on the frozen validation grid; runtime report E12 to inform whether sketching is needed later.

**Explicit non-goals for this PR:** portfolio maxT (second PR, after the harness exists to calibrate it), polyhedral selective inference, full-conformal, sketching, Bayesian rank.

**Go/no-go rule:** if any pre-registered acceptance test fails, the failure is returned to committee with data; no silent re-tuning; the one-forward-PR rule applies to the fix cycle.

**Meta-falsifiers for this report:** (i) E3 passing for raw Pearson ⇒ the scale layer is deleted as unnecessary; (ii) E2 sketch gap > .02 ⇒ sketches demoted permanently to screening; (iii) E8 failure ⇒ abstention architecture redesigned; (iv) E6 full policy failing ⇒ confirmation gate strengthened or removed; (v) Big Five/Iris systematic misses ⇒ NS-ED core suspect. The committee's recommendations carry exactly the same epistemic status as the candidates they evaluate: **claims with kill conditions — nothing more**.