#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# No Composer commands: tests load the checked-in runtime and integration forks.
"$ROOT/scripts/php.sh" php standalone/tests/conformance.php
"$ROOT/scripts/php.sh" php standalone/tests/integration.php
"$ROOT/scripts/php.sh" php standalone/tests/http.php
