# Nemosyne lab parity audit

**Product specimen:** `TsatsuAmable/nemosyne@2c87fe73fa133d64e4f434cba9731fbb5be73dbb` (ownership audit merged; implementation comparison taken from its unchanged parent content)  
**Data-lab base:** `TsatsuAmable/nemosyne-data@b4a135cb73e3652657f323669f31b96beddedf9f`

## Result

The first research-owned migration cluster is already substantially present in nemosyne-data. Six counterparts are behaviorally identical apart from import paths; three more differ only by import-path/type-boundary adaptation. Two differences are intentional improvements in the data-lab copy.

| Product module | Data-lab authority | Parity disposition |
| --- | --- | --- |
| MonetaBenchmarkCorpus | lab/benchmarks/MonetaBenchmarkCorpus | EXACT |
| MonetaKnownStructureCampaign | lab/benchmarks/MonetaKnownStructureCampaign | EQUIVALENT, protocol-owned DatasetJSON/imports |
| PortableMonetaPerturbationRunner | lab/perturbations/PortableMonetaPerturbationRunner | EQUIVALENT, import relocation only |
| PortablePerturbationPlan | lab/perturbations/PortablePerturbationPlan | EXACT |
| PortableXRRuntimePerturbationRunner | lab/perturbations/PortableXRRuntimePerturbationRunner | EXACT |
| PortableXRExperiment | lab/protocols/PortableXRExperiment | DATA-LAB STRICTER: rejects unresolved `REQUIRED_AT_RUN_TIME` fingerprint |
| XRArchitectureCampaign | lab/protocols/XRArchitectureCampaign | EXACT |
| XRExperimentEvidenceContract | lab/protocols/XRExperimentEvidenceContract | EXACT |
| XRExperimentStatusReport | lab/engine/XRExperimentStatusReport | EQUIVALENT, import relocation only |
| ResourcePressurePerturbation | lab/perturbations/ResourcePressurePerturbation | INTENTIONAL BOUNDARY SPLIT: lab calls pinned specimen capability rather than importing product ResourceLifecycleGovernor |

## Consequences

No product implementation needs to be copied into nemosyne-data for this cluster. In particular, copying the product ResourcePressurePerturbation would invert authority by reimplementing/embedding product lifecycle behavior inside the laboratory. The current specimen-adapter version is the correct boundary.

Before product copies are retired, migrate the product-side research tests that establish laboratory protocol behavior into nemosyne-data. Product tests that establish ResourceLifecycleGovernor or WebXR runtime invariants stay in Nemosyne and must target production behavior directly rather than a research campaign wrapper.

The unresolved scientific/production boundary around `MonetaEvidenceProtocol.ts` is deliberately excluded from this parity claim and requires a separate adversarial split.
