# Portable laboratory deployment

The lab is Docker Compose portable. `vsl`, `rfl`, and `full` are deployment profiles; experiments remain provider-neutral.

## Self-contained node
`./lab/deploy/bootstrap.sh rfl` builds and starts the lab plus PostgreSQL catalogue/coordination service and S3-compatible MinIO artifact service. Named volumes make this convenient for a durable single host, but a disposable cluster should not rely on those volumes.

## Ephemeral worker cluster
Point workers at externally durable services and use `compose.worker.yaml`:
```sh
NEMOSYNE_LAB_PROFILE=vsl \
NEMOSYNE_COORDINATION_URL='postgresql://...' \
NEMOSYNE_ARTIFACT_ENDPOINT='https://...' \
docker compose -f lab/deploy/compose.worker.yaml up --build
```
The external services, not the worker cluster, retain authoritative state. Provider launchers may wrap the same image for Kubernetes, Slurm or batch systems.

The current TypeScript file catalogue/CAS remain reference/local adapters. PostgreSQL/S3 environment wiring is now part of the deployment contract; concrete network adapters and schema migration are the next storage tranche before external workers may claim production durability.
