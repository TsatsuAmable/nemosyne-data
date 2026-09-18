# Nemosyne Data Laboratory Architecture

**Status:** canonical design target  
**Date:** 2026-09-18  
**Repository:** `TsatsuAmable/nemosyne-data`  
**Scope:** experimental laboratory for Nemosyne/Moneta research, falsification, simulation, compute scaling and evolutionary semantic-representation research.

## 1. Purpose

`nemosyne-data` is the durable **experimental laboratory** surrounding Nemosyne. It is not merely a dataset repository and must not become a second implementation of Moneta.

The product repository `nemosyne` owns analytical and runtime authority: Rust/WASM analysis, Moneta decisions, semantic embodiment contracts/compiler, XR runtime, interaction systems, production lifecycle governors and thin experiment adapters.

The laboratory owns experiments performed *on pinned Nemosyne specimens*: corpora, protocols, portable runners, perturbations, simulations, compute staircases, evolutionary populations, raw observations, derived analyses, adversarial research artifacts and adjudication evidence.

The laboratory exists to answer:

> What can this exact Nemosyne specimen defensibly do, under these exact data, compute, perturbation and interaction conditions, and what evidence would falsify that conclusion?

## 2. Constitutional boundary

```
NEMOSYNE PRODUCT                         NEMOSYNE-DATA LAB
----------------                         ------------------
Rust/WASM analytical authority   <---->  Specimen protocol
Moneta semantic reasoning                Experiment orchestration
SemanticEmbodimentGraph                  Benchmark corpora/oracles
SpatialEmbodimentPlan                    Perturbation campaigns
XR runtime                               XR research scenarios
Resource governors                       Compute staircases
Interaction systems                      Evolutionary populations
Thin instrumentation/adapters            Evidence collection
                                         Derived analysis
                                         Adversarial adjudication
                                         Research-cycle registry
```

A pinned Nemosyne build is a **specimen**. The laboratory supplies the experiment, drives the specimen through a versioned interface, records observations and constructs reproducible evidence bundles.

The lab must never independently reimplement Moneta analytical truth in TypeScript/Python/etc. A lab-side oracle may describe known benchmark truth, but product analytical conclusions must originate from the specimen's governed authority.

## 3. Core design principles

1. **Zero-LLM unattended execution.** Routine experiments require no language model. LLM research agents are optional research/adjudication participants, never laboratory administrators.
2. **Pinned specimens.** Repository commit, build hash, protocol version and capabilities are recorded and verified before execution.
3. **Claim-bound evidence.** Every experiment names the claim/hypothesis, governing criteria, admissible observations and falsifiers before adjudication.
4. **Fail closed.** Missing authority, protocol mismatch, unsupported capability, malformed evidence or absent criteria produces refusal/INCOMPLETE/ABSTAIN rather than optimistic substitution.
5. **Deterministic where possible.** Seeds, configuration, corpus identity, perturbations, ordering and hashes are reproducible.
6. **Raw evidence is immutable.** Derived analysis never rewrites source observations.
7. **Same substrate for competitors.** Competing architectures receive identical corpora, traces, budgets, seeds and falsifiers.
8. **Human evidence remains human.** Simulator/model consensus cannot establish comfort, discoverability or perceived usefulness.
9. **More compute is not automatically more evidence.** Compute is an independent experimental variable.
10. **Evolution may search representation, never truth.** Analytical facts/provenance are immutable constraints on evolutionary search.
11. **Exploration and qualification are separate phases.** Adaptive search may use discovery evidence, but promotion requires a frozen candidate and independent/sealed qualification evidence [R5][R6].
12. **Semantic gain is not visual richness.** Additional geometry, texture or rendering fidelity is recorded separately from newly supported semantic propositions, relationships or task affordances.
13. **The grammar is a hypothesis.** Typed representation grammars constrain search but may encode designer prejudice; unexpressible phenomena may be recorded as `OUT_OF_GRAMMAR` rather than coerced into an existing representation.
14. **Reproducibility has levels.** The lab distinguishes exact deterministic replay from statistical/distributional reproducibility when parallelism, GPUs or runtimes make bitwise replay inappropriate.

## 4. Target repository topology

```
lab/
  engine/             portable orchestration and execution
  protocols/          specimen/evidence/campaign schemas
  benchmarks/         benchmark definitions and known-structure generators
  perturbations/      deterministic/adversarial perturbation definitions
  simulation/         XR research scenarios and traces
  evolution/          representation evolution engine and lineage contracts
  staircase/          compute/capability staircase orchestration
  adjudication/       deterministic gates and PromotionGate inputs
  reporting/          CLI/JSON/HTML reports
  adapters/           transport clients, never analytical implementations

data/                  governed source corpora
experiments/           preregistered experiment definitions
research/              committee artifacts + Research Cycle Registry
evidence/
  raw/                 immutable observations
  derived/             analysis products
  bundles/             portable evidence bundles
analysis/              Wolfram/statistical analysis programs and manifests
```

Existing paths may migrate incrementally. Directory names do not supersede evidence identity/provenance contracts.

## 5. Specimen protocol

The laboratory communicates with a separately pinned Nemosyne specimen through a stable process boundary, preferably JSON-over-stdio initially, with HTTP/container transport possible later.

Minimum operations:

### `describe`

Returns repository, commit, build hash, protocol version and supported experimental capabilities.

### `profile-structure`

Accepts governed dataset identity/input and analytical request. Returns Rust/WASM-authoritative bounded observations plus provenance.

### `run-xr-scenario`

Accepts scenario, trace, seed and resource configuration. Returns bounded `XREvaluationEpisode`-compatible evidence.

### `run-resource-pressure`

Drives production lifecycle mechanisms through an experiment adapter and returns logical residency/resource evidence.

### Future semantic operations

- request/inspect `SemanticEmbodimentGraph`;
- compile/activate a candidate `SpatialEmbodimentPlan`;
- execute authorized semantic-detail transitions;
- evaluate an externally supplied evolutionary candidate genome without allowing it to mutate analytical truth.

The protocol distinguishes **artifact SHA-256** from the specimen's **dataset fingerprint**. Both are bound to evidence and never conflated.

## 6. Portable experiment engine

The engine is the laboratory's deterministic conductor.

Responsibilities:

```
load experiment
 -> verify schemas
 -> verify corpus/oracle identity
 -> acquire + verify specimen identity
 -> establish seed/order/budget
 -> execute campaign
 -> apply perturbations
 -> collect bounded observations
 -> evaluate preregistered falsifiers
 -> hash artifacts
 -> package evidence
 -> emit report
```

It records:

- experiment/protocol versions;
- specimen commit/build hash;
- corpus artifact hashes and product fingerprints;
- seeds and randomized/counterbalanced ordering;
- host/hardware/runtime identity;
- configuration hash;
- wall/CPU/GPU time where attributable;
- memory/resource observations;
- outputs/refusals/failures/timeouts;
- perturbation results;
- evidence and analysis hashes.

A report status such as `READY` means only what its schema explicitly defines. Manifest construction must never be confused with architecture qualification.

## 7. Benchmark subsystem

Benchmark families provide controlled problems and governing truth.

Classes include:

- exact-generative synthetic structure;
- labeled ground truth;
- task-solution corpora;
- diagnostic-only corpora;
- human-preference/UX corpora.

Known-structure generators preserve hidden oracle truth separately from specimen input. The specimen must not receive answer labels unless the experiment explicitly studies supervised information.

Benchmark dimensions should expand beyond row count:

- N / entity count;
- feature dimensionality;
- effective rank;
- manifold/topological complexity;
- cluster/region ambiguity;
- temporal complexity;
- graph complexity;
- missingness/noise;
- compositional/measurement-scale conditions;
- adversarial distractors;
- multiscale structure.

## 8. Perturbation subsystem

Perturbations test whether conclusions survive admissible change.

### Data perturbations

Noise, resampling, rotations/transformations where semantics permit, missingness, scale changes, feature additions/removals, information-destroying controls and benchmark-specific metamorphic transforms.

### Runtime perturbations

- semantic refine/collapse races;
- cancellation storms;
- focus/refinement thrash;
- memory/resource pressure;
- stale async completion;
- navigation/teleport floods where genuinely driveable;
- long-session churn;
- constrained budgets;
- concurrent investigations where supported.

Each perturbation declares its semantic invariants. A perturbation is not valid merely because it is easy to generate.

## 9. XR simulation subsystem

Research simulation sits in `nemosyne-data`; generic product-development WebXR/IWER infrastructure remains in `nemosyne`.

The lab supplies:

- deterministic movement/gaze/selection traces;
- interaction sequences;
- resource-pressure profiles;
- long-session scenarios;
- architecture comparison scenarios;
- adversarial race/cancellation scenarios.

Evidence ladder:

```
unit/deterministic falsifiers
 -> portable laboratory campaign
 -> IWER/XR simulation
 -> adversarial long-session simulation
 -> Quest 3 instrumented trials
 -> human UX/comfort/discoverability
 -> promotion or ABSTAIN
```

Simulation can falsify broken designs. It cannot establish human comfort or discoverability.

## 10. Compute and capability staircase

The staircase is not merely a performance benchmark. Its goal is to map:

```
compute budget
 -> analytical/search/evidence capacity
 -> semantic representational capacity
 -> retained + newly revealed meaningful structure
```

### Hardware axis

Run an unchanged pinned experiment across local Mac, Fedora, Windows where appropriate, then external compute only when justified. Hardware is an independent variable.

### Workload axes

- dataset volume;
- dimensionality/effective structure;
- candidate search breadth;
- perturbation repetitions;
- evidence depth;
- semantic hierarchy depth;
- representation composition complexity;
- XR entity/working-set complexity;
- update frequency;
- session duration/churn;
- parallel investigations.

### Method

Each stair runs in an isolated process/container where practical. Use warm-up plus repeated measured runs. Record peak RSS/CPU/GPU/resource metrics through appropriate OS/runtime mechanisms. Pre-register stopping rules such as latency ceiling, memory fraction, refusal, instability or resource exhaustion. Preserve the stopping event as evidence.

Use geometric/adaptive growth followed, when useful, by boundary refinement.

The laboratory reports a **capability frontier**, not simply maximum N.

## 11. Dataset-first semantic representation experiments

The laboratory adopts the Nemosyne dataset-first architecture:

```
Dataset
 -> Rust/WASM evidence
 -> Moneta semantic-world decision
 -> SemanticEmbodimentGraph
 -> SpatialEmbodimentPlan
 -> XR presentation
```

Point/grid/force/spectral/radial/etc. are spatial primitives or explicit observation-level representations, not automatically dataset-level semantic answers.

Experiments must distinguish:

- additional visual fidelity;
- additional semantic structure;
- additional evidence confidence/stability;
- additional interaction capability.

Only the latter three can support a claim that additional compute produced additional Moneta capability.

## 11.1 Semantic Gain Contract

Every experiment claiming that additional compute or a richer representation reveals additional meaning must distinguish four quantities:

- **semantic gain:** new evidence-backed dataset propositions, relationships, structures or task-relevant affordances;
- **semantic retention/loss:** which previously admissible meanings remain available or are explicitly discarded;
- **visual fidelity:** geometry, texture, sampling density, animation or rendering refinement that changes presentation without establishing new meaning;
- **evidence strength:** additional perturbation/replication/qualification support for an already represented claim.

A phenotype that is visually richer but semantically equivalent is not a higher-semantic-capability result. A more expensive phenotype that is semantically equivalent and otherwise no better is dominated by the cheaper phenotype.

## 12. Evolutionary Representation Laboratory

### 12.1 Objective

Evolve **meaning-preserving semantic representation states** under controlled compute budgets.

Evolution does not optimize raw geometry in isolation. It searches compositions of semantic embodiment and spatial realization while immutable analytical/evidence constraints define what may be claimed.

### 12.2 Constraint/admissibility solver

Genome generation is followed by a hard admissibility stage **before phenotype construction**. This follows the general separation between hard and soft constraints demonstrated by constraint-based visualization systems such as Draco [R2].

The solver rejects candidates that violate analytical authority, measurement-scale rules, dataset/decision identity, semantic abstraction boundaries, resource/security limits, or grammar validity. Soft/evolutionary preference operates only inside the admissible set. Rejection is retained as lineage evidence.

### 12.3 RepresentationGenome V1

A versioned genome may encode:

- semantic object families;
- semantic hierarchy/composition;
- parent/child/refinement relations;
- abstraction boundaries;
- spatial allocation;
- allowed spatial primitives;
- encoding choices;
- interaction affordances;
- semantic-detail policy;
- transition policy;
- presentation fidelity parameters;
- evidence requirements;
- resource-budget policy.

Analytical facts, dataset fingerprint, governing provenance and oracle truth are **not genes**.

### 12.4 Evolutionary state

Every candidate records:

- genome ID + hash;
- generation;
- parent IDs;
- mutation/recombination operators;
- random seed;
- specimen identity;
- dataset/campaign identity;
- compute budget;
- phenotype/plan hash;
- evidence bundle references;
- independent fitness-axis observations;
- admissibility/refusal;
- rejection reason;
- lineage status.

This produces a reproducible representation phylogeny.

### 12.5 Variation

Operators may include:

- add/remove semantic object;
- split/merge semantic region when analytically authorized;
- alter hierarchy depth;
- substitute spatial primitive;
- alter spatial allocation;
- add/remove interaction affordance;
- change semantic-detail policy;
- change presentation fidelity;
- recombine independently successful semantic/spatial subgraphs.

An operator cannot invent membership, correlations, clusters or other analytical facts. Such changes require a new Rust/WASM-authoritative analytical observation.

### 12.6 Fitness and admissibility

Do not begin with one scalar fitness function.

Maintain independently governed axes:

- semantic truth retention;
- explicit information loss;
- known-structure recovery;
- perturbation stability;
- identity continuity;
- task utility where measurable;
- representation stability;
- latency;
- memory/resource cost;
- XR frame/tail behavior;
- interaction availability;
- human comfort/discoverability where required;
- provenance/replay integrity.

Hard evidence/admissibility gates precede optimization. Missing criteria produce `ABSTAIN`.

A Pareto/frontier formulation is preferred initially over forced scalarization.

### 12.7 Evolutionary compute staircase

Increasing compute can purchase:

- larger populations;
- more generations;
- broader mutation/recombination search;
- deeper semantic hierarchies;
- more complex compositions;
- more perturbation repetitions;
- stronger stability evidence;
- richer spatial phenotypes;
- more counterfactual alternatives.

The research question is whether these increments yield **defensible additional semantic capability**, not whether evolution consumes the available compute.

### 12.8 Baselines

Evolution must compete under identical budgets with:

- current fixed Moneta candidate selection;
- random search;
- deterministic heuristic search;
- ablated mutation-only/recombination-only variants;
- simple dataset-level semantic baselines.

This guards against mistaking compute expenditure for algorithmic contribution.

### 12.9 Evolutionary adversaries

Campaigns should attack:

- metric gaming;
- visually rich but semantically identical candidates;
- complexity bloat;
- lineage collapse/premature convergence;
- unstable high-fitness candidates;
- deceptive local optima;
- redundant semantic nodes;
- mutation of provenance/authority;
- representations that expose known answers only through benchmark leakage;
- candidates whose machine fitness conflicts with Quest/human evidence.

### 12.10 Quality-diversity repertoire

Pareto search is not the only target. The lab should also support quality-diversity/repertoire experiments in which high-quality representations occupy distinct semantic/task/compute niches rather than collapsing toward one universal champion [R4]. A repertoire may therefore be indexed by dataset characteristics, analytical task, semantic complexity, compute tier and interaction context.

This is especially compatible with Moneta's rejected alternatives: an alternative may be unsuitable for the current niche yet remain valuable elsewhere.

### 12.11 Road-not-taken evidence

Rejected alternatives are first-class evidence. Evolutionary lineage can later support Nemosyne's ghost-geometry "roads not taken" feature, but the visualization is downstream of immutable lineage evidence.

### 12.12 Search-space and bloat controls

Evolution begins with a small typed declarative grammar rather than executable candidate code. Grammar expansion is staged and versioned. Controls include bounded node/depth counts, grammar-aware mutation, hard feasibility checks, explicit complexity/resource objectives, parsimony/dominance rules, and operator ablations.

If an observed structure cannot be represented without violating the grammar, the result may be `OUT_OF_GRAMMAR`. Grammar versions are themselves research hypotheses and may be revised through the Research Cycle process.

### 12.13 Evidence cache

Repeated evolutionary evaluation must not force Rust/WASM to recompute immutable analytical evidence unnecessarily. The lab may use a content-addressed evidence cache keyed by specimen/build identity, dataset fingerprint, analytical request, protocol version and relevant parameters. Cached objects are authoritative observations previously emitted by the specimen, not conclusions inferred from geometry.

### 12.14 Offline search vs runtime deployment

Evolutionary search cost and deployed Moneta inference cost are separate budgets. Experiments record both and, where relevant, estimate amortization: how many subsequent investigations or decisions reuse learned/evolved knowledge before the offline search cost is justified.

## 13. Research Cycle Registry

Every important research question has a durable ID and state:

- OPEN
- TESTING
- ABSTAINED
- SUPPORTED_WITH_SCOPE
- FALSIFIED_WITH_SCOPE
- REOPEN
- CLOSED

Record:

- hypothesis/claim;
- committee artifact;
- governing protocol;
- experiments;
- evidence references;
- adjudication;
- explicit reopen triggers.

Machine-detectable reopen triggers include:

- falsifier fires;
- architectures materially disagree;
- perturbation stability exceeds preregistered bounds;
- assumption contradiction;
- ABSTAIN;
- Quest/simulation disagreement;
- specimen/protocol/model invalidation;
- anomalous evolutionary behavior.

Evidence chain:

```
research question
 -> committee/hypothesis artifact
 -> preregistered protocol/config
 -> raw evidence
 -> derived analysis
 -> adversarial adjudication
 -> PromotionGate decision
```

## 14. Adversarial research and adjudication

Research committees widen the hypothesis space and critique assumptions. They do not determine truth by vote.

Use committees for:

- architecture alternatives;
- falsifier generation;
- anomaly interpretation;
- experimental redesign;
- prior-art challenges;
- evolutionary metric-gaming attacks.

Important claims receive independent senior/adversarial review after reproducible evidence exists.

## 15. Analysis subsystem

Derived statistical/computational analysis is separate from raw evidence.

Wolfram or other analysis engines may perform:

- matched-block comparisons;
- paired differences;
- tail metrics;
- long-session trends;
- stability distributions;
- Pareto/frontier analysis;
- evolutionary diversity/convergence analysis;
- sensitivity analysis.

Every derived artifact records engine/version, protocol ID/version, code hash and input evidence hashes.

Post-selection/evolutionary inference requires explicit treatment. Selecting a representation and then evaluating it on the same evidence can create selection bias [R5]. Adaptive reuse of a holdout can also compromise ordinary validity assumptions [R6]. Evolutionary search is therefore exploratory by default. Confirmatory claims require frozen candidate(s), frozen protocol and independent evidence, using sample splitting, selective/simultaneous inference, sealed holdouts or another pre-specified method appropriate to the claim.

Qualification should prefer **benchmark-family holdout** where possible, not merely row holdout, so evolution cannot succeed by learning peculiarities of one generator or corpus.

## 16. Evidence store and portable bundle

A portable evidence bundle should contain or cryptographically reference:

- experiment definition;
- Research Cycle entry;
- specimen manifest;
- corpus/oracle manifests;
- configuration/seeds/order;
- perturbation plans;
- raw observations;
- failures/refusals;
- evolutionary lineage if applicable;
- derived analyses;
- adjudication;
- hashes and chain-of-custody manifest.

The Nemosyne Evidence Vault may reference/freeze/replay these artifacts, but is not itself scientific authority.

## 17. Reporting surfaces

Provide equivalent machine-readable and human-readable views:

### Status

What is running, queued, refused, failed, complete.

### Results

Claim-bound experimental results, uncertainty, falsifiers, capability frontiers.

### Research

Questions requiring reconsideration, state, evidence and reopen reason.

### Evolution

Generation/population status, lineage, diversity, Pareto frontier, rejected alternatives and compute tier.

Never show an overall "winner" where governing criteria do not justify one.

## 18. Promotion model

```
candidate architecture/representation
 -> deterministic gates
 -> benchmark evidence
 -> perturbation evidence
 -> simulator evidence
 -> independent analysis
 -> adversarial adjudication
 -> Quest/human evidence where required
 -> PromotionGate
 -> PROMOTE / REJECT / ABSTAIN
```

Promotion means supported for a bounded claim and environment, not universal superiority.

## 19. Security and integrity

- no credentials in evidence/configs;
- least-privilege specimen adapters;
- immutable hashes for evidence and genomes;
- bounded protocol payloads;
- timeouts/resource ceilings;
- hostile/malformed candidate rejection;
- no candidate-supplied executable code in early evolutionary versions;
- deterministic declarative genomes before considering generated code;
- generated algorithms, if ever allowed, require sandboxing and a separate threat model;
- preserve provenance through every transformation.

## 20. Implementation roadmap

### LAB-0: laboratory contract

Consolidate this architecture, schemas and directory ownership. Make zero-LLM unattended operation a tested requirement.

### LAB-1: specimen transport

Complete versioned JSON-over-stdio specimen protocol, pin identity, reconcile async campaign execution, distinguish artifact hash/product fingerprint.

### LAB-2: portable evidence engine

End-to-end experiment -> specimen -> raw evidence -> stable report/bundle. Clean-clone/container test without Nemosyne source checkout.

### LAB-3: perturbation + XR integration

Drive real specimen lifecycle/detail/scheduler interfaces. Implement stale/cancellation/refine-collapse/long-session falsifiers.

### LAB-4: rigorous compute staircase

Fresh-process repeated measurements, host manifests, stopping rules and capability-frontier reports. Run identical pinned campaigns across available hardware.

### LAB-5: SemanticEmbodimentGraph experiments

Once Nemosyne exposes the contract, test dataset-first abstraction, composition, information preservation and explicit drill-down boundaries.

### EVO-0: evolutionary contracts

Implement `RepresentationGenome`, lineage, typed/versioned grammar, `OUT_OF_GRAMMAR`, constraint/admissibility solver, Semantic Gain Contract, complexity accounting, evidence-cache identity, exploration/qualification split, independent fitness-axis evidence and evolutionary bundle format. No optimization yet.

### EVO-1: controlled search

Mutation-only and random-search baselines over safe declarative spatial/semantic parameters. EVO-1 is gated on an independently reviewable dataset-first semantic grammar V1 and sealed qualification protocol.

### EVO-2: recombination + Pareto/QD selection

Add compositional recombination, diversity preservation, multi-objective frontier selection and a quality-diversity/repertoire mode. Multi-objective methods such as NSGA-II provide established precedent for non-dominated selection [R3]; quality-diversity research provides precedent for retaining diverse high-performing niches [R4].

### EVO-3: compute-conditioned evolution

Run evolutionary capability staircase across compute tiers and benchmark complexity.

### EVO-4: adversarial evolutionary qualification

Metric gaming, leakage, instability, convergence, perturbation and independent holdout campaigns.

### EVO-5: immersive qualification

Promising survivors enter simulator, Quest and human evaluation where their claims require it.

### EVO-6: Moneta learning integration

Only after evidence supports the mechanism, feed qualified evolutionary knowledge back into production Moneta model/registry under PromotionGate governance.

## 21. Definition of laboratory completeness

The laboratory is not "complete" because all directories exist. A credible V1 must demonstrate:

1. clean standalone installation;
2. pinned external specimen connection;
3. governed corpus verification;
4. deterministic campaign replay;
5. perturbation execution;
6. XR simulation evidence ingestion;
7. immutable portable evidence bundle;
8. claim-bound adjudication/ABSTAIN;
9. rigorous local compute staircase;
10. Research Cycle traceability;
11. at least one end-to-end architecture comparison.

Evolutionary capability is a subsequent completion layer requiring reproducible lineage, baselines, independent fitness axes, adversarial falsifiers and compute-conditioned experiments.

## 22. Immediate next actions

1. Treat this document as the canonical target architecture for the laboratory.
2. Audit current `lab/` implementation against LAB-0..LAB-4 and record implemented/partial/missing.
3. Complete the specimen transport before adding more lab-side product logic.
4. Convert the current Mac staircase into an isolated/repeated laboratory staircase.
5. Preserve current architecture experiments as preregistered candidates, not conclusions.
6. Add EVO-0 schemas only after the Nemosyne dataset-first semantic embodiment contracts stabilize enough to avoid encoding today's point-layout leak as the evolutionary genome.
7. Before EVO-1, demonstrate the constraint/admissibility solver, Semantic Gain Contract, complexity/bloat accounting, evidence cache, `OUT_OF_GRAMMAR` path, sealed qualification split and exact-vs-statistical reproducibility policy.
8. Keep evolutionary discovery and confirmatory qualification on distinct evidence paths; a candidate selected by evolution is frozen before qualification.
9. Treat the compute-to-semantic-capability relationship as a falsifiable research hypothesis, not an architectural assumption.

## 23. Prior art and design rationale

The laboratory intentionally adopts ideas with established precedent while preserving Nemosyne-specific boundaries.

- **Declarative grammar/compiler.** Vega-Lite demonstrates that concise high-level visualization and interaction specifications can compile into lower-level dataflow/rendering specifications [R1]. Nemosyne extends the architectural pattern toward dataset-semantic, immersive embodiment; Vega-Lite does not establish that extension.
- **Hard/soft visualization constraints.** Draco formalizes visualization design knowledge as constraints and learns weights for soft constraints [R2]. This motivates the lab's hard admissibility-before-optimization boundary, without making Draco's objective or 2D design space authoritative for Moneta.
- **Multi-objective optimization.** NSGA-II is established prior art for non-dominated multi-objective evolutionary selection [R3]. The lab therefore treats Pareto selection as an available mechanism rather than a novel contribution.
- **Quality-diversity.** QD/MAP-Elites literature emphasizes repertoires of diverse, locally high-quality solutions rather than one global optimum [R4]. This motivates compute/task/semantic representation niches and preservation of useful rejected alternatives.
- **Post-selection/adaptive validation.** Statistical work on post-selection inference and reusable holdouts shows why adaptively chosen candidates cannot be treated as though they were fixed before observing evaluation data [R5][R6]. This motivates the exploration/qualification split.
- **Immersive analytics.** Immersive analytics research treats spatial analytical environments as promising while retaining open questions about appropriate representations, interaction and empirical human benefit [R7]. Simulator evidence therefore cannot establish comfort, discoverability or human analytical utility.

These references establish feasibility and reusable mechanisms, not proof of Moneta's central empirical thesis. The hypothesis that additional compute plus evolutionary semantic search yields additional truthful and human-useful representational capability remains to be tested.

### References

- **[R1]** Satyanarayan, A., Moritz, D., Wongsuphasawat, K., & Heer, J. (2017). *Vega-Lite: A Grammar of Interactive Graphics*. IEEE Transactions on Visualization and Computer Graphics, 23(1), 341-350. DOI: 10.1109/TVCG.2016.2599030.
- **[R2]** Moritz, D., Wang, C., Nelson, G. L., Lin, H., Smith, A. M., Howe, B., & Heer, J. (2019). *Formalizing Visualization Design Knowledge as Constraints: Actionable and Extensible Models in Draco*. IEEE Transactions on Visualization and Computer Graphics, 25(1), 438-448. DOI: 10.1109/TVCG.2018.2865240.
- **[R3]** Deb, K., Pratap, A., Agarwal, S., & Meyarivan, T. (2002). *A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II*. IEEE Transactions on Evolutionary Computation, 6(2), 182-197. DOI: 10.1109/4235.996017.
- **[R4]** Pugh, J. K., Soros, L. B., & Stanley, K. O. (2016). *Quality Diversity: A New Frontier for Evolutionary Computation*. Frontiers in Robotics and AI, 3:40. DOI: 10.3389/frobt.2016.00040.
- **[R5]** Kuchibhotla, A. K., Kolassa, J. E., & Kuffner, T. A. (2022). *Post-Selection Inference*. Annual Review of Statistics and Its Application, 9, 505-527. DOI: 10.1146/annurev-statistics-100421-044639.
- **[R6]** Dwork, C., Feldman, V., Hardt, M., Pitassi, T., Reingold, O., & Roth, A. (2015). *The reusable holdout: Preserving validity in adaptive data analysis*. Science, 349(6248), 636-638. DOI: 10.1126/science.aaa9375.
- **[R7]** Skarbez, R., Polys, N. F., Ogle, J. T., North, C., & Bowman, D. A. (2019). *Immersive Analytics: Theory and Research Agenda*. Frontiers in Robotics and AI, 6:82. DOI: 10.3389/frobt.2019.00082.
