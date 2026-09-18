### Adversarial Research Report: UXR3/UXR4
**Subject:** Bounded Semantic Working-Set Algorithms for Long-Duration VR
**Status:** Research Phase (Non-Implementation)

---

#### 1. The Problem: Semantic Drift and Resource Exhaustion
Current VR session architectures often treat the scene graph as a durable store of truth. In long sessions, the delta between the *intended* semantic state (the "World Model") and the *materialized* state (Three.js objects/WASM memory) diverges. Specifically:
*   **The Leakage Loop:** `userData` becomes a graveyard of stale references, preventing GC and causing semantic drift.
*   **Async Race Conditions:** Materialization requests for an object may return after that object has been evicted/collapsed, leading to "ghost" entities.
*   **The "Pop" Cliff:** Binary loading/unloading causes frame-time spikes (jank) and visual disorientation.

#### 2. Competing Approaches
*   **Approach A: Reactive Mirroring (The "Naive" Way).** Bind the Three.js scene graph directly to the state store. *Failure mode: O(N) scaling, memory leaks in `userData`.*
*   **Approach B: Virtualized Page-Based Loading.** Treat the world as a grid of spatial pages. *Failure mode: Edge-case flickering at boundaries, poor handling of non-spatial semantic dependencies.*
*   **Approach C: Bounded Semantic Working-Set (Proposed).** A tiered materialization pipeline where the "Working Set" is a sliding window of semantic intent, decoupled from the render-tree lifecycle.

#### 3. Strongest Counterarguments
*   **Overhead Argument:** Implementing a tiered materialization layer adds CPU overhead to every frame. Is the "jank" of simple loading worse than the constant cost of a management layer?
*   **Complexity Argument:** Managing "Identity Continuity" (ensuring Object A is still Object A after eviction and return) requires a robust UUID mapping that may conflict with Three.js's internal object management.
*   **The "Good Enough" Argument:** Most sessions aren't "long" enough for leakage to crash the browser before the user naturally restarts.

#### 4. Proposed Design: The Tiered Semantic Pipeline

**A. Progressive Materialization (COARSE $\rightarrow$ REFINED)**
*   **Tier 0 (Semantic Proxy):** A lightweight WASM record (UUID, Bounds, Type). Zero Three.js footprint.
*   **Tier 1 (Coarse/LOD):** Low-poly mesh/bounding box. Materialized when within the "Interest Radius."
*   **Tier 2 (Refined):** High-fidelity assets, interactive components. Materialized upon proximity or focused intent.
*   **Transition:** Use a **Hysteresis Buffer** (e.g., materialize at 10m, evict at 12m) to prevent "Zeno’s Paradox" flickering.

**B. Async Fencing & Cancellation**
*   **Epoch-Based Fencing:** Every materialization request is tagged with a `SessionEpoch`. If the object is evicted, the Epoch is incremented. Upon async return, the worker compares `RequestEpoch` vs `CurrentEpoch`. If they mismatch, the result is discarded immediately.
*   **Cancellation Tokens:** Implement `AbortController` patterns for all asset fetches to prevent queue starvation during rapid movement.

**C. Resource Telemetry & Backpressure**
*   **The Budget Controller:** A governing entity that monitors WASM linear memory and GPU VRAM.
*   **Fairness Queue:** Use a **Priority Weighted Round-Robin** scheduler for materialization. (e.g., "Objects in FOV" > "Objects behind user" > "Background Ambience").

**D. Identity Continuity & State Recovery**
*   **Strict Separation:** No durable state in `userData`. Three.js objects are treated as *disposable views*.
*   **Reconstruction:** Upon "return" from eviction, the object is re-instantiated from the WASM Semantic Store. Any session-specific state (e.g., "is the door open?") resides in the store, not the mesh.

#### 5. Decisive Experiments (Falsifiers)
*   **The "Teleport Stressor":** Rapidly teleport the user between distant coordinates for 10,000 iterations. 
    *   *Falsifier:* Memory usage increases linearly (leak) or frame time spikes $\geq 16ms$ (starvation).
*   **The "Identity Swap":** Evict an object and immediately re-materialize it while an async load for the first instance is still pending.
    *   *Falsifier:* Two instances of the same UUID appear in the scene.
*   **The "Memory Ceiling" Test:** Set a hard WASM memory limit. Flood the session with high-poly assets.
    *   *Falsifier:* The system crashes instead of progressively downgrading to Tier 0 (Semantic Proxies).

#### 6. Risks
*   **WASM/JS Bridge Bottleneck:** Constant communication between the Semantic Store (WASM) and Three.js (JS) may become the primary bottleneck.
*   **Race to Bottom:** If the "Coarse" tier is too low-quality, the visual transition to "Refined" will be jarring, breaking immersion.

#### 7. Prior Art to Verify
*   **Nanite (Unreal Engine 5):** For virtualized geometry and continuous LOD.
*   **React-Three-Fiber (R3F) Reconciliation:** For understanding how declarative state maps to imperative scene graphs.
*   **LRU-K Cache Algorithms:** For optimizing the "Working Set" eviction logic.

#### 8. Recommended Next Engineering Decision
**Decision:** Implement a **Proof-of-Concept Epoch-Based Fence** for async materialization. 
Before building the full tiered system, we must prove that we can effectively cancel and discard "stale" async loads without leaving dangling references in the JS heap. This addresses the highest risk (memory leakage) before optimizing for the lowest risk (visual popping).