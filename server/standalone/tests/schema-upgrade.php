<?php

declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';

use Clog\Standalone\{Application, Schema, Viewer};
use Eleph\SQLite\Database;

function checkUpgrade(bool $ok, string $message): void
{
    if (!$ok) throw new RuntimeException($message);
}
function refused(callable $work): void
{
    try { $work(); } catch (Throwable) { return; }
    throw new RuntimeException('Expected installation to refuse unsupported storage.');
}
function snapshot(Database $db): array
{
    $result = [];
    foreach (['app_clog_item', 'app_clog_location', 'app_clog_inventory', 'clog_users'] as $table) {
        $result[$table] = $db->select('SELECT * FROM ' . Database::identifier($table) . ' ORDER BY id');
    }
    return $result;
}

$db = new Database(':memory:');
$db->pdo->exec(file_get_contents(__DIR__ . '/fixtures/prototype-v1.sql'));
$time = '2026-09-26 00:00:00';
$db->insert('app_clog_item', ['id' => 8, 'created_at' => $time, 'updated_at' => $time, 'name' => 'Existing torch', 'barcode' => '00042']);
$db->insert('app_clog_location', ['id' => 12, 'created_at' => $time, 'updated_at' => $time, 'name' => 'Étagère']);
$db->insert('app_clog_inventory', ['id' => 3, 'created_at' => $time, 'updated_at' => $time, 'name' => 'Existing torch at Étagère', 'date_added' => $time, 'item_id' => 8, 'location_id' => 12]);
$db->insert('clog_users', ['id' => 4, 'username' => 'existing', 'password_hash' => password_hash('fixture-password', PASSWORD_DEFAULT), 'role' => 'editor']);
$before = snapshot($db);
refused(fn () => Schema::requireReady($db));
Schema::install($db);
Schema::requireReady($db);
checkUpgrade(snapshot($db) === $before, 'Upgrade changed existing records or accounts.');
Schema::install($db);
checkUpgrade(snapshot($db) === $before, 'Repeated installation changed data.');
$app = new Application($db, new Viewer('4', 'editor'));
checkUpgrade($app->queries->search('Inventory')->count() === 1, 'Existing stock cannot be read after upgrade.');
$new = $app->runtime->create('Item', ['name' => 'New torch']);
checkUpgrade((int) $new->id->raw() > 8, 'Upgrade reset the identity sequence.');
refused(fn () => $app->runtime->create('Location', ['name' => 'étagère']));

// New installs use the generated DDL, with Clog's Unicode uniqueness retained.
$fresh = new Database(':memory:');
Schema::install($fresh);
$freshApp = new Application($fresh, new Viewer('1', 'editor'));
$freshApp->runtime->create('Location', ['name' => 'Étagère']);
refused(fn () => $freshApp->runtime->create('Location', ['name' => 'étagère']));
$freshApp->runtime->create('Item', ['name' => 'Case', 'barcode' => 'AbC']);
refused(fn () => $freshApp->runtime->create('Item', ['name' => 'Case duplicate', 'barcode' => 'abc']));
$freshApp->runtime->create('Item', ['name' => 'apple']);
$freshApp->runtime->create('Item', ['name' => 'Zebra']);
$names = array_map(fn ($item) => $item->getName(), $freshApp->queries->search('Item')->page(10)->items);
checkUpgrade($names === ['apple', 'Case', 'Zebra'], 'Generated schema changed case-insensitive search ordering.');

$generatedInstall = require dirname(__DIR__, 2) . '/generated/sqlite/install.php';
$interrupted = new Database(':memory:');
$generatedInstall($interrupted->pdo);
Schema::install($interrupted);
Schema::requireReady($interrupted);
checkUpgrade((int) $interrupted->scalar('SELECT COUNT(*) FROM clog_users') === 0, 'Interrupted install fabricated accounts.');

$unknown = new Database(':memory:');
$unknown->pdo->exec('CREATE TABLE unrelated (value TEXT)');
refused(fn () => Schema::install($unknown));
checkUpgrade((int) $unknown->scalar('PRAGMA user_version') === 0, 'Refusal changed schema version.');
$populated = new Database(':memory:');
$generatedInstall($populated->pdo);
$populated->insert('app_clog_item', ['created_at' => $time, 'updated_at' => $time, 'name' => 'Unversioned data']);
refused(fn () => Schema::install($populated));
checkUpgrade((int) $populated->scalar('SELECT COUNT(*) FROM app_clog_item') === 1, 'Refusal lost unversioned data.');

$broken = new Database(':memory:');
$broken->pdo->exec(file_get_contents(__DIR__ . '/fixtures/prototype-v1.sql'));
$broken->pdo->exec('PRAGMA foreign_keys = OFF');
$broken->insert('app_clog_inventory', ['created_at' => $time, 'updated_at' => $time, 'name' => 'Orphan', 'date_added' => $time, 'item_id' => 999]);
$broken->pdo->exec('PRAGMA foreign_keys = ON');
refused(fn () => Schema::install($broken));
checkUpgrade((int) $broken->scalar('PRAGMA user_version') === 1, 'Failed upgrade did not roll back its version.');
checkUpgrade((int) $broken->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name = 'clog_item_barcode_nocase'") === 0, 'Failed upgrade left partial indexes.');

echo "PASS: prototype upgrade preserves data/accounts/IDs, generated installation, collation, interruption recovery and refusal rollback\n";
