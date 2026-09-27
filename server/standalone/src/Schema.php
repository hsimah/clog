<?php

declare(strict_types=1);
namespace Clog\Standalone;

use Eleph\SQLite\Database;
use RuntimeException;

final class Schema
{
    public const VERSION = 1;
    public static function install(Database $db): void
    {
        $db->transaction(static function () use ($db): void {
            $version = (int) $db->scalar('PRAGMA user_version');
            if ($version === self::VERSION) return;
            if ($version !== 0 || $db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'") !== 0) {
                throw new RuntimeException('Unsupported SQLite schema; restore a supported backup or add an explicit migration.');
            }
            $db->pdo->exec(<<<'SQL'
CREATE TABLE app_clog_item (
 id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 name TEXT COLLATE CLOG_NOCASE NOT NULL CHECK(length(name) BETWEEN 1 AND 200),
 barcode TEXT COLLATE CLOG_NOCASE UNIQUE CHECK(barcode IS NULL OR length(barcode) <= 64)
);
CREATE INDEX app_clog_item_name_idx ON app_clog_item(name);
CREATE TABLE app_clog_location (
 id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 name TEXT COLLATE CLOG_NOCASE NOT NULL UNIQUE CHECK(length(name) BETWEEN 1 AND 200)
);
CREATE TABLE app_clog_inventory (
 id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 name TEXT NOT NULL, date_added TEXT NOT NULL,
 item_id INTEGER REFERENCES app_clog_item(id) ON DELETE RESTRICT,
 location_id INTEGER REFERENCES app_clog_location(id) ON DELETE RESTRICT
);
CREATE INDEX app_clog_inventory_item_id_idx ON app_clog_inventory(item_id);
CREATE INDEX app_clog_inventory_location_id_idx ON app_clog_inventory(location_id);
CREATE INDEX app_clog_inventory_date_idx ON app_clog_inventory(date_added DESC, id ASC);
CREATE TABLE clog_users (
 id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT COLLATE NOCASE NOT NULL UNIQUE,
 password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('reader', 'editor')),
 enabled INTEGER NOT NULL DEFAULT 1
);
PRAGMA user_version = 1;
SQL);
        });
    }

    public static function requireReady(Database $db): void
    {
        if ((int) $db->scalar('PRAGMA user_version') !== self::VERSION) throw new RuntimeException('Run the standalone install command before serving requests.');
    }
}
