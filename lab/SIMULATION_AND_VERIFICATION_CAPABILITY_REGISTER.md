# Nemosyne Simulation and Verification Capability Register

Status: living laboratory register
Date: 2026-09-19

## Purpose
This register prevents simulation, verification, and device-qualification subsystems from becoming orphaned. Nemosyne Data indexes and studies these systems; it does not become a second product runtime.

## Existing capabilities
- Playwright production-browser verification: nemosyne/playwright.config.ts and tests/smoke. Real production-build browser evidence. Currently Chromium/Desktop Chrome only.
- USIM WebXR/IWER: nemosyne/dev/xr-simulator. Controller, hand/pinch, 6DoF pose and deterministic scenarios. The VSL `xr-simulator` worker executes the native Nemosyne Vitest surface only when `NEMOSYNE_SOURCE_ROOT` is clean and exactly matches the job specimen SHA; otherwise it records `ABSTAIN`.
- USIM-A lifecycle: LifecycleScenarioRunner. XR enter/exit/re-entry, stale async work, generation/concurrency races.
- XR experimental matrix: nemosyne/dev/xr-lab/ExperimentalProfiles.ts. Device x fault x dataset x repetition experiments.
- Device envelopes: Quest 3-class, Quest 2-class, Quest Pro-class, generic WebXR 6DoF, constrained standalone, and Apple-like transient-pointer contract.
- Fault envelopes: clean, noisy and hostile tracking/pose/latency/frame/input conditions.
- Tier-4 system scenarios: scale, collaboration, long-running session, fault-tolerant streaming and complete analyst journey.
- Governed physical Quest QV: quest scripts plus validation adjudication/finalization/custody.
- Portable XR architecture campaigns: nemosyne-data/lab/xr-architecture.
- Perturbation and known-structure campaigns: nemosyne-data laboratory protocols/benchmarks/perturbations. The RFL `perturbation-campaign` worker is bound by `lab/config/perturbation-campaign.default.json` to exact-SHA native Nemosyne falsifiers; the config declares supported and prohibited claims and is hashed into evidence.

## Professional and cross-vendor targets
These are integration targets, not claims of current physical qualification.
1. PICO Emulator/OpenXR lane: independent vendor emulator/runtime relative to IWER.
2. HTC VIVE OpenXR lane: evaluate OpenXR Standalone Mock Runtime/editor support and Direct Preview/streaming where applicable. Direct Preview may require physical hardware and must not be mislabeled as pure simulation.
3. PCVR OpenXR/SteamVR lane: independent PC runtime for VIVE Pro/Cosmos-class and other OpenXR hardware.
4. Professional engineering XR lane: Varjo-class high-resolution PCXR for dense-information legibility, gaze/eye interaction, performance and workstation-grade investigation.
5. Apple spatial lane: retain transient-pointer contract tests and add Safari/visionOS simulator/device evidence when accessible.
6. Future non-Meta physical lane: PICO/VIVE/Varjo qualification when hardware becomes available.

## Workflow gaps
1. Playwright production verification is Chromium-only; add Firefox and WebKit and selectively branded Chrome/Edge channels.
2. XR simulator episodes are bounded but not yet a durable exact-specimen evidence store.
3. Device-envelope diversity exceeds runtime diversity: several profiles share IWER and correlated blind spots.
4. No governed PICO/VIVE/PCVR/Varjo execution lane is integrated into the evidence chain.
5. Apple-like transient-pointer testing is contract-level only.
6. Visual/spatial regression evidence is weaker than logical/state evidence.
7. Existing systems are not uniformly triggered/sampled after merges.
8. Cross-runtime differential replay is not first-class.
9. Simulator-to-hardware calibration is not systematically measured.
10. Professional engineering workloads need explicit high-resolution, dense-information, long-session and gaze criteria rather than inheriting consumer-headset criteria.

## Evidence ladder
unit/deterministic -> Playwright cross-browser -> production visual/browser -> IWER USIM -> lifecycle/fault matrix -> vendor emulator/mock runtime -> independent PC OpenXR runtime -> adversarial long-session -> physical Quest -> physical cross-vendor/professional XR -> human UX/comfort/discoverability -> promotion or ABSTAIN

No lower rung may silently substitute for a higher one.

## Lab operating rule
Every subsystem must expose its owner/authority repository, execution entry point, specimen/build identity, evidence class, durable artifact location where feasible, supported claims, prohibited claims, freshness, native disposition, and successor/fix-forward linkage. The coordination layer indexes these facts; it does not recompute authoritative verdicts.
