**Committee stance:** No source edits, no PRs. Everything below treats current main, simulator results, expert heuristics, and model consensus as hypotheses only. Claims about human discoverability, comprehension, comfort, and Quest physical qualification require human/physical evidence.

## Evidence-tier premise

| Tier | Evidence | Authority |
|---|---|---|
| T0 | Simulator, desktop, editor, model consensus, expert heuristic | Hypothesis generation only |
| T1 | Human subjective: self-report, questionnaires, interviews | Can support perceived comprehension/comfort |
| T2 | Human behavioral/objective: task success, time, errors, kinematics, dropout | Can support discoverability/comprehension/comfort claims |
| T3 | Physical Quest telemetry: frame time, thermal, tracking, battery | Can support device qualification only |
| T4 | Field/longitudinal: retention, adverse events | Can support durable human/device claims |

**Rule:** T0 cannot promote T1–T4. T3 cannot substitute for T1/T2 on comfort or comprehension. Model consensus is not authority.

## 1. Problem

Observed problem: users may still not understand what Nemosyne can do. That is not only a discoverability failure; it is a **capability-comprehension failure**. A user can occasionally succeed by accident or guidance while still lacking a correct mental model of Nemosyne’s can/cannot capabilities.

Current claims likely under challenge:

- **Discoverability:** new users can find core capabilities unaided.
- **Comprehension:** users can correctly state or recognize what Nemosyne can and cannot do.
- **Interaction comfort:** physical Quest use is comfortable, safe, and acceptable over meaningful session lengths.
- **Quest qualification:** the build passes physical Quest performance/thermal/tracking/ergonomic requirements.

Adversarial concerns:

- If qualification is simulator/editor/desktop-first, it cannot promote physical Quest claims.
- If onboarding is tutorial-first, low-attention users may skip it; recognition should be tested, not just recall.
- If comfort is measured only by questionnaires, adverse events and dropout may be missed.
- If “users completed a task” is treated as comprehension, false affordances and accidental success are missed.
- If model consensus says “this is discoverable/comfortable,” it is still T0.

## 2. Competing approaches

| Area | Competing approaches |
|---|---|
| Onboarding | Explicit tutorial vs contextual/diegetic cues vs agent-led just-in-time prompts vs no onboarding |
| Comprehension | Recall tests vs recognition tests vs behavioral transfer vs card sorting |
| Comfort | Subjective questionnaires vs objective telemetry/kinematics vs hybrid |
| Quest qualification | Simulator-first vs physical-first vs staged gates |
| Evidence | Model consensus vs simulator vs human physical |
| Low attention | Recognition/EMA micro-probes vs think-aloud/high-attention protocols |

Novel alternatives worth testing:

- **Capability compass:** diegetic HUD that reveals one capability at a time in context.
- **Just-in-time capability cards:** triggered by user intent, not a front-loaded tutorial.
- **In-world recognition quiz:** quick “can Nemosyne do X?” probes as low-attention onboarding.
- **Comfort-aware session shaping:** dynamic session length based on intermittent comfort ratings.
- **Evidence-tiered CI gates:** simulator PRs cannot merge human/physical claims; physical Quest telemetry gates required.

## 3. Strongest counterarguments

- **“Users don’t need to understand all capabilities.”** True for an art experience; false if Nemosyne claims capability discoverability. The observed confusion makes comprehension a product requirement.
- **“Task success is enough.”** No. Task success can be guided, accidental, or narrow. Comprehension requires transfer and correct can/cannot boundaries.
- **“Low-attention protocols under-measure.”** That is partly the point: real users are low-attention. Use both low- and high-attention protocols.
- **“Comfort is subjective; objective metrics aren’t comfort.”** Correct. Use objective metrics as disqualifiers, subjective metrics as qualifiers, and adverse events as hard stops.
- **“Simulator is enough for iteration.”** For logic/layout, yes. For Quest thermal, tracking, latency, ergonomics, and human comfort, no.
- **“Human studies slow engineering.”** Bad physical/human claims cost more. Simulator/model claims must not leak into UXR5.
- **“Novel alternatives like agent-led onboarding will fix comprehension.”** Unproven. Agent-led can increase cognitive load and annoyance. Test against contextual disclosure.

## 4. Proposed protocols/treatments

Define **low-attention protocol** as: minimal reading, recognition over recall, single-item intermittent probes, short sessions, no forced think-aloud, interruptible tasks.

| Protocol | Design | Measures | Proposed falsifier |
|---|---|---|---|
| **FECR:** First-Exposure Capability Recognition | 5 min free use on physical Quest. At 0:30, 2:00, 5:00, show one forced-choice: “Which can Nemosyne do? A/B/C/D/None.” Include true and false capabilities. | Recognition accuracy, false positives, confidence 1–3, response time | <80% core-capability recognition or >10% false positives |
| **CCT:** Capability Card Task | After 10 min, sort 12 cards: “can now / not sure / cannot.” | Correct sort, “not sure” rate, agreement | <70% correct for core capabilities or >15% “not sure” |
| **BDT:** Behavioral Discoverability Task | Prompt: “Make Nemosyne help you do X” without naming how. 3 min max. | Unaided success, time-to-first-correct-action, errors, help requests | <70% unaided success or median time >120 s |
| **EMA Comfort** | During 20 min physical Quest session, 3 random haptic/audio prompts: “Comfort now 1–5.” | Comfort trend, dropout, headset removal/repositioning | >20% report <3 at 20 min or >10% dropout |
| **SSQ/VRSQ/CSQ** | Pre/post session, plus short NASA-TLX if needed. | Sickness, comfort, workload | Clinically meaningful increase in >20% of participants |
| **Physical Quest stress** | 30 min worst-case scene on physical Quest. | 99th percentile frame time, thermal throttle, tracking loss, battery drain, controller latency | 90 Hz target: 99th >11.1 ms; >20% throttle after 15 min; tracking loss >1/min; battery drain >20%/30 min |
| **Simulator vs physical paired** | Same build/tasks in simulator and physical Quest. | Discrepancy in discoverability, comfort, performance | If simulator passes but physical fails, simulator cannot promote claim |

**Evidence-tier handling:** FECR/CCT/BDT/EMA/SSQ are T1–T2. Quest telemetry is T3. Simulator comparisons are T0/T3 diagnostic only.

## 5. Decisive experiments

1. **E1 — Onboarding A/B/C/D:** no tutorial vs explicit capability list vs contextual diegetic cues vs agent-led prompts. Primary: BDT success + FECR recognition. UXR5: n≈32/arm. Falsify discoverability if no arm reaches ≥70% unaided success and ≥80% core recognition.
2. **E2 — Low-attention vs high-attention:** recognition vs recall for same capabilities. Falsify if high-attention passes but low-attention fails; current claims are invalid for real low-attention use.
3. **E3 — Simulator vs physical Quest paired:** same tasks, same build. Falsify any simulator-to-physical promotion if physical fails.
4. **E4 — Comfort dose-response:** 10/20/40 min sessions. Falsify comfort claim if >20% report moderate+ discomfort at 20 min or if SSQ increases clinically.
5. **E5 — Quest qualification stress:** 30 min worst-case physical Quest. Falsify if frame time, thermal throttle, tracking loss, or battery drain exceeds pre-registered limits.
6. **E6 — 24 h retention:** repeat FECR/CCT after 24 h. Falsify durable comprehension if recognition drops >20%.
7. **E7 — False affordance probe:** show non-existent capabilities. Falsify comprehension if >10% believe Nemosyne can do them.

**Governing criteria must be pre-registered before data collection.** No post-hoc threshold moving.

## 6. Risks

- Low-attention protocols are noisier; need pre-registration and multiple measures.
- Small samples and Quest hardware variability can produce false confidence.
- Subjective comfort is not enough; objective metrics are not comfort. Use both.
- Ethical risks: motion sickness, hygiene, accessibility, fatigue.
- Evidence-tier contamination: simulator/model results leaking into human/physical claims.
- Over-reliance on self-report or expert comfort.
- Capability taxonomy may be unstable across builds.
- Novel alternatives may not be testable cheaply or may harm immersion.

## 7. Prior art to verify

- **VR onboarding/discoverability:** Oculus First Contact, The Lab, Job Simulator, SteamVR tutorial; research on VR discoverability, diegetic UI, affordances, progressive disclosure.
- **Comfort:** Simulator Sickness Questionnaire (Kennedy et al.), Virtual Reality Sickness Questionnaire (Kim et al.), Comfort Rating Scale, NASA-TLX, Presence Questionnaire.
- **Quest qualification:** Meta Quest performance guidelines, VRC, OVR Metrics Tool, thermal throttling and tracking-loss documentation.
- **Low-attention methods:** ecological momentary assessment, experience sampling, micro-surveys, single-item measures, recognition vs recall.
- **Standards:** ISO 9241-11, ISO 9241-210, ISO 25010, WCAG/XR accessibility guidance.
- **Memory/Nemosyne:** method of loci, VR memory palace studies, mnemonic VR applications.
- **AI capability discoverability:** AI onboarding, feature discovery, progressive disclosure.

Verify exact thresholds and methods before citing as authority.

## 8. Recommended next engineering decision

**Halt capability expansion. Freeze a capability taxonomy: 3 core capabilities and 3 explicit non-capabilities. Run a physical Quest UXR1 low-attention gate before any UXR5 or Quest-qualified claim.**

Recommended gate:

1. **UXR1 formative:** physical Quest, n≈12. FECR + BDT + EMA comfort. Goal: find comprehension and comfort breakdowns.
2. If discoverability/comprehension fails (<70–80% thresholds), pivot to contextual capability reveal—diegetic capability compass or just-in-time agent prompts—and retest. Do not add features.
3. **Quest qualification:** switch to physical-first staged gates:
   - Simulator/desktop: logic/layout smoke only.
   - Physical Quest telemetry: performance, thermal, tracking, battery.
   - Physical Quest human: discoverability, comprehension, comfort, adverse events.
4. **UXR5 summative:** only after UXR1 passes and thresholds are pre-registered. Simulator/model evidence cannot promote UXR5.

**Decision:** No human/physical claim—discoverability, comprehension, comfort, or Quest qualification—until physical Quest human data passes pre-registered gates. Because users may still not understand what Nemosyne can do, the first gate is capability comprehension, not feature usage.