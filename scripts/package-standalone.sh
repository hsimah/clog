#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Composer is build-time only. Production receives the locked --no-dev dependencies.
"$ROOT/scripts/php.sh" php ../scripts/package-standalone.php
printf '%s\n' "$ROOT/build/clog-standalone.tar.gz"
