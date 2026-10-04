# Published Elephentity dependencies

Clog uses Composer packages from Packagist, installed into ignored `server/vendor`.
There are no checked-in library forks, version aliases, VCS overrides or source
patches. Commit `server/composer.lock`; it records every release and source commit.
The repository still commits signed generated PHP artifacts.

## Current release set

| Package | Locked release | Role |
| --- | --- | --- |
| `elephentity/runtime` | 0.11.1 | Runtime contracts and unit of work |
| `elephentity/sqlite` | 0.1.0-alpha.2 | Runtime SQLite adapter |
| `elephentity/graphql` | 0.1.0-alpha.2 | Runtime GraphQL integration; repository is `elephentity-graphql-php` |
| `elephentity/cli` | 0.11.0 | Build-time commands |
| `elephentity/schema` | 0.11.0 | Compiler, installed through CLI |
| `elephentity/codegen` | 0.6.0 | Generator orchestrator |
| `elephentity/codegen-php` | 0.6.0 | PHP entities and contracts |
| `elephentity/codegen-sqlite` | 0.1.0-alpha.1 | SQLite manifest and initial installer |
| `elephentity/codegen-graphql-php` | 0.1.0-alpha.1 | Standalone GraphQL manifest and verifier |

Only the four new integration/generator packages allow alpha releases. The rest
retain stable constraints. `webonyx/graphql-php` is the separate GraphQL engine,
currently locked at 15.37.2. Production installs only the runtime packages.

Both integration adapters support runtime 0.11 as of alpha.2. The compatibility
issues [SQLite #1](https://github.com/hsimah-services/elephentity-sqlite/issues/1)
and [GraphQL PHP #1](https://github.com/hsimah-services/elephentity-graphql-php/issues/1)
are resolved. The constraints require these compatible releases or newer.

## Generation

```sh
scripts/php.sh composer install --no-interaction --prefer-dist
scripts/php.sh composer build-generators
scripts/php.sh composer check-generated
```

After editing specs, run `scripts/php.sh vendor/bin/eleph generate` before the
check. The three targets are `php`, `sqlite`, and `graphql-php`. The generic
integration key inside YAML is `graphql`. Outputs live in `server/generated`,
`server/generated/sqlite`, and `server/generated/graphql`. `eleph check` loads
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
Version 3 only adds the accounts' `admin` column, defaulting existing accounts to
non-administrators.
Case-insensitive uniqueness and name ordering remain Clog policy: the generic
SQLite generator deliberately emits default SQLite collation. An interrupted
fresh install can resume only if its generated schema matches exactly and contains
no records; unknown or populated unversioned schemas are refused.

Runtime 0.11.1 fixes relationship-aware deletion traversal
([elephentity #91](https://github.com/hsimah-services/elephentity/issues/91)).
Clog passes storage directly to the unit of work; the `DependentReadStorage`
workaround has been removed. The runtime constraint requires the fixed release.
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
