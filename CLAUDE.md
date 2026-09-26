# Clog Codebase Rules

Clog (Cave Log) tracks items, flat storage locations and individual stocked units.
The React/TypeScript client lives in `client/`; the WordPress plugin in `server/`.

## Deployment

- **space-needle**: The production home server, running pupyrus. CI/CD runs on GitHub-hosted runners, not on space-needle.
- **pupyrus**: The WordPress Docker container running on space-needle
- Publishing a GitHub release builds the plugin and attaches an installable zip to the release (`.github/workflows/deploy.yml`). Pupyrus is not touched automatically — its WordPress admin (`server/includes/updates.php`, backed by `yahnis-elsts/plugin-update-checker`) polls GitHub releases and shows an "Update available" prompt on the Plugins page; deploying is a manual "Update Now" click there.

## Client conventions

- Read `client/UI-MIGRATION.md` and `client/RELAY.md` before changing client flows.
- Use Astryx component props and layout primitives first, then StyleX. Consult
  `scripts/node.sh npx astryx component <Name>` for the installed API. Do not
  reintroduce Tailwind utilities or local copies of Astryx components.
- Compose Astryx Card with Layout header/content/footer slots and its section
  components. Button takes `label`; controls own accessible labels.
- Use `@/` imports. Feature components and files use PascalCase; hooks/utilities
  use camelCase. Import types with `type`; never use `any`.
- Routes own Relay query references; components read colocated fragments. Generated
  response types are authoritative. Do not duplicate entity models or load whole
  collections into global context. Commit generated artifacts with their operations.
- Preserve distinct loading, empty, missing-record and retryable error states.
- Forms keep local state, disable pending writes, preserve input after errors, and
  never automatically replay uncertain mutations. Respect `canWrite`.
- Stock actions belong in the detail panel. Tables expose expansion and details
  navigation. Paginate groups and units independently; use server totals.
- Use outlet contexts for refresh, close and detail paths. Workspace item/location
  edits must stay inside `/inventory` and retain its search parameters. RouterLink
  owns `/clog`; do not prepend that basename to app-relative links yourself.
- Put narrow-screen panels before lists, constrain wide-screen panels, and keep
  table overflow local. Focus the panel heading or first form field on entry.
- Store GraphQL dates as ISO strings; format only for presentation. Date-only
  stock edits preserve the entered calendar date as midnight UTC.
- Run Relay generation/validation, lint and builds through `scripts/node.sh`.
  Use `scripts/test-backend.sh --e2e` for meaningful flow changes.

## Git workflow

Use feature branches and descriptive conventional commits. Keep generated code,
source and tests together; never hand-edit generated/vendor files.

## Elephentity runtime foundation

- The current backend uses explicit runtime/WordPress/WPGraphQL packages, managed
  timestamps, generated edge writes, and entity-only storage (no new post projections).
- Specs and generated files are authoritative. Run `scripts/php.sh composer
  build-generators` after installing/updating generator dependencies, then generate
  and run `composer check-generated` through the same wrapper.
- Read policies require login; writes require `edit_posts`. CLI commands need an
  explicit `--user=<login>`; do not bypass policies just because WP_CLI is defined.
- Inventory labels are derived on the server. Do not send managed timestamps.
- Run `scripts/php.sh composer test` and `scripts/test-backend.sh` for backend changes.
  The latter uses disposable MySQL/WordPress containers with no exposed ports.
- Existing databases require the explicit #33 migration and a rehearsal using the
  actual deployment export. Follow `server/docs/storage-upgrade.md`. Never bypass
  a schema refusal or delete old projections to make boot pass.
- All UI uses Astryx/StyleX and all application data flows use Relay. See `client/UI-MIGRATION.md` and `client/RELAY.md`.
- Browser GraphQL requests use `client/src/lib/session.ts` with same-origin cookies
  and a fresh WordPress GraphQL nonce. Reuse this fetch transport for Relay; wire
  session-change cache disposal. Do not restore JWT
  injection/localStorage or automatically retry failed mutations.
- Use the generated `clog*Search` connections with `where` filters for paginated
  screens, and `stockCount` / `clogSummary` for totals. Never count a loaded page
  as the whole inventory. See `server/docs/graphql-contract.md` for ordering,
  cursor reset and mutation invalidation rules.
- `SignedInUsers::allows` is shared by SQL aggregate authorization and the entity
  read policy. If introducing row-specific policies, update aggregate/query
  authorization too; the current optimization relies on uniform signed-in reads.

- `NullableUpdateDatabase` preserves SQL NULL for WordPress adapter 0.2.3's generated
  UPDATE statements. Without it, clearing a barcode writes an empty string and can
  break the unique nullable index. Keep the regression test until upstream fixes
  its update compiler; never hand-edit generated/vendor files for this workaround.
