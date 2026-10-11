#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENGINE=podman
command -v podman >/dev/null 2>&1 || ENGINE=docker
NAME="clog-standalone-test-$$"
cleanup() {
    "$ENGINE" rm -f "$NAME" >/dev/null 2>&1 || true
    "$ENGINE" network rm "$NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT
"$ENGINE" network create "$NAME" >/dev/null
"$ENGINE" run -d --name "$NAME" --network "$NAME" --network-alias backend \
    -v "$ROOT:/work/clog:z" -w /work/clog/server \
    -e CLOG_DB=/tmp/clog-browser.sqlite -e CLOG_ORIGIN=http://backend:8080 -e CLOG_SSR="${CLOG_SSR:-0}" \
    clog-php:8.3-rust sh -c 'php standalone/tests/browser-fixture.php && exec php -S 0.0.0.0:8080 standalone/public/router.php' >/dev/null
"$ENGINE" run --rm --network "$NAME" \
    -v "$ROOT:/work/clog:z" -w /work/clog/client \
    -e CLOG_TEST_URL=http://backend:8080 \
    -e CLOG_TEST_SSR="${CLOG_SSR:-0}" \
    mcr.microsoft.com/playwright:v1.58.2-noble \
    npx playwright test -c playwright.config.ts "$@"
