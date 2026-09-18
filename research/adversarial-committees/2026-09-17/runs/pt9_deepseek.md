Committee report — PT9/Full Moneta prerequisites  
Scope: adversarial research, no source edits or PRs. This assumes current main has no candidate-specific admission policy; verify in-repo. Authority remains the deterministic Rust/WASM analytical core. ABSTAIN is a first-class admissible outcome. The next implementation step must fit the one-forward-implementation-PR rule. Model consensus is not authority.

## 1. Problem

For each candidate representation \(c\), small-\(n\)/high-\(p\) selection cannot use nominal \(p_c\), variance-explained scree, or model-vote consensus. A candidate must expose a manifest:

\[
c = (\phi_c,\ \text{scale}_c,\ T_c,\ P_c,\ \text{null}_c,\ L_c,\ d_{\max},\ \text{cost})
\]

where \(\phi_c\) is the feature map, \(T_c\) the scale-aware transform, \(P_c\) the admissible perturbation family, \(L_c\) the downstream loss, and \(\text{null}_c\) the null model.

Define candidate-specific effective dimensionality as a decision-theoretic interval, not a scalar property of \(X\):

\[
D_{\text{eff}}(c;D,Y,L,P_c,\alpha)
=
\min\{d:\exists S_c,\ \dim S_c\le d,\ \text{s.t.}
\ R(D,Y,L,S_c)\approx R_d^*,\ 
\ S_c \text{ stable under } P_c,\ 
\ \text{signal null-calibrated at }\alpha\}.
\]

The practical output is \([D_{\text{lo}},D_{\text{hi}}]\) plus stability and calibration evidence. If the interval is wide, crosses a decision boundary, or depends on undeclared scale choices, the policy must ABSTAIN.

## 2. Governing criteria

1. Measurement conformance: declared scale and transform must match data type.
2. Identifiability: covariance/eigenstructure must not depend on arbitrary units or raw simplex geometry.
3. Null calibration: false admission under the candidate-specific null must be controlled.
4. Perturbation stability: D_eff and selected subspace must survive pre-registered perturbations.
5. Post-selection validity: downstream inference must account for candidate/dimension selection.
6. Calibration: coverage and abstention risk must be verified on known-structure benchmarks.
7. Reproducibility: Rust/WASM decisions must be deterministic given seed, artifacts, and version hashes.
8. Evidence admissibility: confirmatory claims require all above; otherwise label exploratory or ABSTAIN.

## 3. Competing approaches

| Approach | Useful part | Fatal flaw alone |
|---|---|---|
| Nominal \(p\), scree, variance explained | Simple baseline | Invalid under \(p>n\), scale-dependent, no post-selection control |
| RMT / parallel analysis | Null-calibrated eigenvalue threshold | Gaussian/iid assumptions; weak under compositional/mixed scales |
| Stability selection / bootstrap PCA | Robust support and subspace stability | Threshold-sensitive, computational, can be conservative |
| Bayesian shrinkage / horseshoe / ARD | Principled dimension shrinkage | Prior sensitivity, MCMC cost in WASM, calibration still required |
| Intrinsic dimension estimators: TwoNN, MLE, DANCo | Geometry-aware dimension | Not task-specific, noise/scale-sensitive, no inference |
| Cross-fitting / conformal / selective inference | Valid post-selection or calibrated abstention | Small-\(n\) cost, exchangeability assumptions |
| Knockoffs | FDR control | Requires covariate distribution/exchangeability; hard with \(p>n\) |
| Compositional CoDA: CLR/ILR, ALDEx2, ANCOM-BC | Correct simplex geometry | Zeros, basis sensitivity, model assumptions |
| ABSTAIN-only | Safe under insufficient evidence | Zero utility |

## 4. Strongest counterarguments

- D_eff is not unique. It depends on task, loss, perturbation family, noise model, and decision threshold. Any universal scalar is a policy artifact.
- Small \(n\) makes stability estimates noisy. A strict stability gate may force ABSTAIN almost always; a loose gate may admit noise.
- Post-selection inference is impossible without independent data or strong assumptions. Cross-fitting may not rescue \(n=10\).
- Compositional ILR is not a free fix: zeros require replacement, and basis choice can change apparent dimension.
- Candidates can game admission by declaring weak perturbations or favorable transforms. Perturbation suites and scale transforms must be pre-registered by data type, not chosen by the candidate.
- RMT nulls are often Gaussian; real high-dimensional data are correlated, heteroskedastic, and structured.
- Multiple candidate testing inflates false admissions unless family-wise or FDR control is explicit.
- Calibration benchmarks may not transfer to deployment. Distribution shift is a first-class risk.
- Model consensus is not authority. No LLM or committee vote may override Rust/WASM analytical gates.

## 5. Proposed policy: CEDSG

Candidate Effective Dimension and Stability Gate.

### 5.1 Manifest validation

Reject or ABSTAIN if any of these are missing:

- scale type per feature: interval, ordinal, count, compositional, mixed;
- admissible transform \(T_c\);
- perturbation family \(P_c\), pre-registered by scale type;
- null model \(\text{null}_c\);
- zero policy for compositional data;
- downstream loss and decision threshold;
- cost and maximum admissible dimension.

### 5.2 Scale-aware transform

- Interval: standardize or whiten by measurement error. Raw units make eigenvalues unidentifiable.
- Ordinal: rank/copula or polychoric-style latent Gaussian transform. Raw Likert PCA is inadmissible.
- Counts: variance-stabilizing transform or Pearson/deviance residuals. Raw counts are mean-variance dominated.
- Compositional: ILR or CLR on Aitchison geometry. If zero rate exceeds \(z_{\max}\) and no justified zero model exists, ABSTAIN. Check ILR basis sensitivity.
- Mixed: Gaussian copula or optimal scaling with declared marginals. If D_eff flips across plausible transforms, ABSTAIN.

### 5.3 Null-calibrated D_eff

For each candidate:

1. Compute transformed features \(Z_c\).
2. Estimate covariance with shrinkage or robust rank covariance.
3. Generate \(B\) null replicates under \(\text{null}_c\).
4. Threshold eigenvalues by the null quantile at level \(1-\alpha\), e.g. parallel analysis or RMT.
5. Compute \(D_{\text{hi}}\) as the number of eigenvalues above the null envelope.
6. Report effective-rank summaries: participation ratio, entropy effective rank, stable rank.
7. For supervised tasks, use stability selection, sparse PCA, or PLS with null-calibrated component importance.

### 5.4 Perturbation stability audit

Pre-registered perturbations per scale:

- row bootstrap, subsample, jackknife;
- feature dropout, additive noise, rounding;
- count/Poisson/NB resampling;
- compositional Dirichlet/multinomial resampling and zero replacement;
- graph edge dropout, time-series block bootstrap;
- seed and hyperparameter perturbation.

Metrics:

- \(D_{\text{eff}}\) quantiles and IQR;
- principal angles between top-\(k\) eigenspaces;
- Jaccard overlap of selected support;
- score correlation on shared rows;
- fraction of replicates making the same ADMIT/ABSTAIN decision.

### 5.5 Admission rule

ADMIT candidate \(c\) only if all hold:

\[
\begin{aligned}
&\text{manifest valid},\\
&\text{scale/transform sensitivity} \le \varepsilon,\\
&\text{compositional zero policy} \le z_{\max},\\
&\text{null false-admission probability} \le \alpha,\\
&\text{stability lower bound} \ge \tau_{\text{cal}},\\
&n \ge n_{\min}(D_{\text{hi}},c),\\
&\text{post-selection inference valid},\\
&\text{calibration coverage} \ge 1-\alpha.
\end{aligned}
\]

Otherwise ABSTAIN, with reason codes: MANIFEST_INVALID, SCALE_INVALID, NULL_FAIL, UNSTABLE, POST_SELECTION_INVALID, CALIBRATION_FAIL, ZERO_RATE_HIGH, BASIS_UNSTABLE, N_TOO_SMALL, AMBIGUOUS.

### 5.6 High-dimensional admission

- If \(p_c>n\), require sparsity, low-rank structure, or a declared structured prior. Otherwise ABSTAIN.
- If selected support \(s>n/\log p\), ABSTAIN for confirmatory use.
- If \(D_{\text{hi}}>n/2\), ABSTAIN for confirmatory use.
- Use an \(n_{\min}\) table calibrated on known-structure benchmarks. If \(n<n_{\min}\), ABSTAIN.

### 5.7 Post-selection inference

Confirmatory claims require one of:

- independent selection and inference sets;
- cross-fitting: select on \(D_{-k}\), infer on \(D_k\), aggregate;
- selective inference conditional on the selection event;
- simultaneous confidence intervals for all candidates.

If none is feasible, label exploratory and do not grant confirmatory authority.

### 5.8 Calibration and abstention

- Split calibration data from test data. Never tune thresholds on test.
- Use conformal risk control or quantile calibration to choose admission and abstention thresholds.
- Verify selective risk: error rate among admitted candidates must be \(\le \alpha\).
- ABSTAIN is required when calibration coverage, stability, or post-selection validity fails.

## 6. Decisive experiments and falsifiers

| Experiment | Design | Metric | Falsifier |
|---|---|---|---|
| Null calibration | B null datasets across \(n,p\), scale types | False admission rate | \(>\alpha+\) MC error |
| D_eff recovery | Planted factor rank \(r\), SNR grid | Coverage, bias, RMSE | Coverage \(<1-\alpha\) or bias \(>1\) at high SNR |
| Compositional zeros | Dirichlet with zero rate, replacement variations | D_eff stability, admission flips | Admission flips under \(<10\%\) zeros |
| Scale sensitivity | Monotone transforms, raw vs ILR/VST/copula | Admission agreement | Flips across declared admissible scales |
| Perturbation stability | Bootstrap, dropout, outliers, missingness | Subspace angle, D_eff IQR | Cannot separate signal from noise |
| Post-selection coverage | Selection on noise, known true effect | CI coverage | \(<90\%\) for nominal \(95\%\) |
| Small-\(n\) boundary | \(n=10,20,50,100\); \(p=100,1000\) | \(n_{\min}\) table | Admits high D_eff below \(n_{\min}\) |
| ABSTAIN utility | Risk-coverage curves | Abstain on null, power on strong signal | 100% abstain or 0% abstain on null |
| WASM reproducibility | Same seed across platforms/versions | Admission/decision hash | Admission flips under tolerance |
| Adversarial manifest | Candidate declares weak perturbation | False admission | Gate passes obviously noisy candidate |

## 7. Known-structure benchmarks

Synthetic generators:

- `null_iid(n,p)`: no signal.
- `null_ar1(n,p,rho)`: correlated null.
- `planted_factor(n,p,r,snr)`: known rank.
- `sparse_pca(n,p,s,snr)`: known support.
- `compositional_dirichlet(n,p,alpha,zero_rate)`: simplex with zeros.
- `mixed_scale(n,p,r)`: latent Gaussian factors discretized into ordinal/count/compositional.
- `post_selection(n,p,true_effect)`: selection on noise or weak signal.
- `perturbation(n,p,outlier_rate,missing_rate)`.

Metrics: false admission, power, D_eff interval coverage, subspace stability, post-selection CI coverage, abstention rate, risk-coverage AUC.

Real known-structure data, if available: spike-in microbiome, certified reference materials, gene-expression pathways with known spike-ins. If unavailable, synthetic benchmarks are mandatory.

## 8. Risks

- Overfitting thresholds to synthetic benchmarks.
- Bootstrap cost and nondeterminism in WASM.
- Undeclared or incorrect measurement metadata.
- Compositional zero replacement and ILR basis sensitivity.
- Multiple-testing inflation across candidates.
- Small-\(n\) instability making ABSTAIN dominate.
- Post-selection inference unavailable in realistic \(n\).
- Distribution shift invalidating calibration.
- Adversarial candidate manifests.
- One-forward-implementation-PR rule makes monolithic implementation unacceptable; stage minimally.

## 9. Prior art to verify in current main

- Effective rank: Roy–Vetterli, stable rank, participation ratio, entropy effective rank.
- RMT: Marchenko–Pastur, Tracy–Widom, parallel analysis, Gavish–Donoho optimal hard threshold.
- Shrinkage: Ledoit–Wolf covariance.
- Sparse PCA: Witten et al., PMA, sparse Bayesian factor analysis.
- Bayesian: horseshoe, ARD, Dirichlet process factor models.
- Stability: Meinshausen–Bühlmann stability selection, bootstrap PCA, consensus clustering.
- Post-selection: Berk et al., Lee et al., Taylor–Tibshirani, Fithian et al., Chernozhukov et al. cross-fitting, Wasserman–Roeder splitting.
- FDR: Benjamini–Hochberg, knockoffs.
- Compositional: Aitchison, Egozcue et al., zCompositions, ALDEx2, ANCOM-BC, SparCC.
- Conformal/abstention: Vovk et al., conformal risk control, Chow reject option, selective classification.
- Intrinsic dimension: Levina–Bickel, TwoNN, DANCo.

## 10. Recommended next engineering decision

Adopt CEDSG as the PT9/Full Moneta analytical policy, but implement it conservatively.

Next single forward implementation PR:

1. Add a candidate manifest schema and validator.
2. Add a deterministic Rust/WASM admission gate that defaults to ABSTAIN unless a versioned calibration table explicitly says ADMIT for the exact candidate family, \(n,p\), scale type, and zero-rate bucket.
3. Add a benchmark harness for Null-IID, Planted-Factor, Compositional-Zero, and Mixed-Scale.
4. Add evidence artifacts: seeds, thresholds, data/transform hashes, calibration version, ABSTAIN reason codes.

Do not implement the full D_eff estimator in that PR. The gate can consume precomputed calibration evidence. If held-out calibration fails to achieve false admission \(\le \alpha\), D_eff coverage \(\ge 1-\alpha\), post-selection coverage \(\ge 1-\alpha\), and useful abstention risk-coverage, then retain ABSTAIN-only for confirmatory PT9/Full Moneta and permit exploratory use only.