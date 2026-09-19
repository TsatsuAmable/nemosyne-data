# Deployment topology

C0 MacBook hosts control-plane services, PostgreSQL, optional artifact storage and local workers with Docker Compose.

C1 Fedora is a disposable worker while the authoritative control plane remains on MacBook. Fedora communicates through the worker API rather than connecting to PostgreSQL.

C2+ Beam, AMD and other workers use the same worker contract. The control plane can later move to persistent or managed hosting without changing experiment contracts.

PostgreSQL stores coordination/catalogue metadata and references immutable evidence. It is not an experiment store and does not own native QV or Moneta scientific dispositions.
