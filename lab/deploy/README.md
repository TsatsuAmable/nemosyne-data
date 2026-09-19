# Portable laboratory deployment

Profiles are declared in `profiles.json`: `vsl`, `rfl`, and `full`. The included container is the portable base and deliberately contains no authoritative cluster-local state.

Local smoke build:

```sh
docker compose -f lab/deploy/compose.yaml build
NEMOSYNE_LAB_PROFILE=rfl docker compose -f lab/deploy/compose.yaml run --rm lab run lab:typecheck
```

The current file catalogue/CAS are reference adapters for local execution and contract testing. External-cluster rollout must bind equivalent shared durable adapters (for example a transactional catalogue plus S3-compatible object storage) before workers are allowed to claim durable completion. Provider-specific launchers belong above this image, not inside experiment semantics.
