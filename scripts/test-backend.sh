#!/usr/bin/env bash
# Disposable WordPress/MySQL integration tests; no host ports or persistent data.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE=(docker compose)
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    COMPOSE=(docker compose)
elif command -v podman >/dev/null 2>&1; then
    SOCKET="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/podman/podman.sock"
    if [ ! -S "$SOCKET" ]; then
        systemctl --user start podman.socket
    fi
    export DOCKER_HOST="unix://${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/podman/podman.sock"
    if command -v docker-compose >/dev/null 2>&1; then
        COMPOSE=(docker-compose)
    else
        COMPOSE=(podman compose)
    fi
fi
COMPOSE+=(-p clog-backend-test -f "$ROOT/server/tests/docker-compose.yml")
EXIT_SERVICE=wordpress
if [ "${1:-}" = --e2e ]; then
    COMPOSE+=(-f "$ROOT/server/tests/docker-compose.e2e.yml")
    EXIT_SERVICE=browser
fi
if [ "${1:-}" = --schema ]; then
    COMPOSE+=(-f "$ROOT/server/tests/docker-compose.schema.yml")
fi
trap '"${COMPOSE[@]}" down --volumes' EXIT
"${COMPOSE[@]}" up --force-recreate --abort-on-container-exit --exit-code-from "$EXIT_SERVICE"
