<?php

declare(strict_types=1);
namespace Clog\Standalone;

use Eleph\SQLite\Database;
use RuntimeException;

/** Generated entity DDL plus Clog-owned accounts, indexes and explicit upgrades. */
final class Schema
{
    public const VERSION = 4;

    public static function install(Database $db): void
    {
        $version = (int) $db->scalar('PRAGMA user_version');
        if ($version === self::VERSION) return;
        if (!in_array($version, [0, 1, 2, 3], true)) {
            throw new RuntimeException('Unsupported SQLite schema; restore a supported backup or add an explicit migration.');
        }

        if ($version === 0) {
            $install = require dirname(__DIR__, 2) . '/generated/sqlite/install.php';
            if (self::objects($db) === []) {
                // The upstream installer owns its transaction and must run outside ours.
                $install($db->pdo);
            } else {
                // Recover only an empty, exact generated schema after an interrupted
                // first install. Never reinterpret populated/unrecognized storage.
                $expected = new Database(':memory:');
                $install($expected->pdo);
                if (self::objects($db) !== self::objects($expected)) {
                    throw new RuntimeException('Refusing an unversioned database with an unknown schema.');
                }
                $manifest = require dirname(__DIR__, 2) . '/generated/sqlite/storage-manifest.php';
                foreach ($manifest->everyTable() as $table) {
                    if ((int) $db->scalar('SELECT COUNT(*) FROM ' . Database::identifier($table->name)) !== 0) {
                        throw new RuntimeException('Refusing an unversioned database containing records.');
                    }
                }
            }
        }

        if ($version < 2) self::upgradeToVersion2($db, $version);
        if ($version < 3) $db->transaction(static function () use ($db): void {
            // v3 adds account administration. Existing accounts keep their role and
            // stay non-administrators until granted with `user:admin`. Sessions
            // remember session_version at login; bumping it signs the account out.
            $db->select('SELECT id, username, password_hash, role, enabled FROM clog_users LIMIT 0');
            $db->pdo->exec(<<<'SQL'
ALTER TABLE clog_users ADD COLUMN admin INTEGER NOT NULL DEFAULT 0 CHECK(admin IN (0, 1));
ALTER TABLE clog_users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0;
PRAGMA user_version = 3;
SQL);
        });
        $db->transaction(static function () use ($db): void {
            // v4 seeds the photographed cave stock into the deployment holding that
            // location. Installations without it, including fresh ones, gain nothing.
            CaveInventorySeed::apply($db);
            if ($db->select('PRAGMA foreign_key_check') !== []) {
                throw new RuntimeException('Foreign key violations prevent this schema upgrade.');
            }
            $db->pdo->exec('PRAGMA user_version = 4');
        });
    }

    private static function upgradeToVersion2(Database $db, int $version): void
    {
        $db->transaction(static function () use ($db, $version): void {
            if ($version === 0) {
                $db->pdo->exec(<<<'SQL'
CREATE TABLE clog_users (
 id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT COLLATE NOCASE NOT NULL UNIQUE,
 password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('reader', 'editor')),
 enabled INTEGER NOT NULL DEFAULT 1
)
SQL);
            } else {
                // v1 is the tested prototype schema. Verify the tables/columns that
                // must survive; this upgrade never rebuilds tables or changes rows.
                $db->select('SELECT id, username, password_hash, role, enabled FROM clog_users LIMIT 0');
                $manifest = require dirname(__DIR__, 2) . '/generated/sqlite/storage-manifest.php';
                foreach ($manifest->tables as $table) {
                    $columns = implode(', ', array_map(Database::identifier(...), array_keys($table->columns)));
                    $db->select('SELECT ' . $columns . ' FROM ' . Database::identifier($table->name) . ' LIMIT 0');
                }
            }
            // The upstream generator intentionally uses SQLite's default collation.
            // These application indexes retain Clog's case-insensitive uniqueness
            // for both fresh installations and databases created by the prototype.
            $db->pdo->exec(<<<'SQL'
CREATE UNIQUE INDEX clog_item_barcode_nocase ON app_clog_item(barcode COLLATE CLOG_NOCASE);
CREATE UNIQUE INDEX clog_location_name_nocase ON app_clog_location(name COLLATE CLOG_NOCASE);
CREATE INDEX clog_item_name_nocase ON app_clog_item(name COLLATE CLOG_NOCASE);
CREATE INDEX IF NOT EXISTS app_clog_inventory_date_idx ON app_clog_inventory(date_added DESC, id ASC);
PRAGMA user_version = 2;
SQL);
            if ($db->select('PRAGMA foreign_key_check') !== []) {
                throw new RuntimeException('Foreign key violations prevent this schema upgrade.');
            }
        });
    }

    private static function objects(Database $db): array
    {
        return $db->select("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name");
    }

    public static function requireReady(Database $db): void
    {
        if ((int) $db->scalar('PRAGMA user_version') !== self::VERSION) {
            throw new RuntimeException('Run the standalone install command to install or upgrade the database before serving requests.');
        }
    }
}
