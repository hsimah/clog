# Storage upgrade v2

This procedure upgrades the three custom tables from the Elephentity v0.1 schema
in Clog commit `d7751ef`. It does **not** import a post/postmeta-only installation.
Production's starting state has not been inspected. Keep deployment gated until
a read-only export has been classified and rehearsed on a disposable site.

## What changes

Each entity keeps its database ID, name, barcode, dates and relationships. Stock
remains one row per physical unit. Existing non-null modification timestamps
remain exact; missing `updated_at` values become `created_at`. The originals keep
their original nulls. Auto-increment high-water marks are retained.

New tables omit `post_id`. The complete original tables are retained as
`<prefix>clog_{item,location,inventory}_clog_v1_backup`, preserving every post
mapping. WordPress posts and postmeta are not changed or deleted. The new runtime
does not update these archived projections; old post IDs are not new GraphQL
Node IDs. Database IDs are unchanged; refetch opaque GraphQL IDs from the API.

The command validates the exact source columns and indexes, InnoDB engines,
relationships and bidirectional post mappings before DDL. A post-only database,
partial/mixed tables, unknown schema, missing edge, or unaccounted-for post stops
the operation. Do not delete data just to bypass a refusal: inspect the export
and add an explicit repair/import if needed.

## Inspect and rehearse

1. Take a full database export and save the installed plugin ZIP, configuration
   and uploads. Restore the export to an isolated site with production's database
   version and WordPress prefix. Disable emails, cron and external integrations.
2. Install the new plugin on that isolated site. Normal plugin loading checks the
   schema, including after an update where WordPress does not call activation.
   The old schema produces an administrator notice and does not expose the new
   entity gateway. Activation and `wp clog install` refuse to convert old data.
3. With the new code installed, inspect:

   ```sh
   wp clog migration status --user=<administrator>
   wp clog migration plan --user=<administrator>
   ```

   `status` returns version, state, counts, projection count and retained tables.
   `plan` is a read-only dry run showing all DDL/DML, ending with a single
   three-table `RENAME TABLE`. Only an exact `v1` state can migrate; `v2` is a
   no-op. A genuinely empty site uses `wp clog install` instead.
4. Compare the source with the actual deployed inventory, including stock counts,
   barcode strings and locations. Rehearse the cutover and restoration below.
   A post-only deployment needs a separate import, based on its actual export.

## Cut over

[MySQL 8.0.13+](https://dev.mysql.com/doc/refman/8.0/en/rename-table.html) or
[MariaDB 10.6.1+](https://mariadb.com/docs/server/reference/sql-statements/data-definition/rename-table)
is required for the locked, atomic InnoDB table exchange. The database
user needs CREATE, INSERT, SELECT, ALTER, DROP (for RENAME privilege checking),
LOCK TABLES and access to its schema metadata. Reserve space for a second copy
of all three entity tables. The command never issues DROP.

1. Stop traffic and all writers, including cron, queue workers and other CLI
   sessions. Drain requests using the old plugin before installing the new one.
   Activate WordPress maintenance (`wp maintenance-mode activate`), but keep an
   external traffic block as well: WordPress's maintenance file expires after
   ten minutes. Keep this block in place throughout migration and verification.
2. Export the complete database after writes stop. Verify the export can be
   restored, and keep it outside this database/container. Retained tables are a
   convenient rollback aid, not a substitute for an independent backup.
3. Install the new plugin, rerun `status` and `plan`, then:

   ```sh
   wp clog migration run --backup-verified --user=<administrator>
   wp clog migration status --user=<administrator>
   ```

   The flag acknowledges the independently verified backup; the command cannot
   verify that file for you. It requires an administrator and maintenance file.
   It takes an advisory lock, creates staging tables, locks source and staging
   tables, copies and compares every target field with binary/null-safe equality,
   then exchanges all three tables in one statement. DDL is not wrapped in a
   fictitious transaction. `v2` status with three retained originals is success.
4. Compare counts, sample barcodes/dates and item/location links. Exercise reads
   and a controlled create/delete on the restored rehearsal site first. Check
   GraphQL and the app. Record the result before reopening production writes.
5. Remove maintenance and the external block only after verification. Keep the
   export, originals and previous plugin until the rollback window has closed.
   Cleanup is a separate, deliberately manual operation.

## Interrupted execution

Before the atomic rename, originals remain authoritative. Staging tables are
named `<prefix>clog_*_clog_v2_stage`. A rerun reports `interrupted` and refuses to
overwrite them. Keep maintenance, inspect/export the artifacts, and confirm all
three live tables are still the exact v1 schema. Only then may an administrator
remove those three **staging** tables and rerun the plan. Never remove a live or
backup table to make status pass. A crash after rename is recognized as `v2`;
rerunning does nothing, even if the previous CLI process never printed success.

## Restore before reopening writes

With traffic and workers still stopped, exchange all three originals back in
one statement. Replace `wp_` with the actual prefix, and choose unused names for
the retained v2 copies:

```sql
RENAME TABLE
  wp_clog_item TO wp_clog_item_failed_v2,
  wp_clog_item_clog_v1_backup TO wp_clog_item,
  wp_clog_location TO wp_clog_location_failed_v2,
  wp_clog_location_clog_v1_backup TO wp_clog_location,
  wp_clog_inventory TO wp_clog_inventory_failed_v2,
  wp_clog_inventory_clog_v1_backup TO wp_clog_inventory;
```

Restore the matching old plugin ZIP before reopening traffic; the new runtime
will intentionally refuse the restored v1 schema. Compare restored rows and
post links with the export. The disposable integration suite rehearses this
exchange and verifies every original row, then upgrades again.

After new writes have been accepted, exchanging backups back would lose those
writes. Stop and export the current state, then reconcile the new writes or
restore a coordinated database/plugin backup with an explicitly accepted recovery
point. A plugin-only downgrade is not a database rollback.

## Verification and remaining deployment gate

`scripts/test-backend.sh` tests fresh installation, a frozen old-schema fixture,
leading-zero barcode and timestamp preservation, broken edges, mixed post data,
interrupted copies, repeated runs, retained post mappings, and table restoration
in isolated MySQL/WordPress containers. It does not access the garage inventory.
Before closing #33, inspect the real deployment export and rehearse its WordPress
ZIP update and full backup restore. Add a legacy importer only if that inspection
shows it is needed. MariaDB support must also be rehearsed on that engine if used.
