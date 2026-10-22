# Published Elephentity dependencies

Clog uses Composer packages from Packagist, installed into ignored `server/vendor`.
There are no checked-in library forks, version aliases, VCS overrides or source
patches. Commit `server/composer.lock`; it records every release and source commit.
The repository still commits signed generated PHP artifacts.

## Current release set

| Package | Locked release | Role |
| --- | --- | --- |
| `elephentity/runtime` | 0.17.0 | Runtime contracts and unit of work |
| `elephentity/sqlite` | 0.17.0 | Runtime SQLite adapter |
| `elephentity/graphql` | 0.17.0 | Runtime GraphQL integration; repository is `elephentity-graphql-php` |
| `eleph` (binary) | 0.16.1 | Spec compiler; installed by `install.sh`, not Composer |
| `elephentity/codegen` | 0.7.0 | Generator orchestrator |
| `elephentity/codegen-php` | 0.9.0 | PHP entities and contracts |
| `elephentity/codegen-sqlite` | 0.1.0-alpha.5 | SQLite manifest and initial installer |
| `elephentity/codegen-graphql-php` | 0.1.0-alpha.4 | Standalone GraphQL manifest and verifier |
| `elephentity/codegen-tsquid` | 0.2.0 | Tsquid manifest compiler and production PHP initial-data runtime |

The runtime, SQLite and GraphQL packages are released together as PHP 0.17.0. Only
`codegen-sqlite` and `codegen-graphql-php` are alpha and allow alpha stability; the
rest retain stable constraints. `webonyx/graphql-php` is the separate GraphQL engine,
currently locked at 15.38.1. Production also installs `codegen-tsquid` because
its `Eleph\Tsquid` runtime serves initial route data; Rust is needed only to build
the generators.

The `eleph` compiler is a standalone binary. `elephentity/cli` and `elephentity/schema`
were retired after 0.14.2 and cannot be installed alongside runtime 0.17. The
`.docker/php/Dockerfile` (`ELEPH_VERSION`) and `standalone.yml` pin the same release
through upstream's checksummed `install.sh`. Builders still come from Composer.

## Generation

```sh
scripts/php.sh composer install --no-interaction --prefer-dist
scripts/php.sh composer build-generators
scripts/php.sh composer check-generated
```

After editing specs, run `scripts/php.sh eleph generate` before the
check. The four targets are `php`, `sqlite`, `graphql-php`, and `tsquid`. The generic
integration key inside YAML is `graphql`. Outputs live in `server/generated`,
`server/generated/sqlite`, `server/generated/graphql`, and `server/generated/tsquid`.
Generate the client Relay artifacts and routes first; the tsquid target reads
`client/src/routes/__generated__/routes.manifest.json`. `eleph check` loads
the generated GraphQL verifier and tests its accessors against the real classes.

`project.storage.tablePrefix` is `app_clog_`, preserving the prototype's physical
table names. Do not prepend the SQLite alpha's hardcoded `Database::prefix()`
again. Clog queries obtain table names from the generated manifest.

## Application-owned behavior

Authentication, HTTP routing, role-to-capability mapping, aggregate queries, strict
entity ID checks and forward-pagination validation remain in Clog. The upstream
integration supplies the schema builder and entity resolvers.

`Schema` invokes the generated entity installer on fresh storage, then installs
Clog's users and application indexes. Version 1 prototype databases upgrade to
version 2 without rebuilding tables or changing rows, passwords, IDs or links.
Version 3 only adds the accounts' `admin` and `session_version` columns, defaulting
existing accounts to non-administrators with their sessions intact.
Case-insensitive uniqueness and name ordering remain Clog policy: the generic
SQLite generator deliberately emits default SQLite collation. An interrupted
fresh install can resume only if its generated schema matches exactly and contains
no records; unknown or populated unversioned schemas are refused.

Runtime 0.11.1 fixed relationship-aware deletion traversal
([elephentity #91](https://github.com/hsimah-services/elephentity/issues/91)).
Clog passes storage directly to the unit of work; the `DependentReadStorage`
workaround has been removed. Later releases keep that behavior.
Regression tests use mismatched and colliding IDs to verify parent cascades,
child deletion preserving parents/siblings, and occupied-location restrictions.

## Packaging

The standalone packager copies an allowlist into staging, installs the exact lock
with `--no-dev --classmap-authoritative --no-scripts --no-plugins`, checks platform
requirements, and archives the result. It never modifies the working vendor tree.
The target host receives `server/vendor/autoload.php` and production dependencies;
it needs neither Composer nor Rust nor the Elephentity compiler/generators.
Tests unpack the actual archive in isolation, confirm only the expected application files and production dependencies
are included, and exercise install, a write, GraphQL and backup/restore.
