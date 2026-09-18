### Adversarial Research Memo: Staircased Representation Architecture (SRA)
**Project:** nemosyne.world  
**Status:** Independent Research / Non-Authoritative  
**Scope:** Architectural Comparison (SRA vs. SWSE-0)

---

#### 1. Governing Criteria
*   **Semantic Stability:** A datum's identity must be invariant across L0 $\rightarrow$ L4.
*   **Resource Bound:** Rendering cost must be a strict function of the current level ($C_{L_n} \ll C_{L_{n+1}}$).
*   **Determinism:** Promotion/demotion triggers must be reproducible for a given resource state and attention vector.
*   **Zero-Contamination:** Experimental visual layers must not mutate the underlying durable semantic truth.

#### 2. Proposed Architecture: Staircased Rendering (SRA)

**The Core Hypothesis:** Resource expenditure should be a lagged response to perceived value, where "presence" is decoupled from "detail."

##### Representation Staircase
| Level | Representation | Cost Profile | Scheduler Type | Primary Utility |
| :--- | :--- | :--- | :--- | :--- |
| **L0** | Point/Glyph/Hash | $\mathcal{O}(1)$ | Fixed Budget / RR | Spatial presence, existence. |
| **L1** | Cluster/Bounding Box | $\mathcal{O}(\log N)$ | Cache/Value Admission | Topology, grouping, density. |
| **L2** | Labels/Edges/Schema | $\mathcal{O}(N)$ | Perceptual QoS | Basic semantic identity, linkage. |
| **L3** | Geometric/Full Mesh | $\mathcal{O}(N \cdot M)$ | Predictive/Learned | Analytical depth, precision. |
| **L4** | Interactive/Full State | $\mathcal{O}(\text{Heavy})$ | Demand-Driven | Manipulation, deep-dive edit. |

##### Scheduler Staircase
The scheduler sophistication scales with the cost of the representation it manages:
*   **L0 Scheduler:** Naive round-robin. If the buffer is full, drop the oldest/furthest.
*   **L1/L2 Scheduler:** Value-based admission. Promotes entities based on screen-space area and connectivity weight.
*   **L3/L4 Scheduler:** Predictive. Uses gaze/cursor velocity and task-context to pre-warm assets before the user "hits" the threshold.

---

#### 3. Technical Specifications (Contracts & Constraints)

*   **Promotion/Demotion Contract:**
    *   `promote(id, target_level)`: Must be atomic. The transition must occur at a frame boundary to prevent "ghosting" (partial L1/L2 state).
    *   `demote(id, target_level)`: Must preserve the "Last Known High-Fidelity State" in a dormant cache to prevent reconstruction flicker.
*   **Identity Continuity:** All levels reference a stable `EntityID` (UUID/Hash). The visual representation is a *view* projection of the identity, not the identity itself.
*   **Hysteresis/Cooldown:** To prevent "zitter" (rapid L1 $\leftrightarrow$ L2 oscillation), a temporal buffer $\Delta t$ is required. An entity must stay at $L_n$ for $X$ ms before it is eligible for demotion.
*   **Multi-Axis Budgets:**
    *   *GPU Memory Budget:* Limits total L3/L4 instances.
    *   *Draw Call Budget:* Limits total L1/L2 instances.
    *   *CPU Cycle Budget:* Limits the frequency of the Predictive Scheduler.
*   **Stale Fencing:** If a datum is updated in the durable store while in L0, the L3 cache for that datum is invalidated immediately (Fence) to prevent truthful telemetry failure.

---

#### 4. Adversarial Attack & Comparison

**Against SWSE-0 (Policy-Neutral + Late Scheduler):**
SWSE-0 treats the representation as a constant and the *scheduling* as the variable. SRA treats the *representation itself* as a variable.

| Feature | SWSE-0 Approach | SRA (Staircase) Approach |
| :--- | :--- | :--- |
| **Latency** | Low (if scheduler is fast) | Ultra-low (L0 is always ready) |
| **Cognitive Load** | Binary (Visible or Not) | Progressive (Blurry $\rightarrow$ Sharp) |
| **Memory** | Peak-load dependent | Tiered/Bounded |
| **Complexity** | Simpler logic, harder tuning | Complex logic, easier scaling |

**Failure Modes & Complexity Traps:**
1.  **The "Pop-in" Trap:** Severe visual jarring when L0 $\rightarrow$ L3 occurs too quickly, breaking immersion.
2.  **Semantic Gap:** An entity may be "useful" at L0 but "invisible" to the user because L0 is *too* cheap to be recognizable.
3.  **Scheduler Overhead:** The cost of calculating *which* entity to promote may eventually exceed the cost of just rendering L2 for everyone.

**Orthogonal Axis Proposal:**
Instead of 5 levels, consider 2 axes: **Fidelity** (L0-L4) $\times$ **Update Frequency** (Real-time $\leftrightarrow$ Static). A high-fidelity L3 object that updates once per second is cheaper than a low-fidelity L1 object updating at 60Hz.

---

#### 5. Implementation Tranche (Feature Flagged)

To avoid contaminating durable semantic truth, the SRA implementation exists as a **Visual Projection Layer** in WASM.

**Minimal Implementation Path:**
1.  **`SraManager`:** A Rust struct maintaining a `HashMap<EntityID, CurrentLevel>`.
2.  **`SraView`:** A trait implemented by all renderables:
    ```rust
    trait SraView {
        fn render_l0(&self, ctx: &Context); // Point
        fn render_l1(&self, ctx: &Context); // Box
        fn render_l2(&self, ctx: &Context); // Label
    }
    ```
3.  **`SraScheduler`:** A system that iterates through the `EntityID` list and updates `CurrentLevel` based on distance to camera and `Budget` constants.
4.  **Feature Flag:** `ENABLE_SRA_STAIRCASE`. If false, default to SWSE-0 logic.

---

#### 6. Decisive Experiments

1.  **The "Discovery" Test:** Can users find a specific entity in a million-point cloud using L0 $\rightarrow$ L2 progression faster than they can using a filtered SWSE-0 view?
2.  **The "Jank" Metric:** Measure frame-time variance ($\sigma^2$) during rapid zoom/pan. SRA should theoretically exhibit lower variance due to the budget cap.
3.  **The "Truth" Audit:** Verify that a value change in the durable store is reflected in L4 within the specified "Stale Fence" window.

**Unknowns:**
*   The exact "Tipping Point" where scheduler complexity $\approx$ rendering cost.
*   User psychological response to "progressive resolution" in a non-geographic semantic space.

**Abstention:** I abstain from selecting a winner. Evidence on cognitive friction vs. performance gain is currently missing.