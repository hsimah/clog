#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Install locked dependencies first; these tests use the published runtime packages.
"$ROOT/scripts/php.sh" php standalone/tests/conformance.php
"$ROOT/scripts/php.sh" php standalone/tests/schema-upgrade.php
"$ROOT/scripts/php.sh" php standalone/tests/integration.php
"$ROOT/scripts/php.sh" php standalone/tests/http.php
