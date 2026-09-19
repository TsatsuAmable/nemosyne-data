#!/bin/sh
set -eu
printf 'host=%s\n' "$(hostname)"
printf 'node=%s\n' "$(command -v node 2>/dev/null || echo missing)"
printf 'node_version=%s\n' "$(node --version 2>/dev/null || echo missing)"
printf 'docker=%s\n' "$(command -v docker 2>/dev/null || echo missing)"
printf 'podman=%s\n' "$(command -v podman 2>/dev/null || echo missing)"
printf 'podman_compose=%s\n' "$(command -v podman-compose 2>/dev/null || echo missing)"
case "$(uname -s)" in Darwin) printf '%s\n' 'note=macOS incoming coordinator traffic may require Application Firewall authorization for the active Node executable';; esac
