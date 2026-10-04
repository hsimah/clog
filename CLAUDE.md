# Clog Codebase Rules

Clog (Cave Log) tracks items, flat storage locations and individual stocked units.
The React/TypeScript client lives in `client/`; the standalone PHP application is
in `server/standalone/`, using generated entities under `server/generated/`.

## Deployment

- Deployment is managed externally. The app uses PHP and local SQLite;
  `hosting/README.md` supplies optional nginx/PHP-FPM examples, not production steps.
- Production (`clog.hsimah.com`) is deployed by [the-loft](https://github.com/hsimah/the-loft),
  which owns its Compose services, networking, backups and rollback; see its
  `docs/services/clog.md`. Do not give production systemctl or `/opt/clog` steps.
- Release handoff: merge to `main` and publish a GitHub release tagged `X.Y`;
  `release.yml` re-verifies and attaches the archive. In the-loft, pin the version, URL
  and attached asset's sha256 in `hosts/viking/clog-release.json`, then test the archive
  with its `tests/clog-runtime.py`. The operator pulls on Viking and runs
  `loft-ctl deploy clog --plan`, then `loft-ctl deploy clog`, which stops writes, backs
  up, runs `install` and restarts. One-off CLI commands (`user:admin`, `backup`) use
  the-loft's `clog-cli` Compose service.
- Build off-device. `scripts/package-standalone.sh` stages source and compiled assets,
  installs the production Composer lock in isolation, and produces
  `build/clog-standalone.tar.gz`. Never strip the working `server/vendor`.
- Releases upload the same archive that passed the standalone workflow. No workflow
  automatically changes the host. Keep hostnames and infrastructure outside application code.
- The deployed host needs neither Composer nor Rust. Dependencies are included in the archive.

## Client conventions

- Read `client/AGENTS.md`, `client/docs/ui-standards.md`, `client/UI-MIGRATION.md`,
  and `client/RELAY.md` before changing client flows.
- Use Astryx component props and layout primitives first, then StyleX. Consult
  `scripts/node.sh npx astryx component <Name>` for the installed API. Do not
  reintroduce Tailwind utilities or local copies of Astryx components.
- Compose Astryx Card with Layout header/content/footer slots and its section
  components. Button takes `label`; controls own accessible labels.
- Use relative imports and entity-owned public modules. Follow tsquid module
  naming, declaration order, and architecture checks. Import types with `type`;
  never use `any`.
- Routes own Relay query references; components read colocated fragments. Generated
  response types are authoritative. Do not duplicate entity models or load whole
  collections into global context. Commit generated artifacts with their operations.
- Preserve distinct loading, empty, missing-record and retryable error states.
- Forms keep local state, disable pending writes, preserve input after errors, and
  never automatically replay uncertain mutations. Respect `canWrite`.
- Stock actions belong in the detail panel. Tables expose expansion and details
  navigation. Paginate groups and units independently; use server totals.
- Declare routes in `client/routes.json`. Tsquid entrypoints preload Relay queries;
  generated URI builders and active route contexts own URL state. WorkspaceContext
  supplies refresh/close actions and typed detail paths. Inventory edits stay inside
  `/inventory` and retain filters. NavigationLink preloads destinations on hover and
  focus. Overview lives at `/`.
- Put narrow-screen panels before lists, constrain wide-screen panels, and keep
  table overflow local. Focus the panel heading or first form field on entry.
- Store GraphQL dates as ISO strings; format only for presentation. Date-only
  stock edits preserve the entered calendar date as midnight UTC.
- Run `scripts/node.sh npm run check` for routes, lint, Relay, types, and builds.
  Use `scripts/test-standalone-browser.sh` for meaningful flow changes.

## Release verification

- Install locked PHP dependencies using `scripts/php.sh composer install` and build
  the generators with `scripts/php.sh composer build-generators`.
- Run `scripts/php.sh composer check-generated`, the standalone tests, Relay
  validation, lint, client build and standalone browser tests.
- Package with `scripts/package-standalone.sh`, then run
  `scripts/php.sh php standalone/tests/package.php` against that exact archive.
- SQLite prototype databases may now contain real test inventory/accounts. Preserve
  data: `install` explicitly upgrades versions 1–3 to version 4; never reset storage
  during routine development or package updates. Migration tests use disposable databases.

## Git workflow

Use feature branches and descriptive conventional commits. Keep generated code,
source and tests together; never hand-edit generated/vendor files.

## Elephentity runtime foundation

- Use published `elephentity/sqlite` and `elephentity/graphql` packages. The latter's
  repository is `elephentity-graphql-php`. Runtime is 0.11.1 with integration adapters at alpha.2;
  see `server/docs/dependencies.md` for the release set.
- `server/composer.lock` is authoritative. No vendored forks, Composer aliases, or
  patched dependency source. Alpha stability is allowed only for the new packages.
- Specs and signed generated files are authoritative. Targets are `php`, `sqlite`
  and `graphql-php`; the YAML integration key is `graphql`. Run generation after
  changing specs and verify with `composer check-generated` through `scripts/php.sh`.
- Read policies require login; writes require the `inventory.write` capability.
  Application viewers map editor accounts to this capability. Keep authentication,
  HTTP/CSRF/session handling and inventory aggregate queries in Clog.
- Inventory labels and timestamps are derived/managed on the server. The generated
  schema owns entity tables; `Clog\Standalone\Schema` owns accounts and reviewed upgrades.
- Generated SQLite names already contain `app_clog_`. Do not add Database::prefix()
  to them. Application queries read table names from the generated manifest.
- Runtime 0.11.1 handles dependent deletion reads directly. Tests must protect
  cascade/restrict rules, child deletion preserving parents, and unrelated stock.
- Use `scripts/test-standalone.sh` for conformance, migration, GraphQL and HTTP tests.
- Preserve same-origin cookie/CSRF transport in `client/src/lib/session.ts`; never
  automatically replay mutations after uncertain responses or session expiry.
- All application data uses Relay. Use server-paginated searches and SQL totals;
  read `client/UI-MIGRATION.md`, `client/RELAY.md` and the GraphQL contract first.
- `SignedInUsers::allows` gates aggregates and entity reads. If adding row-specific
  access, change SQL aggregate authorization too.
