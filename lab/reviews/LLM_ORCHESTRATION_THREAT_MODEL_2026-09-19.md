# LLM Orchestration Threat Model

The LLM-facing surface is optional and non-authoritative. Initial MCP exposure is discovery, evidence query and deterministic work planning only; execution submission is intentionally absent until authenticated leases, budgets and authorization exist.

Adversarial cases that must fail closed: prompt injection embedded in datasets/evidence; fabricated run/evidence IDs; stale specimen selection; attempts to mutate criteria after results; simulator-to-human claim escalation; unknown capability suppression; runaway/expensive workload requests; evidence deletion/rewriting; secret exfiltration; conversion of INCOMPLETE/ABSTAIN into PASS; and an LLM asserting that a planned job actually ran.

Promotion condition for writable MCP tools: authenticated principal, explicit authorization scope, cost/budget envelope, idempotency key, immutable audit event, lease-backed native execution, artifact durability acknowledgement, and native disposition preservation.
