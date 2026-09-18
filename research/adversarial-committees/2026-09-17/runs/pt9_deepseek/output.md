**Committee stance:** For PT9/Full Moneta prerequisites, the prerequisite is not “an effective dimensionality estimator.” It is a candidate-specific, calibrated, auditable decision object: `ADMIT / REJECT / ABSTAIN`, with explicit transform, null model, stability protocol, and post-selection discipline. Model consensus is not authority; only reproducible Rust/WASM-computed evidence counts.

## 1. Problem

Given small `n`, high `p`, and a set of candidate representations `c = 1..C`, decide for each candidate whether it is admissible for downstream high-dimensional analysis or inference. Each candidate has its own measurement scale, compositional structure, noise regime, and stability properties. A single global `d_eff` is scientifically indefensible.

**Claims to distinguish:**
- **Observation:** eigenvalue spectrum, participation ratio, parallel-analysis count, bootstrap stability.
- **Claim:** candidate `c` has effective dimensionality `d_eff(c)` under transform `T`, null model `N`, and loss `L`.
- **Governing criterion:** pre-registered thresholds, calibration targets, admissibility rules.

The policy must handle:
- mixed measurement scales,
- compositional data,
- post-selection inference,
- perturbation stability,
- calibration under null and known structure,
- ABSTAIN as a first-class outcome,
- Rust/WASM analytical authority,
- one-forward-implementation-PR rule.

## 2. Competing approaches

1. **Spectral thresholding:** Marchenko-Pastur, Tracy-Widom, parallel analysis. Strong for i.i.d. Gaussian noise; weak for compositional, mixed-scale, heavy-tailed, nonlinear structure.
2. **Continuous effective-rank metrics:** participation ratio, stable rank, entropy of eigenvalues. Cheap and deterministic; not a dimensionality count; scale-sensitive.
3. **Latent-variable models:** factor analysis, sparse PCA, ICA. Interpretable when model assumptions hold; unstable in small `n/high p`; selection post-hoc.
4. **Sparsity-based admission:** lasso/elastic-net stability selection, knockoffs. Directly targets high-dimensional inference; requires assumptions and calibration.
5. **Perturbation consensus:** bootstrap/subsampling stability. Model-light; can be gamed by perturbation choice; needs null adjustment.
6. **Conformal/permutation calibration:** distribution-free; computationally expensive; must match measurement scale and composition.
7. **Sample-splitting/post-selection correction:** necessary for honest inference; reduces power in small `n`; often forces ABSTAIN.

## 3. Strongest counterarguments

- **“Effective dimensionality is not identifiable without a model.”** Correct. Therefore every `d_eff` claim must be conditional on `(T, N, L)`. Any unconditional number is inadmissible.
- **“Stability is not validity.”** A stable wrong estimate remains wrong. Stability must be paired with known-structure benchmarks and null calibration.
- **“Calibration null may be misspecified.”** Real noise is rarely permutation exchangeable. Use multiple nulls: permutation, parametric, negative-control, and measurement-error perturbation.
- **“ABSTAIN will dominate.”** In small `n/high p`, that is often correct. Over-admission is worse for Moneta evidence admissibility than frequent ABSTAIN.
- **“One-forward-implementation-PR rule blocks iteration.”** It blocks uncontrolled drift. Implement one minimal core PR, then freeze and falsify before extension.
- **“Rust/WASM guarantees reproducibility.”** Only with deterministic PRNG, fixed reduction order, versioned transforms, and hashed evidence bundles. Floating-point non-associativity is a real risk.

## 4. Proposed algorithms/designs

### 4.1 Candidate-specific transform layer

For candidate `c`, input `X_c` (`n × p`) plus metadata: scale types, compositional flag, zero policy, allowed transforms.

- **Continuous:** robust standardization; optionally rank-based Gaussian copula if monotone invariance is required.
- **Ordinal:** rank transform or monotone spline basis; never treat as interval without justification.
- **Counts:** variance-stabilizing transform (`log1p`, Anscombe) with sensitivity check.
- **Compositional:** use ILR coordinates with an orthonormal basis. Raw proportions are rejected unless a pre-registered justification exists. Zeros require a zero-replacement model; if zeros are present and no admissible model is pre-registered, return ABSTAIN.
- **Mixed:** apply per-variable admissible transform, then whiten. Report sensitivity to transform choice.

Record `T_c`, its parameters, code hash, and transform hash in the evidence bundle.

### 4.2 Effective dimensionality estimators

For transformed `Z = T_c(X)`, center and scale, compute covariance eigenvalues `λ_1 ≥ ... ≥ λ_m`.

Candidate-specific tuple:
- **`k_par`:** parallel-analysis integer. For `B` nulls, permute each column independently, compute eigenvalues, `k_par = max{k : λ_k > q_{1-α}(λ_k^null)}`. For compositional data, permute ILR coordinates independently, then back-transform to the simplex to preserve compositional geometry.
- **`d_pr`:** participation ratio `(Σλ)^2 / Σλ^2`. Null-calibrated p-value.
- **`d_sr`:** stable rank `(Σλ) / λ_max`. Null-calibrated p-value.
- **`s_eff`:** sparse effective support via stability selection on sparse PCA or regularized regression, if a supervised target exists. Report selection probabilities, not just support.
- **Interval:** bootstrap/subsample interval for each estimator.

Do not collapse to one number. Admit only if the tuple is coherent under the governing criteria.

### 4.3 Perturbation stability

Perturbation set `Π` must be pre-registered:
- row bootstrap (`B ≥ 1000`),
- subsampling at `0.8n`,
- additive noise at `σ = 0.1 × median within-feature SD`,
- monotone transforms (`rank`, `log` for positive),
- ILR basis rotation for compositional candidates,
- zero-replacement sensitivity.

For each `π ∈ Π`, compute `k_par(π)`, `d_pr(π)`, and admission decision `A(π)`.

Stability scores:
- `S_dim = fraction of π where |k_par(π) - median(k_par)| ≤ 1`
- `S_adm = fraction of π where A(π) = A(full)`
- `S_adj = (S - S_null) / (1 - S_null)` where `S_null` is stability under matched null data.

Admission requires `S_adj ≥ τ_S` and interval width `≤ τ_W`. Provisional: `τ_S = 0.8`, `τ_W = 2`; these must be calibrated on known-structure benchmarks, not asserted.

### 4.4 Calibration

For each candidate, generate `B_null` null datasets matched to `n`, `p`, marginal distributions, scale types, and compositional structure:
- continuous: independent column permutation,
- compositional: independent ILR-coordinate permutation then back-transform,
- mixed: within-variable permutation,
- counts: parametric negative-binomial or permutation null.

Compute null distributions of `d_pr`, `d_sr`, `k_par`, `S_dim`, `S_adm`. Candidate-specific p-values:
`p_c = (1 + #{null ≥ observed}) / (B_null + 1)`.

Across candidates, apply Benjamini-Hochberg at `α = 0.05` to control FDR. Also calibrate thresholds on known-structure synthetic benchmarks to achieve target power `1-β ≥ 0.8`.

### 4.5 Admission/ABSTAIN decision rule

For candidate `c`:

1. If transform invalid, zeros unhandled, or pre-registration missing: **REJECT** or **ABSTAIN**.
2. If null-calibrated p-values for `d_pr`, `d_sr`, and `k_par` all fail at `α`: **REJECT**.
3. If sample-split validation fails: **REJECT**.
4. Compute `S_adj`. If `S_adj < τ_S` or interval width `> τ_W`: **ABSTAIN**.
5. High-dimensional admissibility: `n_eff = n × S_adj`. Require `n_eff ≥ c × k_hi × log(p / k_hi)`. If not: **ABSTAIN**.
6. If all pass: **ADMIT for exploratory analysis**. For confirmatory inference, require independent selection or selection-adjusted p-values; otherwise **ABSTAIN**.
7. Default outcome: **ABSTAIN**.

The constant `c` is not authority; it is calibrated on benchmarks to meet FDR and power targets.

### 4.6 Post-selection inference

- Split data deterministically by hash into `D_sel` and `D_inf` (e.g., 50/50).
- Estimate transform, `k_par`, and thresholds on `D_sel`.
- Validate on `D_inf`: held-out reconstruction error, predictive performance, and eigenvalue-spectrum consistency.
- If selection and inference must use the same data, report selection-adjusted p-values or data-carved inference. If neither is available, **ABSTAIN** for confirmatory claims.
- Candidate ranking for selection must use only `D_sel`; final evidence must come from `D_inf`.

### 4.7 Rust/WASM analytical authority

All final numbers must be computed in Rust compiled to WASM:
- fixed PRNG (`ChaCha20` or similar),
- deterministic reduction order (pairwise/Kahan),
- no external Python/JS for authoritative results,
- evidence bundle: code hash, WASM hash, input hash, transform hash, seeds, `B`, `B_null`, thresholds, `ADMIT/REJECT/ABSTAIN`, reasons.
- Model consensus never enters the decision loop.

## 5. Decisive experiments/falsifiers

| Experiment | Known structure | Expected | Decisive falsifier |
|---|---|---|---|
| Null i.i.d. | `n=50`, `p=500`, Gaussian | `k_par=0`, `d_pr≈n`, no admission | False admission > 5% |
| Low-rank factor | `n=50`, `p=500`, `k∈{1,3,5,10}` | Recover `k` ±1 in 90% when `n > c k log(p/k)` | Failure to recover `k≥5` |
| Sparse PCA | `p=1000`, `s=10`, `k=3` | Support Jaccard > 0.8 | Support instability > 20% |
| Compositional | `p=20`, ILR rank `k=3` | Raw proportions rejected; ILR recovers `k` | Raw proportions admitted or ILR fails |
| Mixed scales | continuous + ordinal + counts | Transform-aware recovers `k`; raw standardization fails under monotone transforms | Raw method passes |
| Nonlinear manifold | Swiss roll, intrinsic `d=2`, ambient `p=100` | `k_eff≈2` | Method admits `d=100` |
| Stability | bootstrap/noise | True signal `S_adj>0.8`; null `<0.5` | Null stability > signal stability |
| Post-selection | sample split | Held-out validation fails under same-data selection | Selection-adjusted Type I error > α |

These are falsifiers, not demonstrations. If the proposed policy fails a row, it is falsified for that regime.

## 6. Risks

- **Overfitting to benchmark:** use adversarial holdout and negative controls.
- **Scale dependence:** effective dimensionality is not scale-invariant; transform must be explicit and audited.
- **Compositional zero handling:** can create artificial structure; ABSTAIN when unverifiable.
- **Null misspecification:** single permutation null is insufficient; require multiple nulls.
- **Post-selection leakage:** small `n` makes sample splitting costly; ABSTAIN is preferable to hidden inflation.
- **Stability gaming:** perturbation set must be pre-registered and null-adjusted.
- **Rust/WASM floating-point drift:** deterministic order and hashes are mandatory.
- **ABSTAIN abuse:** track ABSTAIN rates; high rates may indicate policy failure, not scientific safety.
- **One-forward-implementation-PR violation:** resist adding auxiliary estimators before the core is falsified.

## 7. Prior art to verify

- Effective rank: Roy & Vetterli; stable rank: Rudelson & Vershynin; participation ratio literature.
- Parallel analysis: Horn (1965); Marchenko-Pastur; Tracy-Widom.
- Factor models: Bai & Ng; Onatski.
- Sparse PCA: Zou et al.; d’Aspremont et al.
- Knockoffs: Barber & Candès.
- Stability selection: Meinshausen & Bühlmann.
- Selective inference: Lee et al.; Taylor & Tibshirani; Fithian et al.
- Compositional data: Aitchison; Egozcue et al. (ILR); Martín-Fernández et al. (zero replacement).
- Conformal prediction: Vovk, Shafer.
- Small-`n` high-`p`: Bühlmann & van de Geer; Wainwright.
- Intrinsic dimension: Levina & Bickel; Facco et al. (TwoNN).
- Negative controls: Lipsitch et al.
- Bootstrap/subsampling: Efron; Politis & Romano.

Verify current main for existing implementations before writing new code. If any exist, audit them against these criteria.

## 8. Recommended next engineering decision

Adopt a three-outcome, candidate-specific policy: **ADMIT / REJECT / ABSTAIN**, with ABSTAIN as default. Do not integrate confirmatory inference until calibration benchmarks pass.

**Next one-forward-implementation-PR:**
Implement one Rust/WASM module, `nemosyne_effdim`, that:
1. accepts candidate matrix plus metadata,
2. applies admissible transform (rank/standardization, ILR with zero policy),
3. computes parallel analysis, participation ratio, stable rank, and sparse support,
4. runs pre-registered perturbations and matched null calibrations,
5. emits a hashed evidence bundle with `ADMIT/REJECT/ABSTAIN` and reasons.

No other changes in that PR. Gate the module behind the known-structure benchmark suite. Until it passes, all outputs are exploratory, and confirmatory claims must ABSTAIN.