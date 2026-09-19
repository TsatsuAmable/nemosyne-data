# C1 Fedora recovery qualification — 2026-09-19

Specimen: `d32cd9f0fff468573ee0d4ff3184f08fd3127cfe`

MacBook coordinator and Fedora/Yoda worker were exercised over ordinary LAN, not Tailscale. Fedora first claimed `fedora-recovery-canary` as `fedora-crash` and exited without starting/completing it. After the 3 s lease expired, independently registered worker `fedora-rebuilt` reclaimed the same job, started it, and completed with native disposition `RECORDED` and a durable evidence reference. The accompanying JSON is the persisted coordinator state captured after completion.

## Result

PASS for the narrow C1 claims exercised: LAN transport, cross-host registration/claim, expired-lease reclamation, worker replacement, and coordinator-state continuity. This does not qualify PostgreSQL, external/cloud compute, artifact-store durability, scientific correctness, or human/Quest claims.

## Environmental finding

macOS Application Firewall allowed an older Homebrew Node binary but not the active Node 26.8.2 binary. Loopback worked while non-loopback HTTP stalled. Authorizing the active Node executable restored LAN and Tailscale HTTP reachability. Deployment diagnostics must therefore identify the active Node executable and warn that host-firewall authorization may be required; they must not modify firewall policy automatically.
