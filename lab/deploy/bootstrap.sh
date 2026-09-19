#!/bin/sh
set -eu
profile="${1:-full}"
case "$profile" in vsl|rfl|full) ;; *) echo "usage: $0 [vsl|rfl|full]" >&2; exit 2;; esac
export NEMOSYNE_LAB_PROFILE="$profile"
docker compose -f "$(dirname "$0")/compose.yaml" up -d --build
printf 'Nemosyne Data Lab profile %s started.\n' "$profile"
