# Clog (Cave Log)

Clog tracks items, storage locations, and individual stock units. The React client
uses tsquid, Relay, and Astryx; the PHP application uses Elephentity, GraphQL, and SQLite.
The app serves Overview at `/`, with inventory, items, and locations at their own
root routes. Authentication uses local accounts, cookies, and CSRF tokens.

## Develop locally

Install Podman or Docker. The wrappers provide PHP 8.3, Composer, Rust generators,
and Node 22 without installing those toolchains on your host.

```sh
scripts/php.sh composer install --no-interaction --prefer-dist
scripts/php.sh composer build-generators
scripts/node.sh npm ci
scripts/node.sh npm run build
scripts/standalone-dev.sh install
```

Create a local account; the password is read from stdin:

```sh
bash -c 'read -r -s -p "Local password: " CLOG_NEW_PASSWORD; printf "\n"; printf "%s" "$CLOG_NEW_PASSWORD" | scripts/standalone-dev.sh user:add admin editor --admin'
scripts/standalone-dev.sh serve
```

Open <http://localhost:18473/auth/login>. Stop the server with Ctrl+C.
Local databases and sessions live in ignored `.standalone/`; `install` preserves
existing supported databases. Use `reader` for a read-only account. `--admin` lets
the account manage users from the account menu; grant an existing account with
`scripts/standalone-dev.sh user:admin USERNAME`. See the
[setup guide](hosting/README.md#run-locally) for fish shell instructions and Vite.

Signed-in users can open the avatar menu and choose **Change password** or
**Sign out**. Changing a password requires the current password and a new password
of 12–72 bytes. Both readers and editors can change only their own password;
existing sessions remain signed in.

### Test initial route data locally

The client pins the published tsquid runtime and codegen to `0.2.0`; the server
uses Elephentity's tsquid `0.1.0` generator and PHP runtime.
After the normal setup, build and start the PHP server with initial data enabled:

```sh
scripts/node.sh npm ci
scripts/node.sh npm run build
CLOG_SSR=1 scripts/standalone-dev.sh serve
```

Sign in at <http://localhost:18473/auth/login> and open `/`. The HTML contains
`#tsquid-data` with the real `HomePageQuery` response for the signed-in viewer;
the Network panel should show no POST for that operation. Every declared route
inlines its page query, with URL filters and GraphQL defaults. Detail queries and
inventory helpers still fetch normally, as does `/auth/session`. Without
`CLOG_SSR=1`, all routes fetch normally.
Use the PHP-served compiled app on port 18473; Vite's HTML does not inline data.

After changing queries or routes, regenerate in this order and commit the outputs:

```sh
scripts/node.sh npm run relay
scripts/node.sh npm run routes
scripts/php.sh vendor/bin/eleph generate
scripts/node.sh npm run build
```

Relay writes `client/persisted_queries.json` with query text; tsquid resolves it
into `routes.manifest.json`; Elephentity compiles that into signed
`server/generated/tsquid/tsquid-manifest.php`. SSR route matching reads compiled
PHP on requests. Enable the SSR checks against a disposable database with:

```sh
CLOG_SSR=1 scripts/test-standalone-browser.sh e2e/tsquid.spec.ts
```

## Verify and package

```sh
scripts/php.sh composer check-generated
scripts/php.sh php standalone/tests/export-schema.php --check
scripts/node.sh npm run check
scripts/test-standalone.sh
scripts/test-standalone-browser.sh
scripts/package-standalone.sh
scripts/php.sh php standalone/tests/package.php
```

Backend and browser tests use disposable databases. The browser suite exercises
the compiled app, sessions, CRUD, stock pagination, scanner cleanup, responsive
layouts, and deep links. It does not use the developer's database.

The release artifact is `build/clog-standalone.tar.gz`. It includes compiled
assets and locked production dependencies; the target host needs PHP 8.3+ with
PDO SQLite and mbstring, and a web server. Composer and Rust are build tools only.
CI verifies the exact archive before the release workflow attaches it to a GitHub
release. Deployment is managed externally. See the [hosting guide](hosting/README.md)
for example nginx/PHP-FPM configuration, account creation, updates, and backups.

## Repository

- `client/`: React UI, generated Relay artifacts, and Playwright tests.
- `server/spec/`, `server/generated/`: entity definitions and signed generated code.
- `server/src/`: application policies, queries, and runtime assembly.
- `server/standalone/`: HTTP server, sessions, SQLite setup, CLI, and backend tests.
- `scripts/`: container tool wrappers, verification, and packaging.
- `hosting/`: optional configuration templates and operator documentation.

See [dependencies](server/docs/dependencies.md), the [GraphQL contract](server/docs/graphql-contract.md),
[UI conventions](client/UI-MIGRATION.md), and [Relay conventions](client/RELAY.md).
