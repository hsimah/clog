# Checked-in runtime dependencies

This tree is the source used by the standalone release. `bootstrap.php` loads it
directly; Composer is neither required nor invoked. Changes here are intentional
local forks for subsequent upstream extraction. Do not replace this tree with
`server/vendor`, which belongs to the old WordPress build.

| Package | Base |
| --- | --- |
| elephentity/runtime | 0.10.0, f3190c28d60e3e2e5f463f59e7d0992d1f700efd |
| elephentity/sqlite | new fork of SQL/manifest primitives from elephentity/wordpress 0.2.3, be019f072e131702fe0fb1b8731e2dd17904a0bb |
| elephentity/graphql | new fork of pure config/resolver code from elephentity/wpgraphql 0.2.0, 8c8f0a484979739c03deee790aff66583705f82a |
| webonyx/graphql-php | v15.37.2, source fetched from its GitHub release tag |
| psr/log, psr/container | copies of the versions recorded in their included composer.json and Clog's composer.lock |

Licenses accompany the source. Only runtime source is copied, excluding upstream
tests, generators and development dependencies. Original generated entities are
still under `server/generated`; standalone manifest snapshots are under
`server/standalone/manifests`. Until SQLite/GraphQL code generation exists upstream,
update those snapshots deliberately when changing the entity specs.

## Extraction boundaries

- `elephentity/sqlite`: PDO connection, transactions/savepoints, SQL query compiler,
  storage adaptor, physical manifest values. Clog's initial DDL is currently in
  `Clog\Standalone\Schema`; a generic SQLite DDL/migration compiler is future work.
- `elephentity/graphql`: manifest values, resolver configs, Relay IDs/connections,
  and `SchemaBuilder` backed by webonyx. No WordPress globals or runtime dependency.
- `Clog\Standalone`: application wiring, users/sessions, HTTP controller, CLI and
  explicit schema installation. PHP-FPM is a hosting configuration, not a storage
  concern. Applications should retain ownership of identity and authorization.

This is a Clog-tested prototype, not a completed general-purpose SQLite driver.
The compiler retains `%s`/`%d` placeholders at its boundary; Database binds them
through PDO. Clog exercises custom tables and many-to-one/inverse edges. The upstream basic adapter conformance suite passes for all four relation shapes;
join-table edge cases and production concurrency still need broader coverage.
