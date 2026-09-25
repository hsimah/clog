#!/usr/bin/env bash
# Match CI's Node toolchain without requiring Node on the host.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_ARGS=()
if command -v podman >/dev/null 2>&1; then
    ENGINE=podman
else
    ENGINE=docker
    USER_ARGS=(--user "$(id -u):$(id -g)")
fi
exec "$ENGINE" run --rm "${USER_ARGS[@]}" \
    -v "$ROOT:/work/clog:z" -w /work/clog/client \
    -e npm_config_cache=/tmp/npm \
    docker.io/library/node:22 "$@"
