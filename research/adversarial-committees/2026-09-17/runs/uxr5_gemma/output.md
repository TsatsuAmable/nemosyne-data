**To: Nemosyne Engineering / Product**
**From: Independent Adversarial Research Committee**
**Subject: UXR1/UXR5 Adversarial Audit: Human-Physical Interaction & Discoverability**

---

### 1. Problem: The "Capabilities Gap"
The core hypothesis under attack is that current onboarding and interaction patterns sufficiently convey Nemosyne’s utility to a human user. 

**Observation:** There is a persistent delta between the system's technical capability (what it *can* do) and the user’s mental model (what they *think* it can do). If users do not intuitively grasp the system's scope, the interaction comfort is irrelevant because the "activation energy" to utilize the system remains too high. We suspect the current "qualification strategy" for Quest hardware focuses on technical stability rather than cognitive accessibility.

### 2. Competing Approaches
*   **Guided Discovery (Current/Implicit):** Relying on tutorials or specific trigger prompts to lead users to capabilities.
*   **Ambient Signaling (Alternative):** Using peripheral visual/auditory cues that signal "availability" or "contextual relevance" without requiring direct attention.
*   **Constraint-Based Exploration (Alternative):** Intentionally limiting initial features to force mastery of core primitives before expanding the capability set (Preventing cognitive overload).
*   **Direct Manipulation (Alternative):** Moving away from command-based interaction toward physical metaphors that naturally map to the system's functions.

### 3. Strongest Counterarguments
*   **The "Power User" Fallacy:** "The target audience is technically proficient and will explore the feature set independently." (*Rebuttal: Technical proficiency $\neq$ intuitive UX; discovery overhead kills adoption.*)
*   **The "Simulator Proxy" Claim:** "Simulator tests show users find the buttons/menus quickly." (*Rebuttal: Simulator evidence is void regarding physical Quest ergonomics, vestibular comfort, and cognitive load in a noisy physical environment.*)
*   **The "Onboarding" Defense:** "We have a tutorial that explains the capabilities." (*Rebuttal: Tutorials are an admission of discoverability failure. Knowledge $\neq$ Intuition.*)

### 4. Proposed Protocols & Treatments
To isolate physical/human evidence from simulator noise, we propose **Low-Attention Human Protocols (LAHP)**.

**Treatment A: The "Zero-Instruction" Baseline**
*   User is placed in the Quest environment. No tutorial. No verbal guidance.
*   Task: Achieve [X] capability using only environmental cues.
*   Measure: Time to first successful attempt; number of "dead-end" interactions.

**Treatment B: The "Cognitive Load" Stressor**
*   User performs a secondary physical task (e.g., sorting objects) while Nemosyne is active.
*   Task: Respond to a system capability trigger.
*   Measure: Latency of response; subjective "intrusion" score (1-10).

**Treatment C: The "Physicality" Audit**
*   Compare interaction comfort across different physical postures (seated, standing, pacing).
*   Measure: Physical fatigue/strain markers; frequency of "missed" gestures.

### 5. Decisive Experiments (Falsifiers)
These experiments are designed to falsify the claim: *"Users understand and are comfortable with Nemosyne’s capabilities."*

*   **The Blind Capability Mapping Test:** After 30 minutes of use, users are asked to list everything the system *can* do.
    *   *Falsification Trigger:* If $\text{User-Identified Capabilities} < 60\%$ of $\text{Actual Capabilities}$, the discoverability claim is falsified.
*   **The "Comfort-to-Utility" Ratio:** Users are asked to perform a complex task.
    *   *Falsification Trigger:* If users opt for a slower, "clunkier" manual method over a faster Nemosyne feature, the "interaction comfort" claim is falsified.
*   **The Physical/Simulator Delta:** Run the same task in simulator vs. Quest hardware.
    *   *Falsification Trigger:* If success rates drop by $>20\%$ on physical hardware, the simulator is proven to be a misleading authority on human capability.

### 6. Risks
*   **Participant Fatigue:** High-intensity testing may lead to artificial frustration.
*   **Hardware Variance:** Differences in Quest strap/fit may skew "comfort" data.
*   **Confirmation Bias:** Researchers may prompt users toward the "right" answer. (Mitigation: Strict scripts; silent observers).

### 7. Prior Art to Verify
*   **Fitts's Law (Human-Computer Interaction):** Verify if interaction targets are sized/placed for Quest controller/hand-tracking reality.
*   **The "Gulf of Execution" (Don Norman):** Analyze the gap between the user's goal and the means to execute it within Nemosyne.
*   **Vestibular-Ocular Reflex (VOR) studies:** Review Quest-specific nausea/comfort triggers related to head-movement and UI stability.

### 8. Recommended Next Engineering Decision
**Freeze feature expansion and implement a "Discoverability Sprint."**

Before adding new capabilities, engineering must implement **Contextual Affordances**—visual or haptic cues that appear only when a capability is relevant to the user's current state. Success should be measured not by "feature completion," but by the **Reduction in Time-to-Discovery** in the Zero-Instruction Baseline test.