# Concurrent verification orchestration gap audit
Date: 2026-09-19
## Finding
Do not build a second validation scheduler. Nemosyne already owns mature execution and evidence machinery: QV launch/session manifests, ADB Quest attribution, isolated evidence sinks, QV4 adjudication/finalization/custody, publication, WebXR simulator scenarios, known-structure campaigns, and fix-forward practice. Nemosyne-data already owns portable campaigns, perturbations, preserved validation evidence, and adversarial committee outputs.
## Missing coordination seam
The observed gap is cross-run orchestration and visibility, not experiment execution:
1. a merge/exact-main event does not uniformly fan out claim-appropriate asynchronous simulator/device/lab work;
2. concurrent runs do not expose one canonical machine-readable WIP/status view;
3. terminal findings are not uniformly linked to remediation and exact-head reverification;
4. evidence freshness and supersession are not centrally visible to planning.
## Reuse boundary
Nemosyne remains authority for product validation manifests, QV adjudication and promotion semantics. Nemosyne-data remains laboratory/evidence custody and research execution. Any coordinator must reference existing run/session identities and evidence rather than reimplement their state machines.
## PR #9 disposition
Retain only a thin coordination index/ledger contract if it can ingest existing run identities. Remove duplicated notions of validation state, worker execution, or adjudication before promotion. The coordinator may track PLANNED/RUNNING/TERMINAL linkage, but the worker's native disposition remains authoritative.
## Next implementation
Replace synthetic worker scheduling with adapters/indexing over existing QV, XR simulator, perturbation/campaign, and adversarial committee artifacts. Add merge-trigger fan-out only after each worker's trigger and authority boundary are mapped.
