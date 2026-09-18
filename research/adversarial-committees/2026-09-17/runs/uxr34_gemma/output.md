**MEMORANDUM**
**TO:** nemosyne.world Core
**FROM:** Adversarial Research Committee (ARC)
**SUBJECT:** UXR3/UXR4: Bounded Semantic Working-Set Algorithms for Long-Session VR
**STATUS:** Research Phase (Non-Implementation)

---

### 1. Problem Definition
The "Semantic Working-Set" problem in long-session VR is the tension between **infinite conceptual scope** (the world) and **finite hardware constraints** (VRAM, Heap, Draw Calls). Current naive implementations suffer from "linear drift," where the working set grows until a crash or stutter occurs.

**Governing Criteria:**
*   **Identity Continuity:** An object must be semantically the same after eviction and return, despite potential changes in its physical representation.
*   **Resource Boundedness:** O(1) or O(log n) memory growth relative to session duration.
*   **Latency Budget:** Materialization must not block the render loop (async fencing).
*   **Anti-Truth Constraint:** No durable semantic state (e.g., "Truth") may reside in Three.js `userData` or GPU buffers; these are treated as transient views.

---

### 2. Competing Approaches

#### A. The "LOD-Tree" Approach (Hierarchical)
Materialize high-level clusters first, then refine internals based on proximity/focus.
*   *Pros:* Fast initial load.
*   *Cons:* "Pop-in" artifacts; structural rigidity; fails if the user moves unpredictably across hierarchy boundaries.

#### B. The "Sliding Window" Approach (Spatial/Temporal)
Strict radius-based loading/unloading centered on the user.
*   *Pros:* Predictable memory bounds.
*   *Cons:* "Edge-jitter" (constant load/unload at boundary); starvation of distant but semantically critical objects.

#### C. The "Semantic Weight" Approach (Interest-Based)
Prioritize materialization based on a score: $Weight = \frac{Importance \times Focus}{Distance^2}$.
*   *Pros:* Maintains continuity of critical objects regardless of distance.
*   *Cons:* Complex weight calculation; risk of "priority inversion" where low-importance nearby objects are starved by high-importance distant ones.

---

### 3. Strongest Counterarguments
*   **Against Boundedness:** "The user's mental model is unbounded; any eviction that results in a visible state change (even momentary) breaks immersion (The 'Glitch' Argument)."
*   **Against Async Materialization:** "Fencing logic introduces race conditions where a user interacts with a proxy before the refined model arrives, leading to 'ghost interactions'."
*   **Against Semantic Weighting:** "Calculating weights for $N$ objects every frame is an $O(N)$ bottleneck that outweighs the GPU gains."

---

### 4. Proposed Design: The "Triage-Fence" Working Set

#### A. Progressive Materialization (Coarse $\to$ Refined)
Implement a three-tier state machine for every semantic entity:
1.  **Ghost (Virtual):** Entry in a Rust-side B-Tree. Zero WASM/JS overhead.
2.  **Proxy (Coarse):** Low-poly/Imposter. Allocated in a pooled Three.js buffer.
3.  **Entity (Refined):** Full geometry/materials. Unique allocation.

#### B. Async Fencing & Cancellation
To prevent "stale" materialization (loading an object the user has already left), use **Epoch-based Fencing**:
*   Each request is tagged with `EpochID`.
*   The loader checks `current_epoch == request_epoch` before committing the buffer to the scene.
*   If `current_epoch > request_epoch`, the promise is discarded immediately.

#### C. Backpressure & Fairness
Use a **Token-Bucket Scheduler** for the bridge between Rust $\to$ WASM $\to$ Three.js.
*   Max $X$ materializations per frame.
*   Priority queue: `Critical` $\to$ `Proximal` $\to$ `Background`.
*   **Starvation Prevention:** Aging mechanism—every missed frame increases the priority of a pending request.

#### D. Reconstruction after Collapse
*   **State Mirroring:** The "Truth" lives in a Rust-side ECS.
*   **Rehydration:** When a "Ghost" becomes a "Proxy," it pulls the latest state from Rust. Three.js `userData` is used only as a *pointer* (UUID) back to the Rust entity.

---

### 5. Decisive Experiments (Falsifiers)

| Hypothesis | Experiment | Falsifier (Fail Condition) |
| :--- | :--- | :--- |
| **Memory Stability** | 24-hour automated "Brownian Motion" bot traversing the world. | Memory slope $> 0$ after initial warm-up. |
| **Identity Continuity** | Rapidly toggle an object between Refined $\to$ Ghost $\to$ Refined. | State delta detected between first and second materialization. |
| **Queue Fairness** | Flood the queue with 10,000 low-priority distant objects; inject 1 high-priority nearby object. | High-priority object latency $> 2$ frames. |
| **Leak Detection** | Force 1,000 evictions/sec. | JS Heap growth or Three.js `renderer.info.memory.geometries` increase. |

---

### 6. Risks & Prior Art

**Risks:**
*   **WASM-JS Bridge Bottleneck:** Excessive serialization of "Weight" data may kill frame rates.
*   **Z-Fighting/Popping:** Switching from Proxy $\to$ Entity may cause visual flickering if not dither-blended.

**Prior Art to Verify:**
*   **Virtual Texture Mapping (Sparse Textures):** For the Coarse $\to$ Refined logic.
*   **ECS Archetype Chunking (Bevy/EnTT):** For efficient "Ghost" state management.
*   **Temporal Anti-Aliasing (TAA) History Buffers:** For smoothing the transition between materialization tiers.

---

### 7. Recommended Next Engineering Decision

**ABSTAIN from immediate implementation of a complex weighting system.**

**Decision:** Implement the **Epoch-based Fencing** and **Three-Tier State Machine (Ghost $\to$ Proxy $\to$ Entity)** first. This establishes the infrastructure for bounded memory without the overhead of a complex priority scheduler. Once memory stability is proven via the "Brownian Motion" falsifier, introduce the Token-Bucket Scheduler for fairness.