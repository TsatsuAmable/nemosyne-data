# Nemosyne collected-data audit, 2026-09-18

## Result

The previously untracked adversarial research council corpus on Millhouse is preserved under `research/adversarial-committees/2026-09-17/` with a SHA-256 manifest, source repository commit, capture date, and source-machine provenance.

Existing source-controlled research/evidence documents remain canonical in `nemosyne` rather than being duplicated. Relevant families audited include `docs/research/`, Quest telemetry/validation documentation, benchmark documentation, Moneta evidence protocol/campaign material, XR evidence calibration/experimental-engine material, and their source-controlled test/runner machinery.

No generated XR architecture experiment evidence artifacts were present in the working tree at audit time. The portable experiment laboratory is still being built. Future raw/derived outputs should land in this repository under stable research/experiment IDs.

## Coverage limitation

The MacBook was online, but filesystem execution/search was unavailable because Remote Desktop Commander referenced a missing Node executable. This audit therefore does not claim that machine-local orphaned evidence has been exhausted. Repeat the machine sweep after Mac execution is repaired.

## Preservation policy

New committee outputs, experiment manifests, raw observations, derived analyses, adjudications, and evidence-bundle manifests belong in `nemosyne-data`. Executable harnesses, schemas, product code, and test machinery remain in `nemosyne`. Preserved artifacts should carry or inherit source commit, protocol/version, stable IDs, and content hashes.
