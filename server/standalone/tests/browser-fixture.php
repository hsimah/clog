<?php
require dirname(__DIR__) . '/bootstrap.php';
$path = getenv('CLOG_DB');
if (!$path || !str_starts_with($path, '/tmp/clog-')) throw new RuntimeException('Browser fixtures require an isolated /tmp/clog- database.');
$db = new Eleph\SQLite\Database($path);
Clog\Standalone\Schema::install($db);
foreach (['editor', 'reader'] as $role) $db->insert('clog_users', ['username'=>$role,'role'=>$role,'password_hash'=>password_hash('test-password-only', PASSWORD_DEFAULT)]);

$app = new Clog\Standalone\Application($db, new Clog\Standalone\Viewer('1', 'editor'));
$items = [];
foreach (['Heinz Ketchup'=>'013000006057', 'Purina Dry Dog Food'=>'017800149341', 'Pedigree Wet Dog Food'=>'017800153560'] as $name=>$barcode) {
    $items[] = $app->runtime->create('Item', ['name'=>$name, 'barcode'=>$barcode])->id->raw();
}
$locations = [];
foreach (['Garage Shelves', 'Garage Freezer', 'Kitchen Cabinet', 'Kitchen Freezer'] as $name) {
    $locations[] = $app->runtime->create('Location', ['name'=>$name])->id->raw();
}
foreach ([[0,2,2], [0,0,3], [1,0,3], [2,2,3], [2,1,3]] as [$item, $location, $count]) {
    for ($i = 0; $i < $count; $i++) {
        $app->runtime->create('Inventory', ['item'=>$items[$item], 'location'=>$locations[$location], 'dateAdded'=>'2026-01-01T12:00:00Z']);
    }
}
