# Adversarial Feasibility Review: Nemosyne Data Laboratory Architecture

**Date:** 2026-09-18  
**Target:** `lab/LABORATORY_ARCHITECTURE.md`  
**Review posture:** hostile-but-constructive architecture review with prior-art comparison.

## Overall adjudication

**FEASIBLE WITH MATERIAL DESIGN CONDITIONS.**

No reviewed subsystem requires a speculative computer-science breakthrough. Portable experiment runners, immutable evidence manifests, benchmark/oracle separation, deterministic perturbation campaigns, multi-objective evolutionary search, quality-diversity search, declarative visualization grammars, constraint-based visualization recommendation, XR simulation, semantic zoom and post-selection validation all have substantial prior art.

The novel and difficult part is their integration around a dataset-first, Rust/WASM-authoritative semantic representation grammar in immersive analytics. Feasibility therefore depends less on whether the components can be built and more on whether the project prevents three failure modes:

1. an unconstrained representation genome whose search space explodes;
2. circular evaluation in which Moneta evolves representations against metrics derived from the same assumptions that generated them;
3. conflation of visual richness with additional semantic information.

The architecture should proceed, but EVO implementation should remain gated behind a small typed semantic grammar, independent holdout evidence, and explicit diversity/complexity controls.

## Prior-art findings

### Declarative representation/compiler architecture

Vega-Lite demonstrates that a high-level declarative grammar can compile compositional visualization and interaction specifications into lower-level rendering/dataflow. This supports the proposed separation between semantic representation and spatial embodiment, although Vega-Lite is primarily 2D/chart-oriented and does not solve dataset-semantic authority or immersive representation.

**Implication:** prefer a bounded typed grammar and compiler over generated executable rendering code.

Reference: Satyanarayan et al., *Vega-Lite: A Grammar of Interactive Graphics*, IEEE TVCG 2017, DOI 10.1109/TVCG.2016.2599030.

### Constraint-based visualization recommendation

Draco formalizes visualization knowledge as hard/soft constraints and can learn soft-constraint weights from empirical studies. This is highly relevant to Moneta's admissibility-before-optimization model.

**Implication:** analytical truth, semantic admissibility, measurement-scale constraints and XR safety should be hard constraints. Learned/evolutionary preferences should operate only inside the feasible set.

Reference: Moritz et al., *Formalizing Visualization Design Knowledge as Constraints: Actionable and Extensible Models in Draco*, IEEE TVCG 2019, DOI 10.1109/TVCG.2018.2865240.

### Multi-objective evolutionary search

NSGA-II establishes a mature approach to maintaining a Pareto set rather than collapsing conflicting objectives into one score.

**Implication:** the architecture's initial preference for independent axes/Pareto frontiers is well founded. Do not prematurely invent a universal weighted fitness scalar.

Reference: Deb et al., *A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II*, IEEE Transactions on Evolutionary Computation 2002, DOI 10.1109/4235.996017.

### Quality-diversity / MAP-Elites

Quality-diversity research, including MAP-Elites, explicitly searches for diverse high-performing solutions across behavioral/feature niches rather than a single optimum.

**Implication:** Moneta may benefit more from a repertoire indexed by dataset semantics, task, compute budget and interaction conditions than from one evolutionary champion. This also maps naturally to rejected alternatives and "roads not taken."

Reference: Pugh, Soros & Stanley, *Quality Diversity: A New Frontier for Evolutionary Computation*, Frontiers in Robotics and AI 2016, DOI 10.3389/frobt.2016.00040; related MAP-Elites literature cited therein.

### Adaptive analysis / post-selection inference

The architecture correctly identifies a severe statistical problem: repeatedly evolving candidates and judging them on the same corpus overfits the benchmark. Post-selection inference literature and reusable-holdout work show that adaptively chosen analyses require special validation discipline.

**Implication:** evolutionary search evidence and confirmatory evidence must be separated. Maintain sealed holdouts/new seeds/new corpora and, for inferential claims, pre-specify sample splitting/selective/conformal or other justified calibration.

References: Kuchibhotla et al., *Post-Selection Inference*, Annual Review of Statistics and Its Application 2022, DOI 10.1146/annurev-statistics-100421-044639; Dwork et al., *The reusable holdout*, Science 2015, DOI 10.1126/science.aaa9375.

### Semantic zoom / multiscale information spaces

Pad++ demonstrated zoomable information spaces and an "informational physics" approach in which persistent information objects can change presentation with scale.

**Implication:** dataset -> region -> substructure -> observation transitions have conceptual precedent, but Moneta's version should be evidence/identity-governed rather than merely view-scale governed.

Reference: Bederson et al., *Pad++: A Zoomable Graphical Sketchpad for Exploring Alternate Interface Physics*, Journal of Visual Languages & Computing 1996, DOI 10.1006/jvlc.1996.0002.

### Immersive analytics

Immersive-analytics research explicitly treats spatial metaphor choice, human-machine analytical cooperation and empirical validation of immersive utility as open research questions. Surveys report both growing evidence and unresolved challenges around abstract 3D visualization, interaction and evaluation.

**Implication:** the laboratory is right to treat Quest/human evidence as a distinct qualification stage. The assumption that richer 3D embodiment improves analysis must itself remain falsifiable.

References: Skarbez et al., *Immersive Analytics: Theory and Research Agenda*, Frontiers in Robotics and AI 2019, DOI 10.3389/frobt.2019.00082; Kraus et al., *Immersive Analytics with Abstract 3D Visualizations: A Survey*, Computer Graphics Forum 2022, DOI 10.1111/cgf.14430.

## Red-team attacks

### A. Genome/search-space explosion — HIGH

If `RepresentationGenome` simultaneously evolves semantic hierarchy, geometry, encoding, interaction, transitions, detail policy and resource policy, the combinatorial space becomes enormous. Most candidates will be nonsensical and evaluation will dominate compute.

**Required mitigation:**
- typed grammar;
- staged grammar expansion;
- hard constraint solving before phenotype construction;
- grammar-aware mutation;
- bounded depth/node count;
- minimum-description-length/complexity pressure;
- quality-diversity niches rather than exhaustive global optimization;
- operator ablations.

### B. Benchmark overfitting / Goodhart's law — CRITICAL

Evolution will exploit whatever is measurable. Known-structure recovery, perturbation stability and runtime metrics can become targets rather than proxies. A representation can learn benchmark quirks without becoming useful to humans.

**Required mitigation:**
- discovery/training corpora separated from sealed qualification corpora;
- hidden seeds and structural families;
- benchmark-family holdout, not merely row holdout;
- periodic new-corpus generation;
- human/Quest qualification for human-facing claims;
- metric rotation only through preregistered protocol revisions, never during a run.

### C. Circular semantic fitness — CRITICAL

If the same analytical mechanism defines the semantic graph and then scores whether the representation preserved it, the system can certify its own assumptions.

**Required mitigation:**
- distinguish analytical authority from representation-quality evidence;
- independent generative or labeled oracles where available;
- task-based external outcomes;
- metamorphic relations;
- competing analytical views when scientifically justified;
- ABSTAIN where no independent criterion exists.

### D. "More detail = more meaning" — HIGH

The stickman-to-portrait metaphor is useful but dangerous. A richer phenotype can add pixels, geometry and apparent structure without increasing information about the dataset.

**Required mitigation:** define semantic gain as new evidence-backed propositions/relations/task affordances, not geometric complexity. Report visual fidelity separately.

### E. Evolutionary bloat — HIGH

Genetic search tends to accumulate neutral complexity when complexity is cheap.

**Required mitigation:** explicit complexity/resource objectives, parsimony pressure, dominance rules preventing semantically identical but more expensive phenotypes from appearing superior.

### F. Premature scalar fitness — HIGH

Combining truth retention, latency, memory, comfort, stability and task utility into one weighted number would hide value judgments and allow compensation of hard failures.

**Required mitigation:** hard gates + vector evidence + Pareto/QD selection. Scalarization only for explicitly scoped policies with sensitivity analysis.

### G. Search/evaluation cost dwarfs rendering cost — MEDIUM/HIGH

Compute-conditioned evolution may spend orders of magnitude more compute evaluating representations than users could ever justify interactively.

**Required mitigation:** separate offline learning budget from runtime inference budget. Measure amortization: how many future investigations must reuse an evolved policy before its search cost is defensible?

### H. Nonstationary hardware frontier — MEDIUM

A representation learned as "high-compute" on one machine may be cheap on another or pathological on a different GPU/VR runtime.

**Required mitigation:** model resource demand in normalized workload dimensions as well as machine-specific measurements. Treat hardware profile as context, not semantic identity.

### I. Simulator reality gap — HIGH for UX claims

IWER/synthetic XR can falsify lifecycle and race defects but cannot reliably predict comfort, discoverability, spatial comprehension or perceptual benefit.

**Required mitigation:** already present in architecture; preserve it. No simulator-to-human claim promotion.

### J. Statistical multiplicity — CRITICAL for scientific claims

Thousands of genomes × datasets × perturbations create enormous researcher degrees of freedom.

**Required mitigation:** evolutionary phase is exploratory. Confirmatory claims require frozen candidate(s), frozen protocol and independent evidence. Preserve every attempted lineage to expose selection history.

### K. Reproducibility of stochastic evolution — MEDIUM

Seeded replay may still diverge across runtimes, GPU kernels or parallel schedules.

**Required mitigation:** distinguish exact deterministic replay from statistical reproducibility. Hash all inputs, record environment, and define tolerances/distributional equivalence where bitwise replay is impossible.

### L. Rust/WASM authority can become a bottleneck — MEDIUM

Keeping analytical truth in one authority is architecturally clean, but evolutionary populations may issue huge repeated analytical requests.

**Required mitigation:** immutable content-addressed analytical evidence cache keyed by specimen/build + dataset fingerprint + request/protocol. Cache evidence, not conclusions from geometry.

### M. Semantic grammar may encode designer prejudice — HIGH

A typed grammar controls combinatorics but can make truly novel representations unreachable.

**Required mitigation:** grammar versions are experimental hypotheses. Track coverage/expressivity failures; permit governed grammar expansion; maintain an OUT-OF-GRAMMAR research state rather than forcing observations into existing types.

### N. Security of evolved/generated representations — MEDIUM now, CRITICAL if code generation appears

Declarative genomes are manageable. Evolving executable shaders/code/plugins radically changes the threat model.

**Required mitigation:** retain the architecture's prohibition on candidate-supplied executable code for early versions. Any future generated-code path needs sandboxing, capability restrictions and separate security review.

## Required architecture amendments before EVO-1

1. Add **Constraint/Admissibility Solver** between genome generation and phenotype compilation.
2. Add **Exploration vs Qualification split** with sealed holdout corpus/protocol.
3. Add **Semantic Gain Contract** distinguishing newly supported meaning from visual fidelity.
4. Add **Complexity/Bloat accounting** as an explicit objective/gate.
5. Add **Evidence Cache** keyed by immutable analytical request identity.
6. Add **QD/Repertoire option** alongside Pareto evolutionary selection.
7. Add **Grammar version/expressivity monitoring** and OUT-OF-GRAMMAR state.
8. Add **exact vs statistical reproducibility** distinction.
9. Add **offline search vs runtime deployment budgets** and amortization evidence.
10. Require **frozen-candidate independent confirmation** before any scientific/product promotion.

## Feasibility by subsystem

| Subsystem | Feasibility | Primary uncertainty |
|---|---|---|
| Portable experiment/evidence engine | High | engineering discipline |
| Specimen protocol | High | versioning/latency |
| Benchmark + perturbation system | High | oracle quality |
| Compute staircase | High | measurement rigor |
| XR simulator integration | High | reality gap |
| Dataset-first semantic grammar/compiler | Medium-High | expressivity without semantic leakage |
| Multi-objective evolutionary search | High technically | useful objective definitions |
| Semantic representation evolution | Medium | evaluation validity/search-space control |
| Compute -> semantic-capability scaling thesis | Unknown, empirically testable | whether extra search yields meaningful human-useful structure |
| Automatic human-useful representation discovery | Unknown | human/perceptual validity |
| Quest/human qualification pipeline | High | experiment cost/sample size |

## Final feasibility verdict

The architecture is **engineering-feasible as a research platform** and is well aligned with established ideas in declarative visualization, constraint-based recommendation, multi-objective evolution, quality-diversity, adaptive-analysis validation and immersive analytics.

The strongest unproven thesis is not the laboratory machinery. It is:

> Increasing compute plus evolutionary semantic-representation search can discover additional representations that expose meaningful dataset structure while preserving truth and improving human analytical capability.

That is a legitimate research hypothesis, not an architectural prerequisite. The architecture is valuable precisely because it can return **FALSIFIED** or **ABSTAIN** if that thesis fails.

Proceed with LAB-0..LAB-5. Treat EVO-0 as specification/protocol work. Gate EVO-1 on the ten amendments above and on the Nemosyne dataset-first semantic grammar reaching a sufficiently stable V1.
