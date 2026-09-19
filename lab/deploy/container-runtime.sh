#!/bin/sh
set -eu
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  exec docker compose "$@"
fi
if command -v podman-compose >/dev/null 2>&1; then
  exec podman-compose "$@"
fi
if command -v podman >/dev/null 2>&1; then
  case "${1:-}" in
    build)
      shift; exec podman build "$@" ;;
  esac
fi
echo 'No supported Compose provider found. Docker Compose or podman-compose is required for multi-service profiles; plain Podman supports worker image build/run via worker-podman.sh.' >&2
exit 69
