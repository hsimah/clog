#!/usr/bin/env bash
# Local SQLite application, using the PHP development image.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMMAND="${1:-serve}"
[ "$#" -eq 0 ] || shift
mkdir -p "$ROOT/.standalone/sessions"
chmod 700 "$ROOT/.standalone" "$ROOT/.standalone/sessions"
ENGINE=podman
command -v podman >/dev/null 2>&1 || ENGINE=docker
# Ensure the development image exists for both CLI and server commands.
"$ROOT/scripts/php.sh" php -v >/dev/null
if [ "$COMMAND" != serve ]; then
    exec "$ENGINE" run --rm -i -v "$ROOT:/work/clog:z" -w /work/clog/server \
        -e CLOG_DB=/work/clog/.standalone/clog.sqlite \
        clog-php:8.3-rust php standalone/cli.php "$COMMAND" "$@"
fi
exec "$ENGINE" run --rm -p "127.0.0.1:${CLOG_DEV_PORT:-18473}:8080" \
    -v "$ROOT:/work/clog:z" -w /work/clog/server \
    -e CLOG_DB=/work/clog/.standalone/clog.sqlite \
    -e CLOG_SESSION_PATH=/work/clog/.standalone/sessions \
    -e CLOG_SSR="${CLOG_SSR:-0}" \
    -e CLOG_ORIGIN="http://localhost:${CLOG_DEV_PORT:-18473}" \
    clog-php:8.3-rust php -S 0.0.0.0:8080 standalone/public/router.php
