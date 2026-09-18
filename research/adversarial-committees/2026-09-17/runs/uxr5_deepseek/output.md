**Committee note:** I do not have source access in this run. Treat “current main” below as a frozen-build audit target, not as inspected code. The committee recommends; it does not edit source or open PRs.

## 1. Evidence-tier rule

| Tier | Evidence | Can support |
|---|---|---|
| T0 | Code, unit tests, simulator telemetry, model output | Engineering hypotheses only |
| T1 | Expert heuristic, LLM/VLM consensus, paper analogy | Hypothesis generation, risk lists |
| T2 | Human in desktop/simulator | Early human-computer interaction hypotheses |
| T3 | Human on physical Quest, seated/short session | Limited physical/device comfort and discoverability claims |
| T4 | Human on physical Quest, standing/room-scale | Physical interaction comfort and spatial discoverability |
| T5 | Longitudinal field/EMA | Real-use comfort, comprehension durability |

**Rule:** simulator evidence cannot promote UXR1/UXR5 physical/human claims. Model consensus is not authority. The observation “users may still not understand what Nemosyne can do” is a T2/T3 signal, not a validated discoverability claim.

For this memo: **UXR1 = capability discoverability/comprehension; UXR5 = physical interaction comfort/Quest qualification.**

## 2. Problem

1. **Discoverability:** core capabilities are not obvious from the first session. Users may not know what Nemosyne can do, what is possible now, or how to invoke it.
2. **Comprehension:** even when users can act, they may not form a correct mental model of the capability set. They may confuse Nemosyne with a generic VR note tool, memory palace, AI assistant, or social space.
3. **Interaction comfort:** Quest comfort depends on weight, facial interface, IPD, heat, hygiene, controllers/hand tracking, locomotion, session length, and individual susceptibility to cybersickness.
4. **Physical qualification:** simulator telemetry can show low error rate, but cannot qualify physical Quest comfort, nausea, neck strain, controller reach, or real-world discoverability under load.

## 3. Claims, observations, governing criteria

| Type | Example | Status |
|---|---|---|
| Claim | “Nemosyne is discoverable on Quest.” | Unproven until T3+ |
| Observation | Some users do not understand what Nemosyne can do. | Signal requiring measurement |
| Governing criterion | ≥80% of new users complete 5/5 core capability tasks unaided within 10 min on physical Quest. | Proposed falsifier |
| Claim | “Quest interaction is comfortable.” | Unproven until T3/T4 |
| Observation | Simulator sessions show few errors. | T0/T2 hypothesis only |
| Governing criterion | ≤10% report moderate+ discomfort (NRS≥4) or VRSQ increase ≥10 in a 20-min seated session. | Proposed falsifier |
| Claim | “Simulator can qualify physical Quest.” | Rejected as governing authority |
| Governing criterion | Simulator-physical discordance ≤20% on primary outcomes; otherwise simulator cannot qualify. | Proposed falsifier |

## 4. Competing approaches

### Discoverability/comprehension
- **Explicit onboarding/menu:** fast comprehension, high interruption, weak presence.
- **Diegetic feedforward:** shows possible actions in-world; preserves presence, may be missed.
- **Contextual adaptive hints:** timely, reduces overload; can feel paternalistic.
- **Sandbox free exploration:** high agency; high confusion risk.
- **Conversational assistant:** natural language discovery; latency/trust issues.
- **Social/observational learning:** powerful; hard to reproduce in solo VR.
- **Progressive disclosure capability map:** balances overload and discoverability; needs testing.

### Comfort/Quest qualification
- **Seated-only conservative gate:** safest, may under-qualify room-scale.
- **Standing/room-scale with comfort options:** ecological, higher risk.
- **Hand tracking vs controllers:** different fatigue/reach/discoverability.
- **Snap turn/teleport/vignette:** reduces sickness, may harm presence.
- **Dynamic comfort governor:** adaptive breaks/session limits; needs biometric validation.
- **Staged physical gates:** T3 seated → T4 standing → T5 field. Recommended.

## 5. Strongest counterarguments

1. **Discoverability may not require knowing all capabilities.** Users may succeed by task-driven exploration. Counter: then measure task success, not memory of features.
2. **Comprehension tests can be artificial.** Users rarely need to recite a feature list. Counter: use signal detection plus teach-back and task prediction, not trivia.
3. **Comfort is task- and person-dependent.** A 10-min lab study cannot qualify long-term use. Counter: staged gates and longitudinal EMA.
4. **Physical Quest qualification may be premature** if core interaction is unstable. Counter: that is an argument for T3 seated gates first, not for simulator promotion.
5. **Simulator may be sufficient for some claims** such as layout contrast or UI hierarchy. Counter: accepted only for non-physical, non-human claims; never for nausea, neck strain, or real-world discoverability.
6. **Low-attention protocols lack sensitivity.** Counter: pair them with passive telemetry and a few decisive probes; use higher-attention tests only for falsification.
7. **Thresholds are arbitrary.** Counter: pre-register them, justify from prior art, and treat them as governing criteria, not truth.

## 6. Proposed low-attention human protocols/treatments

### A. Unaided Capability Discovery — UCD-1
**Question:** Can new users discover core capabilities without instruction on physical Quest?  
**Design:** Between-subject, N≈36/arm. Arms: current main, explicit capability map, diegetic feedforward + contextual hints. No researcher help unless user asks.  
**Tasks:** 5 core capabilities frozen from current main.  
**Measures:** time-to-first-success, success rate, error rate, help requests, controller/gaze path efficiency.  
**Low-attention element:** observer does not prompt; think-aloud only at end.  
**Falsifier:** <70% success on 4/5 tasks within 10 min, or median time-to-first-success >3 min for any core capability.

### B. Capability Comprehension Signal Detection — CCSD
**Question:** Do users form a correct mental model, or just guess?  
**Design:** After 5 min exposure, show 20 statements: 10 true capabilities, 10 plausible false ones.  
**Measures:** d′ and criterion; 60-second teach-back coded for core capabilities.  
**Falsifier:** d′ < 1.0, or teach-back misses >2 core capabilities, or false-alarm rate >30%.

### C. Low-Attention Dual-Task Probe — LADTP
**Question:** Does comprehension survive under task load?  
**Design:** During normal use, every 2 min an auditory probe asks: “What can you do here?” or “How would you do X?” User answers with controller/micro-response.  
**Measures:** probe accuracy, response time.  
**Falsifier:** <70% probe accuracy or median RT >2 s.

### D. Physical Quest Comfort Dose-Response — PQCDR
**Question:** Is Quest interaction comfortable at target session lengths?  
**Design:** Within-subject, counterbalanced: seated 10/20/30 min; then standing/room-scale only after seated passes.  
**Objective:** VRSQ/SSQ, pain NRS, Borg CR10, HR/HRV, EDA, postural sway, head/controller kinematics, break frequency, dropout.  
**Subjective:** single-item comfort, NASA-TLX, presence.  
**Falsifier:** >20% moderate+ discomfort (NRS≥4), VRSQ increase ≥15, or any dropout due to cybersickness.

### E. Simulator-Physical Discordance — SPD
**Question:** Does simulator evidence predict physical Quest outcomes?  
**Design:** Same participants, same tasks, simulator vs Quest.  
**Measures:** primary UCD-1 and comfort outcomes.  
**Falsifier:** discordance >20% on primary outcomes. If so, simulator cannot qualify physical/human claims.

### F. Longitudinal Low-Attention EMA
**Question:** Do comprehension and comfort decay or improve in real use?  
**Design:** 2 weeks, 3×/day single-item micro-surveys plus passive telemetry.  
**Falsifier:** daily comfort <6/10 for >3 consecutive days, or capability confusion >30% of prompts.

## 7. Decisive experiments, priority order

1. **UCD-1 + CCSD on physical Quest** — falsifies discoverability/comprehension.
2. **PQCDR seated 20 min** — falsifies basic physical comfort.
3. **SPD** — falsifies simulator authority.
4. **LADTP** — falsifies comprehension under load.
5. **Standing/room-scale PQCDR** — only after seated passes.
6. **Longitudinal EMA** — only after short-session gates pass.

Pre-register: primary outcomes, thresholds, exclusion criteria, build hash, Quest model/firmware, IPD, strap, facial interface, hygiene protocol.

## 8. Risks

- Cybersickness harm, falls, neck/back strain, eye strain.
- Biometric/eye-tracking privacy.
- Recruiting VR-savvy, young, male, healthy participants.
- Order/learning/fatigue effects.
- Hardware variability: Quest 2/3/Pro, firmware, IPD, hygiene.
- Simulator confounds: FOV, latency, tracking, resolution.
- Subjective scales noisy; objective biometrics confounded.
- Model consensus contaminating expert judgment.
- Overgeneralizing lab to home.
- Claim inflation: “no adverse events in 10 min” becomes “comfortable for all.”

## 9. Prior art to verify

- Affordances/signifiers: Gibson 1979; Norman 1988.
- Discoverability/recognition: Nielsen 1993.
- Feedforward: Djajadiningrat et al. 2002.
- VR onboarding: Oculus/Meta “First Steps,” Valve “The Lab,” Owlchemy “Job Simulator.”
- Cybersickness: Kennedy et al. 1993 SSQ; Kim et al. 2018 VRSQ; Golding 1998 MSSQ.
- Workload/pain: Hart & Staveland 1988 NASA-TLX; Borg 1982 CR10.
- Presence/usability: Witmer & Singer 1998; Schubert et al. 2001 IPQ; Brooke 1996 SUS.
- Low-attention field methods: Shiffman et al. 2008 EMA; Csikszentmihalyi & Larson 1987.
- Signal detection/teach-back: Macmillan & Creelman 2005; AHRQ teach-back.
- Standards: ISO 9241-210/410; W3C XR Accessibility User Requirements.
- Simulator vs physical: transfer-of-training and simulator-sickness literature; do not equate simulator sickness with VR sickness.

## 10. Recommended next engineering decision

**Do not promote any UXR1/UXR5 physical/human claim from simulator evidence.** Label all discoverability/comfort claims as “simulator-hypothesis only” until T3+ human evidence exists.

**Next decision:** freeze current main, build the capability inventory, and run UCD-1 + CCSD + seated PQCDR on physical Quest. Engineering should prepare a **capability map + contextual feedforward** hybrid as the experimental condition, behind a flag, not as validated main.

**Pass criteria before promoting:**
- UXR1: ≥80% unaided discovery of 5 core capabilities; d′ ≥1.5; LADTP ≥70%.
- UXR5: ≤10% moderate+ discomfort; VRSQ increase ≤10; no dropout due to cybersickness; SPD discordance ≤20%.
- Escalate to standing/room-scale only after seated gate passes.

If any gate fails: fall back to explicit menu/task-based onboarding for UXR1; redesign locomotion, FOV, session length, or ergonomics for UXR5. Do not merge “validated” claims from simulator runs.