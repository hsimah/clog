#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
test -f client/dist/.vite/manifest.json || { echo 'Build the client with scripts/node.sh npm run build first.' >&2; exit 1; }
test -f client/dist/assets/stylex.css
mkdir -p build
# The standalone bootstrap loads only this checked-in dependency tree.
tar --exclude='server/standalone/tests' --exclude='server/generated/wordpress' --exclude='server/generated/wpgraphql' -czf build/clog-standalone.tar.gz \
    server/standalone server/generated server/src/Contract server/src/Query \
    server/src/Runtime/RuntimeFactory.php server/src/Runtime/Container.php \
    server/src/Runtime/DependentReadStorage.php client/dist hosting
printf '%s\n' "$ROOT/build/clog-standalone.tar.gz"
