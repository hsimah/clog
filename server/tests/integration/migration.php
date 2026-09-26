<?php

use Clog\Migration\StorageUpgrade;
use Clog\Runtime\Clog;
use Eleph\WordPress\Database\WpdbDatabase;
use Eleph\WordPress\Migration\SchemaInstaller;
use Eleph\WordPress\WordPress;

// This fixture replaces tables only inside the disposable integration database.
global $wpdb;
if ('clog_test' !== DB_NAME || 'http://clog.test' !== get_option('home')) {
    throw new RuntimeException('Refusing to reset a non-test database.');
}
function migrationCheck(bool $ok, string $message): void {
    if (!$ok) {
        throw new RuntimeException($message);
    }
    WP_CLI::log('PASS ' . $message);
}
function migrationRefused(callable $run, string $message): void {
    try {
        $run();
    } catch (RuntimeException $error) {
        WP_CLI::log('PASS ' . $message . ': ' . $error->getMessage());
        return;
    }
    throw new RuntimeException('Expected rejection: ' . $message);
}
$db = new WpdbDatabase($wpdb);
$target = WordPress::manifest(CLOG_PLUGIN_DIR . 'generated/wordpress/storage-manifest.php');
$legacy = require CLOG_PLUGIN_DIR . 'migrations/v1-storage.php';
$tables = array_keys($target->withPrefix($db->prefix())->everyTable());
$upgrade = new StorageUpgrade($db, $target);
migrationCheck('v2' === $upgrade->status()['state'], 'fresh install is current');
foreach ($tables as $name) {
    $db->execute("DROP TABLE `$name`");
}
$legacyPost = wp_insert_post(['post_type' => 'clog_item', 'post_status' => 'publish', 'post_title' => 'Legacy post only']);
migrationCheck('legacy-posts' === $upgrade->status()['state'], 'post-only deployment detected');
migrationRefused(fn () => Clog::instance()->tables()->install(), 'fresh installer cannot hide legacy inventory');
wp_delete_post($legacyPost, true);
migrationCheck('fresh' === $upgrade->status()['state'], 'empty database recognized');
(new SchemaInstaller($db, $legacy))->install();
$posts = [];
foreach (['item', 'location', 'inventory'] as $kind) {
    $posts[$kind] = wp_insert_post(['post_type' => 'clog_' . $kind, 'post_status' => 'publish', 'post_title' => 'Migration ' . $kind]);
}
$base = ['created_at' => '2020-03-04 05:06:07', 'updated_at' => null];
$db->insert($db->prefix() . 'clog_item', [...$base, 'id' => 101, 'post_id' => $posts['item'], 'name' => 'Rice', 'barcode' => '000012340000']);
$db->insert($db->prefix() . 'clog_location', [...$base, 'id' => 203, 'post_id' => $posts['location'], 'name' => 'Shelf']);
$db->insert($db->prefix() . 'clog_inventory', [...$base, 'id' => 307, 'post_id' => $posts['inventory'], 'name' => 'Rice @ Shelf',
    'updated_at' => '2021-05-06 07:08:09', 'date_added' => '2019-08-09 10:11:12', 'item_id' => 101, 'location_id' => 203]);
$db->execute('ALTER TABLE `' . $db->prefix() . 'clog_item` AUTO_INCREMENT = 999');
migrationCheck('v1' === $upgrade->status()['state'], 'exact old schema recognized');
$loaded = WP_CLI::runcommand('clog migration status --user=clog-test', ['return' => 'all', 'launch' => true, 'exit_error' => false]);
migrationCheck(0 === $loaded->return_code && str_contains($loaded->stdout, '"state": "v1"')
    && str_contains($loaded->stderr, 'explicit data migration'), 'new WordPress process detects pending upgrade without activation');
migrationRefused(fn () => Clog::instance()->tables()->requireReady(), 'normal plugin load detects pending upgrade without activation');
migrationRefused(fn () => Clog::instance()->tables()->install(), 'activation cannot implicitly migrate existing inventory');
$before = [];
foreach ($tables as $name) {
    $before[$name] = $db->select("SELECT * FROM `$name` ORDER BY id");
}
$plan = $upgrade->plan();
migrationCheck(count($plan) === 10 && str_starts_with(end($plan), 'RENAME TABLE'), 'dry run shows atomic exchange');
foreach ($tables as $name) {
    migrationCheck($before[$name] === $db->select("SELECT * FROM `$name` ORDER BY id"), 'dry run preserves ' . $name);
}

// Refuse bad relationships and mixed projection data before creating any stages.
$inventory = $db->prefix() . 'clog_inventory';
$db->execute("UPDATE `$inventory` SET location_id = 9999");
migrationRefused(fn () => $upgrade->run(), 'dangling edge refuses execution');
migrationCheck([] === $upgrade->status()['retainedTables'], 'invalid data creates no staging artifacts');
$db->execute("UPDATE `$inventory` SET location_id = 203");
$extra = wp_insert_post(['post_type' => 'clog_item', 'post_status' => 'publish', 'post_title' => 'Unmapped']);
migrationRefused(fn () => $upgrade->plan(), 'unmapped legacy projection refuses migration');
wp_delete_post($extra, true);
$db->execute("CREATE TRIGGER clog_test_migration_trigger BEFORE UPDATE ON `$inventory` FOR EACH ROW SET NEW.name = NEW.name");
migrationRefused(fn () => $upgrade->plan(), 'custom database trigger refuses migration');
$db->execute('DROP TRIGGER clog_test_migration_trigger');

// A failed process after its first DDL leaves sources intact, and rerun fails safely.
$db->execute($plan[0]);
migrationCheck('interrupted' === $upgrade->status()['state'], 'interrupted copy recognized');
migrationRefused(fn () => $upgrade->run(), 'interrupted migration requires inspection');
$db->execute('DROP TABLE `' . $tables[0] . StorageUpgrade::STAGE . '`');

$result = $upgrade->run();
migrationCheck('v2' === $result['state'], 'old installation reaches current schema');
migrationCheck(3 === count($result['retainedTables']), 'all original tables retained');
migrationCheck(3 === $result['projectionPosts'], 'all projection posts retained');
migrationCheck(Clog::instance()->tables()->plan()->isEmpty(), 'upgraded schema matches generated manifest');
foreach ($tables as $name) {
    $original = $db->select('SELECT * FROM `' . $name . StorageUpgrade::BACKUP . '` ORDER BY id');
    migrationCheck($before[$name] === $original, 'original data retained byte-for-byte in ' . $name);
    $expected = array_map(static function ($row) {
        unset($row['post_id']);
        $row['updated_at'] ??= $row['created_at'];
        return $row;
    }, $before[$name]);
    migrationCheck($expected === $db->select("SELECT * FROM `$name` ORDER BY id"), 'all fields and relationships preserved in ' . $name);
}
$next = $db->scalar('SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s', [$db->prefix() . 'clog_item']);
migrationCheck(999 === (int) $next, 'deleted entity IDs cannot be reused');
migrationCheck($result === $upgrade->run(), 'repeat migration is a no-op');

// Rehearse restoration before writes resume, retaining the new copy for inspection.
$renames = [];
foreach ($tables as $name) {
    $renames[] = "`$name` TO `{$name}_test_v2_restore`";
    $renames[] = '`' . $name . StorageUpgrade::BACKUP . "` TO `$name`";
}
$db->execute('RENAME TABLE ' . implode(', ', $renames));
migrationCheck('v1' === $upgrade->status()['state'], 'atomic backup restoration reaches old schema');
foreach ($tables as $name) {
    migrationCheck($before[$name] === $db->select("SELECT * FROM `$name` ORDER BY id"), 'restored data exactly matches ' . $name);
    $db->execute("DROP TABLE `{$name}_test_v2_restore`");
}
$denied = WP_CLI::runcommand('clog migration run --backup-verified --user=clog-test', ['return' => 'all', 'launch' => true, 'exit_error' => false]);
migrationCheck(0 !== $denied->return_code && str_contains($denied->stderr, 'Activate maintenance'), 'CLI refuses cutover without maintenance');
WP_CLI::runcommand('maintenance-mode activate');
$migrated = WP_CLI::runcommand('clog migration run --backup-verified --user=clog-test', ['return' => 'all', 'launch' => true, 'exit_error' => false]);
migrationCheck(0 === $migrated->return_code && 'v2' === $upgrade->status()['state'], 'CLI upgrades again after a verified restore');
WP_CLI::runcommand('maintenance-mode deactivate');
WP_CLI::success('Storage migration and rollback rehearsal passed.');
