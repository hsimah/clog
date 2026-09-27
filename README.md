# Clog (Cave Log)

## Standalone SQLite development

This feature branch is moving Clog to **nginx + PHP-FPM + SQLite**. Start with
[the hosting and deployment guide](hosting/README.md). The standalone archive
includes its dependencies; no Composer commands are needed. Use
`scripts/test-standalone.sh` and `scripts/package-standalone.sh`.

The WordPress instructions below describe the previous architecture and are kept
for reference during the migration. The frontend now uses standalone authentication.

---

Clog is a React‑powered inventory management frontend that lives inside a WordPress plugin. The repo contains both the client application (`client/`) and the plugin/theme code under `server/`.

---

## Requirements

A container runtime is the only hard requirement — WordPress, PHP, MySQL, Redis and
Node all run inside containers, so nothing needs to be installed on the host.

- **Podman** (rootless, no daemon) plus a compose CLI — on Fedora:
  ```bash
  sudo dnf install docker-compose
  systemctl --user enable --now podman.socket
  ```
  *or* **Docker Engine / Docker Desktop** with Compose v2. `scripts/dev.sh` detects
  whichever is present and wires up the socket for you.
- A `.env` file at the project root. `scripts/dev.sh` creates one from
  `.env.example` on first run.
- **Node.js 22+** is optional, and only needed if you want to run the client build or
  the Playwright e2e suite directly on the host rather than in the `client` container.

---

## Repository layout

```
/                       # project root
  client/               # React/Vite SPA (frontend)
  server/               # WordPress plugin (`plugins/clog`) and themes
  .docker/wordpress/    # WordPress image: WP-CLI, Redis ext, first-run install script
  .docker/php/          # PHP 8.3 build image: composer and the eleph commands, no service
  docker-compose.yml    # brings up WordPress, MySQL, Redis, Mailpit, PhpMyAdmin, and the client dev server
  scripts/dev.sh        # single entry point for the dev stack (up/down/logs/reset/wp)
  scripts/php.sh        # single entry point for build-time PHP (composer, eleph)
  .env.example          # committed template for .env
  .env                  # local environment (ignored by git)
  CLAUDE.md             # coding conventions / developer handbook
  README.md             # this file
```

---

## Development setup

1. **Start everything**

   ```bash
   scripts/php.sh composer install --no-interaction --prefer-dist
   scripts/dev.sh up
   ```

   Install the locked PHP dependencies before activation. The dev script picks a container runtime, starts the podman
   socket if that is what you have, creates `.env` from `.env.example` if it is
   missing, and brings the stack up. On first run WordPress installs itself,
   activates the `clog` plugin from the bind-mounted `server/` directory, and
   installs WPGraphQL and WP-Redis (see
   `.docker/wordpress/entrypoint.sh`).

   Other subcommands:

   | Command | Effect |
   | --- | --- |
   | `scripts/dev.sh up` | Build and start the stack |
   | `scripts/dev.sh down` | Stop the stack, keeping data |
   | `scripts/dev.sh logs wordpress` | Follow a service's logs |
   | `scripts/dev.sh status` | List running services |
   | `scripts/dev.sh wp plugin list` | Run WP-CLI in the WordPress container |
   | `scripts/dev.sh shell` | Bash shell in the WordPress container |
   | `scripts/dev.sh reset` | **Destructive** — drop the DB and WP install, then reinstall clean |

   In VS Code the stack starts automatically on folder open via
   `.vscode/tasks.json`; the same tasks are available from the command palette. In
   Emacs, `M-x compile RET scripts/dev.sh up` does the same thing.

   The container set includes:
   - MySQL database (`db`)
   - Redis cache (`redis`)
   - WordPress site with the `clog` plugin mounted (`wordpress`)
   - PhpMyAdmin (`phpmyadmin`)
   - Mailpit SMTP/HTTP viewer (`mailpit`)
   - Vite dev server for the client (`client`)

2. **The frontend**

   The `client` service already runs Vite on http://localhost:3100 with `client/src`
   and `client/public` bind-mounted, so hot reload works against the files in your
   editor with no host-side Node install.

   If you would rather run it on the host (for example to use an IDE's Node
   integration), stop that service and run it yourself:

   ```bash
   scripts/dev.sh down client
   cd client && npm install && npm run dev
   ```

   The browser uses same-origin GraphQL and WordPress cookies. Vite proxies
   `/graphql`, `/wp-admin`, `/wp-login.php` and `/wp-includes` to WordPress.
   Set `WP_PROXY_TARGET` to the WordPress origin when running Vite on the host
   (default `http://localhost:8180`); Compose uses `http://wordpress` internally.
   The old `VITE_GRAPHQL_URL` variable remains a proxy-target fallback for tests.

3. **Access the app**

   - **Frontend:** http://localhost:3100/clog
   - **WordPress admin:** http://localhost:8180/wp-admin (use credentials from `.env`)

   Clog uses separate host ports from Toroid, so both stacks can run together:

   | Service | Host port |
   | --- | --- |
   | Client | 3100 |
   | WordPress | 8180 |
   | phpMyAdmin | 8181 |
   | MySQL | 3406 |
   | Redis | 6479 |
   | Mailpit web / SMTP | 8125 / 1125 |

   Container-to-container connections keep their standard ports. Vite still
   listens on port 3000 inside its container; standalone Playwright uses 3000 too.
   After pulling this change, update existing `.env` WordPress URLs from
   `localhost:8080` to `localhost:8180`, then run `scripts/dev.sh up` to recreate
   containers. Startup applies `WP_URL` to the saved WordPress home/site URLs
   without resetting the database.

   Sign in to WordPress first, or use the app's sign-in link. An expired session
   hides inventory and preserves drafts in the current tab; sign in in another tab
   and choose **Check session**. Mutations are never automatically replayed.
   Logout and account changes clear the client cache; logout warns before discarding
   drafts and notifies other Clog tabs. Session checks run before/after requests,
   on tab focus and every 30 seconds. No credentials or inventory are persisted in
   localStorage. Drafts survive same-account reauthentication only while the tab stays open.

   | WordPress user | Read inventory | Create/update/delete | Run migrations |
   | --- | --- | --- | --- |
   | Anonymous | No | No | No |
   | Signed in, without `edit_posts` (e.g. subscriber) | Yes | No | No |
   | With `edit_posts` (e.g. author/editor) | Yes | Yes | No |
   | Administrator (`manage_options`) | Yes | Yes | Yes |

   Entity policies enforce this for GraphQL, generated admin pages and CLI. CLI
   commands must name a user. Generated WordPress admin screens additionally require
   `manage_options`. The frontend's write controls will adopt the session's
   `canWrite` flag during the UI migration; the backend already enforces it.
   The session endpoint and plugin shell send private/no-store responses.
   JWT is no longer a Clog dependency; remove an already installed JWT plugin only
   after checking whether another application on the site uses it.

4. **Stopping/tearing down**

   ```bash
   scripts/dev.sh down     # stop, keep the database
   scripts/dev.sh reset    # stop and destroy the database and WP install
   ```

---

## Server: the entity build loop

The plugin uses Elephentity runtime 0.10, WordPress 0.2.3 and WPGraphQL 0.2.
Composer locks the compatible package set; runtime 0.11 is not yet supported by
these integration releases. CLI/schema and the Rust generators are development
dependencies, excluded from production installs.

```bash
scripts/php.sh composer install
scripts/php.sh composer build-generators
scripts/php.sh vendor/bin/eleph generate
scripts/php.sh composer check-generated
scripts/php.sh composer test
scripts/test-backend.sh
scripts/test-backend.sh --e2e
```

The PHP 8.3 build image includes Rust and builds on first use. The working directory
is `server/`; generated output under `server/generated/` is committed and must not
be edited by hand. Change `spec/`, regenerate, and implement new contracts under
`src/Contract/`. `check-generated` checks canonical specs, validation, generated
file drift and GraphQL conformance.

Items, locations and individual stock entries live in custom tables. The framework
owns timestamps and relationship writes. Clog derives inventory display labels in
a pre-commit contract; clients supply neither creation timestamps nor labels.
Runtime 0.10's deletion planner reads Clog's dependent edges in the wrong
direction. A narrow `DependentReadStorage` adapter corrects those reads inside
the unit of work until upstream fixes it; integration tests protect both cascades
and unrelated stock. There are no new WordPress post projections. Generated admin lists/details read
the same entities as GraphQL; the application remains the editing interface.

Signed-in users can read inventory. Writes require `edit_posts`, matching the
existing Clog menu capability. Generated admin record views require
`manage_options`. CLI reads and writes use an explicit WordPress account:

```bash
scripts/dev.sh wp clog install
scripts/dev.sh wp clog status --user=admin
scripts/dev.sh wp clog seed --user=admin
scripts/dev.sh wp clog entity list Item --user=admin
```

### Existing installations

The explicit v1-to-v2 migration has read-only `wp clog migration status` and
`wp clog migration plan` commands, followed by a guarded `run` command. It verifies
copies before an atomic table exchange and retains the originals and post links.
Follow the [upgrade and rollback procedure](server/docs/storage-upgrade.md).
For an existing installation, rehearse its actual database export and WordPress
update before replacing live inventory. The owner confirmed Clog has no real data
and is not in use, so the first rollout follows the fresh-install path (#33).
`wp clog install` handles fresh installations; it refuses existing or unsupported
storage upgrades. Normal plugin loading also detects pending upgrades without
requiring reactivation. Post/postmeta-only deployments require a separate import.

The isolated integration test uses temporary WordPress/MySQL storage and no host
ports, so it can run alongside other projects. It covers actual entity CRUD,
managed timestamps, relationships, failed updates, deletion rules, policies and
GraphQL Node/mutation identity, migration preservation and rollback. Its containers
are removed on exit.

The [GraphQL contract](server/docs/graphql-contract.md) documents paginated search,
location/item filters, stock counts, direct detail lookup, and mutation invalidation.
Use `scripts/test-backend.sh --schema` to refresh `client/schema.graphql` from
disposable WordPress, then `scripts/node.sh npm run relay:contract` to regenerate
the representative Relay query. Run `scripts/node.sh npm run relay` for application
artifacts and `scripts/node.sh npm run relay:check` to verify both sets. CI checks
the schema and artifacts for drift.

All screens use Astryx and StyleX with route-owned Relay queries and colocated
fragments. Inventory groups, location tabs, stock units and selectors paginate on
the server; dashboard and stock totals are authoritative. See the
[UI conventions](client/UI-MIGRATION.md) and [Relay data ownership guide](client/RELAY.md).

---

## Running tests

The supported checks require containers, not host PHP or Node:

```bash
scripts/php.sh composer install --no-interaction --prefer-dist
scripts/php.sh composer build-generators
scripts/php.sh composer check-generated
scripts/php.sh composer test
scripts/node.sh npm ci
scripts/node.sh npm run relay:check
scripts/node.sh npm run lint
scripts/node.sh npm run build
scripts/node.sh npx tsc -p tsconfig.e2e.json
scripts/test-backend.sh --schema
scripts/test-backend.sh --e2e
```

The last two commands use disposable WordPress/MySQL containers with no host
ports or persistent data. They supply test credentials, seed data and clean up
afterwards. Run them sequentially: all isolated checks use the `clog-backend-test`
Compose project. Browser tests cover Vite and WordPress-served compiled deep links.
Do not point this suite at production; it creates test records and the backend
migration fixture replaces its explicitly guarded test tables.

For interactive Playwright against your own development stack, set
`WP_ADMIN_USER`, `WP_ADMIN_PASSWORD` and `VITE_GRAPHQL_URL` in `client/.env`, then
run `npm run test:e2e:ui` from `client` with host Node and Playwright installed.

## Building and checking the production ZIP

```bash
scripts/node.sh npm ci
scripts/node.sh npm run build
scripts/package-plugin.sh           # optional argument: release version, e.g. 0.1.0
scripts/test-backend.sh --release
```

The ZIP is `build/clog.zip`. Packaging copies runtime source, generated manifests,
migration support and compiled assets into an isolated staging directory, installs
locked Composer dependencies with `--no-dev`, checks all manifest assets and the
separate StyleX stylesheet, and creates the archive. It leaves `server/vendor`
and the source plugin version unchanged. Build output is ignored by Git.

The release check installs that exact ZIP into a fresh disposable WordPress,
runs runtime/GraphQL and legacy migration/restore fixtures without generator
packages, then replaces the plugin from the ZIP and compares every stored row.
The owner confirmed there is no existing data, so the first rollout uses the
verified fresh-install path. For future existing-data upgrades, rehearse the actual
export and full backup restore; synthetic fixtures cannot replace that check.
See [release verification](server/docs/release-verification.md) for the evidence
and deployment gates.

---

## Environment variables

`.env.example` is the authoritative list and is committed; `.env` is gitignored.
`scripts/dev.sh` copies the template on first run, so the defaults work as-is for
local development. Every value in it is a throwaway development credential —
`WP_ADMIN_USER` / `WP_ADMIN_PASSWORD` are the wp-admin login and are also what the
Playwright suite authenticates with.

Additional environment variables may be defined in `.env.ci` or production copies; never commit secrets.

---

## Notes for Fedora / SELinux hosts

The bind mounts in `docker-compose.yml` carry `:z` labels so SELinux lets the
container read `server/` and `client/`. Under rootless podman your files appear as
`root`-owned inside the container, which is fine — WordPress only ever reads the
plugin directory. If the plugin fails to activate, check the labels with
`ls -Z server` and confirm they are `container_file_t`.

---

## Deployment

Publishing a GitHub release runs backend/schema/generation checks, client/Relay checks, Playwright and production-ZIP install/upgrade checks on GitHub-hosted runners, then attaches the exact verified `clog.zip`. A manual workflow run provides the ZIP as a downloadable artifact. The plugin update checker offers that release in WordPress; deploying to pupyrus is a manual **Update Now** action. No workflow automatically updates the production container. See `.github/workflows/deploy.yml`.

---

## Further reading

- [`CLAUDE.md`](CLAUDE.md) — internal coding rules, conventions and patterns
- `client/e2e/*` — Playwright tests and setup scripts

This README replaces the generic Vite template with instructions tailored to Clog's codebase and development workflow.
