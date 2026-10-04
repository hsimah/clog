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
    foreach (['app_clog_item', 'app_clog_location', 'app_clog_inventory'] as $table) {
        $result[$table] = $db->select('SELECT * FROM ' . Database::identifier($table) . ' ORDER BY id');
    }
    // Version 3 only adds the admin column; every earlier account column is preserved.
    $result['clog_users'] = $db->select('SELECT id, username, password_hash, role, enabled FROM clog_users ORDER BY id');
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
checkUpgrade((int) $db->scalar('PRAGMA user_version') === Schema::VERSION, 'Upgrade did not reach the current version.');
checkUpgrade($db->select('SELECT admin, session_version FROM clog_users') === [['admin' => 0, 'session_version' => 0]], 'Upgrade granted administrator access or changed sessions.');
Schema::install($db);
checkUpgrade(snapshot($db) === $before, 'Repeated installation changed data.');
$app = new Application($db, new Viewer('4', 'editor'));
checkUpgrade($app->queries->search('Inventory')->count() === 1, 'Existing stock cannot be read after upgrade.');
$new = $app->runtime->create('Item', ['name' => 'New torch']);
checkUpgrade((int) $new->id->raw() > 8, 'Upgrade reset the identity sequence.');
refused(fn () => $app->runtime->create('Location', ['name' => 'étagère']));

// Deployed version 2 databases gain only the admin and session columns.
$v2 = new Database(':memory:');
$v2->pdo->exec(file_get_contents(__DIR__ . '/fixtures/prototype-v2.sql'));
$v2->insert('app_clog_item', ['id' => 21, 'created_at' => $time, 'updated_at' => $time, 'name' => 'Deployed lantern', 'barcode' => 'LaNt-1']);
$v2->insert('app_clog_location', ['id' => 30, 'created_at' => $time, 'updated_at' => $time, 'name' => 'Cellier']);
$v2->insert('app_clog_inventory', ['id' => 40, 'created_at' => $time, 'updated_at' => $time, 'name' => 'Deployed lantern at Cellier', 'date_added' => $time, 'item_id' => 21, 'location_id' => 30]);
$v2->insert('clog_users', ['id' => 6, 'username' => 'deployed', 'password_hash' => password_hash('fixture-password', PASSWORD_DEFAULT), 'role' => 'reader', 'enabled' => 0]);
$v2->insert('clog_users', ['id' => 7, 'username' => 'Writer', 'password_hash' => password_hash('fixture-password', PASSWORD_DEFAULT), 'role' => 'editor']);
// Every object except the upgraded accounts table, plus identity sequences, must survive.
$v2Schema = fn () => [
    $v2->select("SELECT type, name, sql FROM sqlite_master WHERE name <> 'clog_users' ORDER BY name"),
    $v2->select('SELECT name, seq FROM sqlite_sequence ORDER BY name'),
];
$v2Before = [snapshot($v2), $v2Schema()];
checkUpgrade((int) $v2->scalar('PRAGMA user_version') === 2, 'Version 2 fixture has the wrong version.');
Schema::install($v2);
checkUpgrade([snapshot($v2), $v2Schema()] === $v2Before && (int) $v2->scalar('PRAGMA user_version') === 3, 'Version 2 upgrade changed data, schema objects, sequences or version.');
checkUpgrade($v2->select('SELECT admin, session_version FROM clog_users') === [['admin' => 0, 'session_version' => 0], ['admin' => 0, 'session_version' => 0]], 'Version 2 upgrade granted administrator access or changed sessions.');
Schema::requireReady($v2);
$v2App = new Application($v2, new Viewer('7', 'editor'));
checkUpgrade($v2App->queries->search('Inventory')->count() === 1, 'Existing v2 stock cannot be read after upgrade.');
checkUpgrade((int) $v2App->runtime->create('Item', ['name' => 'New lantern'])->id->raw() > 21, 'Version 2 upgrade reset the identity sequence.');
refused(fn () => $v2App->runtime->create('Item', ['name' => 'Duplicate lantern', 'barcode' => 'lant-1']));
refused(fn () => $v2->execute('UPDATE clog_users SET admin = 2'));

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

echo "PASS: prototype and v2 upgrades preserve data/accounts/IDs, generated installation, collation, interruption recovery and refusal rollback\n";
