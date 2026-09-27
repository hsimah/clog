<?php
require dirname(__DIR__) . '/bootstrap.php';
$path = getenv('CLOG_DB');
if (!$path || !str_starts_with($path, '/tmp/clog-')) throw new RuntimeException('Browser fixtures require an isolated /tmp/clog- database.');
$db = new Eleph\SQLite\Database($path);
Clog\Standalone\Schema::install($db);
foreach (['editor', 'reader'] as $role) $db->insert('clog_users', ['username'=>$role,'role'=>$role,'password_hash'=>password_hash('test-password-only', PASSWORD_DEFAULT)]);
