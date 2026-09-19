#!/bin/sh
set -eu
: "${NEMOSYNE_WORKER_API_URL:?set coordinator worker API URL}"
: "${NEMOSYNE_ARTIFACT_ENDPOINT:?set remote artifact endpoint}"
profile="${NEMOSYNE_LAB_PROFILE:-rfl}"
root="$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)"
image="${NEMOSYNE_LAB_IMAGE:-localhost/nemosyne-data-lab:local}"
command -v podman >/dev/null 2>&1 || { echo 'podman is required' >&2; exit 69; }
podman build -t "$image" -f "$root/lab/deploy/Dockerfile" "$root"
exec podman run --rm \
  -e NEMOSYNE_LAB_PROFILE="$profile" \
  -e NEMOSYNE_WORKER_API_URL="$NEMOSYNE_WORKER_API_URL" \
  -e NEMOSYNE_ARTIFACT_ENDPOINT="$NEMOSYNE_ARTIFACT_ENDPOINT" \
  "$image"
