#!/usr/bin/env bash
# Package compiled assets and production PHP dependencies without changing server/vendor.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${1:-}"
"$ROOT/scripts/php.sh" php ../scripts/package-plugin.php prepare "$VERSION"
"$ROOT/scripts/php.sh" composer install --working-dir=/work/clog/build/plugin/clog --no-dev --no-interaction --prefer-dist --optimize-autoloader
"$ROOT/scripts/php.sh" php ../scripts/package-plugin.php archive
