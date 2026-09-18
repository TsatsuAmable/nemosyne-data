**To: Nemosyne Engineering / Product Leadership**
**From: Adversarial Research Committee (ARC)**
**Subject: Adversarial Audit of UXR1/UXR5 (Discoverability & Physical Ergonomics)**

---

### 1. Problem Statement
There is a critical gap between **System Capability** (what Nemosyne can do) and **User Mental Model** (what the user believes it can do). Current evidence for "discoverability" and "interaction comfort" relies heavily on simulator proxies or high-attention "guided" sessions, which mask cognitive friction. If users cannot intuit the capability without explicit instruction, the capability effectively does not exist for the general population.

### 2. Competing Approaches to Validation
*   **The "Guided Onboarding" Approach (Current Lean):** Focuses on teaching the user how to use the system. *Failure mode:* Measures the effectiveness of the tutorial, not the intuitiveness of the interface.
*   **The "Organic Discovery" Approach (Adversarial):** Places the user in a high-context environment with a goal but no instructions. *Failure mode:* High frustration/churn, but yields high-fidelity data on "blind" discoverability.
*   **The "Quantitative Heatmap" Approach:** Tracks telemetry of attempted interactions. *Failure mode:* Distinguishes *that* a user clicked something, but not *why* they clicked it or if they understood the outcome.

### 3. Strongest Counterarguments (Internal Steel-manning)
*   *“Complex capabilities require learning curves; discoverability isn't a binary state.”* $\rightarrow$ **ARC Response:** Learning curves are acceptable; "invisible" capabilities are not. We must distinguish between "hard to master" and "impossible to find."
*   *“Simulator data shows users navigate to X in Y seconds.”* $\rightarrow$ **ARC Response:** Simulator evidence is a measure of *pathfinding*, not *comprehension*. A user may find a button by accident or trial-and-error without understanding the governing criteria of the feature.

### 4. Proposed Protocols & Treatments
To prevent the "Simulator-to-Human" authority leak, all physical Quest qualification must follow **Low-Attention Protocols**.

**Protocol A: The "Cold-Start" Discovery (Low Attention)**
*   **Treatment:** User is handed a Quest device with Nemosyne active. They are given a high-level objective (e.g., "Retrieve the memory of the red book") without a manual.
*   **Constraint:** Zero verbal prompting from researchers.
*   **Measure:** Time to first *correct* interaction vs. time to first *random* interaction.

**Protocol B: The "Cognitive Load" Comfort Test**
*   **Treatment:** User performs a secondary physical task (e.g., sorting physical objects) while interacting with Nemosyne.
*   **Constraint:** Interaction must occur in the periphery of attention.
*   **Measure:** Physical strain indicators (neck angle, grip tension) and "interaction abandonment" rates.

### 5. Decisive Experiments (Falsifiers)
These experiments are designed to prove the current claims **false**.

*   **The Comprehension Falsifier:** After a 10-minute session, ask the user to describe three things Nemosyne *cannot* do. 
    *   *Falsification:* If the user cannot define the boundaries of the system, their "success" in the session was accidental/guided, not conceptual.
*   **The Quest Ergonomic Falsifier:** Measure "Interaction Fatigue" by comparing success rates at Minute 1 vs. Minute 30 of continuous use.
    *   *Falsification:* If accuracy drops $>20\%$, the "physical qualification" claim is invalidated regardless of simulator performance.
*   **The "Blind" Feature Test:** Introduce a feature that is visually consistent with others but serves a different function.
    *   *Falsification:* If users treat the new feature identically to old ones regardless of context, the system relies on "habitual clicking" rather than "conceptual discoverability."

### 6. Risks
*   **User Frustration:** Organic discovery protocols may lead to high failure rates, which can be misinterpreted as "product failure" rather than "research success."
*   **Hardware Variance:** Quest firmware updates or battery degradation may introduce noise into the physical comfort data.

### 7. Prior Art to Verify
*   **Direct Manipulation Theory (Shneiderman):** Verify if Nemosyne follows the principle of continuous representation of the object of interest.
*   **Gulf of Execution/Evaluation (Norman):** Analyze the gap between the user's goal and the system's physical affordances.
*   **Fitts's Law (VR Adaptation):** Audit target sizes for "low-attention" interaction to ensure physical comfort isn't just "luck of the draw" with hit-boxes.

### 8. Recommended Next Engineering Decision
**Stop optimizing for "Time-to-Task" in simulators. Implement a "Capability Transparency" layer.**

Before further refining the interaction model, engineering must implement a mechanism (visual or haptic) that signals *potential capability* before the user initiates an action. If the adversarial protocols prove that users are "blind" to features, the solution is not "better onboarding," but "better affordance."