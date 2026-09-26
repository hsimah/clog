# Release verification

The migration is tracked in #31. All application screens now use Relay, Astryx and
StyleX; Elephentity owns runtime storage and generated GraphQL contracts.

## Automated gates

Pull requests and release builds run:

- Locked PHP installation, spec formatting/validation, generated-code drift and
  contract conformance checks, unit tests, disposable WordPress integration tests,
  and GraphQL schema snapshot comparison.
- Locked Node installation, Relay artifact validation, lint, application/browser
  TypeScript and a production Vite build.
- Playwright workflows for authentication, identity changes, query lifetime,
  item/location CRUD, nullable/leading-zero barcodes, scanner stream cleanup,
  paginated groups/units/selectors, accurate totals above 100, uncertain writes,
  workspace history and responsive panels. WordPress deep links verify the
  compiled stylesheet and bundled logo rather than only the Vite development UI.
- Packaging into `build/clog.zip` using an explicit runtime allowlist and a separate
  `composer install --no-dev` staging tree. Specs, tests and generator packages are
  not required in the ZIP. The Vite manifest and separate StyleX file are validated.
- Installing that exact ZIP in fresh WordPress, repeating runtime/query/migration
  tests against its production dependencies, replacing the plugin files, and
  checking stored IDs, values and relationships remain byte-for-byte unchanged.
  Cookie authentication, deep-route HTML and HTTP asset delivery are checked from
  that installed ZIP.

The publishing job downloads the verified ZIP artifact; it does not rebuild it.
A supplied release tag is validated and applied only to the staged plugin header.
A manual packaging workflow exposes the verified ZIP without publishing a release.

## Local evidence

Use the commands in the root README. Integration fixtures cover 125 stocked item
groups and 250 physical units; browser fixtures cover a 105-unit group, independent
page loading and authoritative dashboard counts. The synthetic old-schema fixture
checks preserved barcodes, timestamps, edges, post links and auto-increment state,
interrupted/invalid migrations, reruns, atomic restore and a second guarded upgrade.

Tests are isolated in disposable `clog-backend-test` containers with no host ports.
No automated check connects to the garage inventory. Run the suites sequentially.
The compatible Router/Vite/tooling lockfile updates report zero npm audit
vulnerabilities at verification time. The built client still emits a bundle-size
warning; lazy routes are preserved.

## Required deployment rehearsal (#33)

Before a release is offered to the garage installation:

1. Export the actual database and preserve its exact installed plugin ZIP and
   WordPress/plugin versions. Inspect table schemas, projection posts and counts.
2. Restore that backup into an isolated copy and follow
   [storage-upgrade.md](storage-upgrade.md), including the backup acknowledgement
   and maintenance-mode requirements. Do not bypass a schema refusal.
3. Install/update from the verified release ZIP. Compare every item, location and
   physical unit, barcodes, dates and relationships; test signed-in `/clog` deep
   links and writes against the restored copy.
4. Rehearse restoring the complete matching database/plugin backup before writes
   resume, then repeat the upgrade. Record the artifact checksum and results on
   #33 and #31. A plugin-only downgrade is not a database rollback.

The synthetic fixture and plugin-file replacement check cannot certify the actual
legacy deployment. #33 remains open until this export rehearsal is complete. No
production deployment has been performed. Nested locations (#26) and expiry remain
outside this release scope.
