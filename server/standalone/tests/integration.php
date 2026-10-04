<?php

declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';

use Clog\Standalone\{Application, Viewer, Schema, GraphQL as API};
use Eleph\SQLite\Database;
use Eleph\Runtime\Identity\EntityId;
use GraphQL\GraphQL;

function check(bool $condition, string $message): void { if (!$condition) throw new RuntimeException($message); }
function fails(callable $fn, string $message): void {
    try { $fn(); } catch (Throwable) { return; }
    throw new RuntimeException($message);
}
if (!str_starts_with((new ReflectionClass(Database::class))->getFileName(), realpath(dirname(__DIR__, 2) . '/vendor') . DIRECTORY_SEPARATOR)) throw new RuntimeException('SQLite must load from Composer dependencies.');
$db = new Database(':memory:');
Schema::install($db); Schema::install($db);
$app = new Application($db, new Viewer('1', 'editor'));
$runtime = $app->runtime;
$item = $runtime->create('Item', ['name' => 'Torch 100%_\\', 'barcode' => '00123']);
$item2 = $runtime->create('Item', ['name' => 'Helmet']);
$location = $runtime->create('Location', ['name' => 'Shelf']);
$location2 = $runtime->create('Location', ['name' => 'Box']);
$stock = $runtime->create('Inventory', ['dateAdded' => '2026-09-26T00:00:00Z', 'item' => (string) $item->id, 'location' => (string) $location->id]);
$stock2 = $runtime->create('Inventory', ['dateAdded' => '2026-09-26T00:00:00Z', 'item' => (string) $item2->id, 'location' => (string) $location2->id]);
check($app->queries->search('Item', '100%_\\')->count() === 1, 'Literal wildcard search');
check($app->queries->search('Item', location: $location->id, stockedOnly: true)->count() === 1, 'Stocked filtering');
$runtime->update('Item', $item->id, ['barcode' => null]);
check($runtime->find('Item', $item->id)->getBarcode() === null, 'NULL update');
$runtime->update('Item', $item2->id, ['barcode' => '00123']);
fails(fn () => $runtime->create('Location', ['name' => 'shelf']), 'Unique case-insensitive location');
$before = $app->queries->search('Item')->count();
fails(fn () => $db->transaction(function () use ($runtime) { $runtime->create('Item', ['name' => 'Rollback']); throw new RuntimeException('rollback'); }), 'Rollback raises');
check($app->queries->search('Item')->count() === $before, 'Nested transaction rollback');
$reader = new Application($db, new Viewer('2', 'reader'));
fails(fn () => $reader->runtime->create('Item', ['name' => 'Denied']), 'Reader writes denied');
$anonymous = new Application($db, new Viewer());
check($anonymous->queries->search('Item')->count() === 0, 'Anonymous aggregates denied');
fails(fn () => $anonymous->runtime->find('Item', $item->id), 'Anonymous detail denied');
$schema = API::schema($app); $schema->assertValid();
function gql(string $query, array $variables = []): array {
    global $schema;
    $result = GraphQL::executeQuery($schema, $query, variableValues: $variables)->toArray(3);
    if (isset($result['errors'])) throw new RuntimeException(json_encode($result['errors']));
    return $result['data'];
}
$data = gql('{clogItemSearch(first:1){totalCount edges{cursor node{id name stockCount}} pageInfo{hasNextPage endCursor}} clogSummary{items locations inventory}}');
check($data['clogSummary']['inventory'] === 2, 'GraphQL totals');
check($data['clogItemSearch']['pageInfo']['hasNextPage'], 'GraphQL pagination');
$cursor = $data['clogItemSearch']['pageInfo']['endCursor'];
$second = gql('query($after:String){clogItemSearch(first:1,after:$after){nodes{id} pageInfo{hasNextPage}}}', ['after' => $cursor]);
check(!$second['clogItemSearch']['pageInfo']['hasNextPage'], 'Last page');
$nodeId = $data['clogItemSearch']['edges'][0]['node']['id'];
$node = gql('query($id:ID!){node(id:$id){id ... on ClogItem{name inventoryEntries{totalCount nodes{item{id} location{name}}}}}}', ['id' => $nodeId]);
check($node['node']['id'] === $nodeId, 'Node identity and inverse edges');
$created = gql('mutation {createClogItem(input:{name:"GraphQL item",clientMutationId:"test"}){clientMutationId clogItem{id name}}}');
check($created['createClogItem']['clientMutationId'] === 'test', 'Mutation client ID');
$wrong = GraphQL::executeQuery($schema, 'query($id:ID!){clogLocation(id:$id){id}}', variableValues: ['id' => $nodeId])->toArray();
check(isset($wrong['errors']), 'Wrong entity ID rejected');
$runtime->delete('Item', $item->id);
check($runtime->find('Inventory', $stock->id) === null, 'Dependent stock deleted');
check($runtime->find('Inventory', $stock2->id) !== null, 'Unrelated stock retained');
fails(fn () => $runtime->delete('Location', $location2->id), 'Occupied location deletion restricted');
check($runtime->find('Inventory', $stock2->id) !== null, 'Restricted deletion preserves stock');
$runtime->delete('Inventory', $stock2->id);
$runtime->delete('Location', $location2->id);
fails(fn () => $db->execute('UPDATE app_clog_inventory SET item_id = 999 WHERE id = ?', [$stock->id->raw()]) ?: $db->insert('app_clog_inventory', ['created_at'=>'x','updated_at'=>'x','name'=>'x','date_added'=>'x','item_id'=>999]), 'Foreign key enforcement');
check($db->select('PRAGMA foreign_key_check') === [], 'Foreign key check');
echo "PASS: SQLite CRUD, NULL, uniqueness, transactions, policies, GraphQL pagination/Node/mutations and cascades\n";

// Distinct and colliding IDs expose using an item ID as an inventory ID.
$db = new Database(':memory:');
Schema::install($db);
$app = new Application($db, new Viewer('1', 'editor'));
$runtime = $app->runtime;
$items = [];
for ($i = 1; $i <= 9; $i++) $items[$i] = $runtime->create('Item', ['name' => 'Item ' . $i]);
$location = $runtime->create('Location', ['name' => 'Deletion fixture']);
$stocks = [];
for ($i = 1; $i <= 21; $i++) {
    $stocks[$i] = $runtime->create('Inventory', [
        'dateAdded' => '2026-09-26T00:00:00Z',
        'item' => (string) $items[$i >= 20 ? 5 : 9]->id,
        'location' => (string) $location->id,
    ]);
}
check((string) $items[5]->id === (string) $stocks[5]->id, 'Fixture has colliding entity IDs');
$before = $db->select('SELECT * FROM app_clog_inventory ORDER BY id');
fails(fn () => $runtime->delete('Location', $location->id), 'Occupied location is restricted');
check($db->select('SELECT * FROM app_clog_inventory ORDER BY id') === $before, 'Rejected deletion preserves every stock row');
check($runtime->find('Location', $location->id) !== null, 'Rejected deletion preserves location');
$runtime->delete('Item', $items[5]->id);
check($runtime->find('Item', $items[5]->id) === null, 'Parent item deleted');
foreach ([20, 21] as $id) check($runtime->find('Inventory', $stocks[$id]->id) === null, 'Mismatched-ID dependent deleted');
foreach (range(1, 19) as $id) check($runtime->find('Inventory', $stocks[$id]->id) !== null, 'Unrelated stock preserved');
$runtime->delete('Inventory', $stocks[5]->id);
check($runtime->find('Inventory', $stocks[5]->id) === null, 'Child deleted');
check($runtime->find('Item', $items[9]->id) !== null, 'Child deletion preserves parent item');
check($runtime->find('Location', $location->id) !== null, 'Child deletion preserves location');
check($runtime->find('Inventory', $stocks[6]->id) !== null, 'Child deletion preserves sibling');
$runtime->delete('Item', $items[9]->id);
$runtime->delete('Location', $location->id);
check($runtime->find('Location', $location->id) === null, 'Empty location deleted');
check($db->select('PRAGMA foreign_key_check') === [], 'Deletion fixture has no orphaned references');
echo "PASS: upstream deletion traversal with mismatched/colliding IDs and child-parent isolation\n";

// Account actions use their own self-only policy, independent of inventory roles.
foreach (['editor', 'reader'] as $role) {
    $db->insert('clog_users', ['username' => $role, 'role' => $role, 'password_hash' => password_hash('original-password', PASSWORD_DEFAULT)]);
}
$passwordMutation = 'mutation($input:ChangeClogUserPasswordInput!){changeClogUserPassword(input:$input){clogUser{id} clientMutationId}}';
$changePassword = static function (Viewer $viewer, string $id, string $current = 'original-password', string $new = 'replacement-password') use ($db, $passwordMutation): array {
    return GraphQL::executeQuery(API::schema(new Application($db, $viewer)), $passwordMutation, variableValues: ['input' => [
        'id' => $id, 'currentPassword' => $current, 'newPassword' => $new, 'clientMutationId' => 'password-test',
    ]])->toArray();
};
$originalHashes = $db->select('SELECT password_hash FROM clog_users ORDER BY id');
foreach ([
    [new Viewer(), '1'],
    [new Viewer('1', 'editor'), '2'],
    [new Viewer('2', 'reader'), '1'],
    [new Viewer('1', 'editor'), '1', 'wrong-password'],
    [new Viewer('1', 'editor'), '1', 'original-password', 'short'],
    [new Viewer('1', 'editor'), '1', 'original-password', str_repeat('a', 73)],
    [new Viewer('1', 'editor'), '1', 'original-password', str_repeat('é', 37)],
    [new Viewer('1', 'editor'), '1', 'original-password', "invalid\0password"],
    [new Viewer('1', 'editor'), base64_encode('eleph:ClogItem:1')],
] as $arguments) {
    check(isset($changePassword(...$arguments)['errors']), 'Invalid or unauthorized password action rejected');
    check($db->select('SELECT password_hash FROM clog_users ORDER BY id') === $originalHashes, 'Rejected action leaves credentials unchanged');
}
foreach (['1' => 'editor', '2' => 'reader'] as $id => $role) {
    $result = $changePassword(new Viewer((string) $id, $role), base64_encode('eleph:ClogUser:' . $id));
    check(!isset($result['errors']), 'Both roles can change their own password: ' . json_encode($result));
    check($result['data']['changeClogUserPassword']['clogUser']['id'] === base64_encode('eleph:ClogUser:' . $id), 'Password action returns User identity');
    $hash = $db->scalar('SELECT password_hash FROM clog_users WHERE id = ?', [$id]);
    check(password_verify('replacement-password', $hash) && !password_verify('original-password', $hash), 'Only new password verifies');
    check(isset($changePassword(new Viewer((string) $id, $role), (string) $id)['errors']), 'Old password cannot authorize another change');
}
$db->execute('UPDATE clog_users SET enabled = 0 WHERE id = 2');
check(isset($changePassword(new Viewer('2', 'reader'), '2', 'replacement-password')['errors']), 'Disabled account denied');
echo "PASS: User password action ownership, validation, reader access and credential replacement\n";

// Account administration requires the admin flag, independent of inventory roles.
$db->insert('clog_users', ['username' => 'boss', 'role' => 'reader', 'admin' => 1, 'password_hash' => password_hash('original-password', PASSWORD_DEFAULT)]);
$admin = new Viewer('3', 'reader', true);
$account = static function (Viewer $viewer, string $query, array $variables = []) use ($db): array {
    return GraphQL::executeQuery(API::schema(new Application($db, $viewer)), $query, variableValues: $variables)->toArray();
};
$listQuery = '{clogUsers(first:2){totalCount edges{node{id username role isAdmin isEnabled isViewer}} pageInfo{hasNextPage endCursor}}}';
$editor = new Viewer('1', 'editor');
check($account($editor, $listQuery)['data']['clogUsers'] === null, 'Non-administrators cannot list accounts');
check($account($editor, 'query($id:ID!){clogUser(id:$id){username}}', ['id' => '3'])['data']['clogUser'] === null, 'Non-administrators cannot read other accounts');
check($account($editor, 'query($id:ID!){clogUser(id:$id){username}}', ['id' => '1'])['data']['clogUser']['username'] === 'editor', 'Accounts can read themselves');
$page = $account($admin, $listQuery)['data']['clogUsers'];
check($page['totalCount'] === 3 && $page['pageInfo']['hasNextPage'], 'Administrators page accounts with totals');
check(array_column(array_column($page['edges'], 'node'), 'username') === ['boss', 'editor'], 'Accounts are ordered by username');
check($page['edges'][0]['node']['isAdmin'] && $page['edges'][0]['node']['isViewer'] && $page['edges'][0]['node']['role'] === 'READER', 'Account fields');
$rest = $account($admin, 'query($after:String){clogUsers(first:2,after:$after){edges{node{username isEnabled}} pageInfo{hasNextPage}}}', ['after' => $page['pageInfo']['endCursor']])['data']['clogUsers'];
check($rest['edges'] === [['node' => ['username' => 'reader', 'isEnabled' => false]]] && !$rest['pageInfo']['hasNextPage'], 'Account pagination');
check(isset($account($admin, '{clogUsers(last:1){totalCount}}')['errors']), 'Account pagination is forward only');

$create = 'mutation($input:CreateClogUserInput!){createClogUser(input:$input){clogUser{id username role isAdmin}}}';
$newAccount = ['username' => 'helper', 'password' => 'helper-password', 'role' => 'EDITOR', 'isAdmin' => false];
$accounts = $db->select('SELECT * FROM clog_users ORDER BY id');
foreach ([
    [$editor, $newAccount],
    [$admin, ['username' => 'bad name'] + $newAccount],
    [$admin, ['username' => 'EDITOR'] + $newAccount],
    [$admin, ['password' => 'short'] + $newAccount],
    [$admin, ['password' => str_repeat('a', 73)] + $newAccount],
] as [$viewer, $input]) {
    check(isset($account($viewer, $create, ['input' => $input])['errors']), 'Invalid or unauthorized account creation rejected');
    check($db->select('SELECT * FROM clog_users ORDER BY id') === $accounts, 'Rejected creation leaves accounts unchanged');
}
$created = $account($admin, $create, ['input' => $newAccount]);
check(!isset($created['errors']) && $created['data']['createClogUser']['clogUser']['username'] === 'helper', 'Administrator creates account: ' . json_encode($created));
check($created['data']['createClogUser']['clogUser']['role'] === 'EDITOR' && !$created['data']['createClogUser']['clogUser']['isAdmin'], 'Created account role');
$helperId = $created['data']['createClogUser']['clogUser']['id'];
check(password_verify('helper-password', $db->scalar("SELECT password_hash FROM clog_users WHERE username = 'helper'")), 'Created account password');

$reset = 'mutation($input:ResetClogUserPasswordInput!){resetClogUserPassword(input:$input){clogUser{id}}}';
$accounts = $db->select('SELECT * FROM clog_users ORDER BY id');
foreach ([
    [$editor, ['id' => $helperId, 'newPassword' => 'another-password']],
    [$admin, ['id' => '3', 'newPassword' => 'another-password']],
    [$admin, ['id' => $helperId, 'newPassword' => 'short']],
    [$admin, ['id' => '999', 'newPassword' => 'another-password']],
    [$admin, ['id' => base64_encode('eleph:ClogItem:1'), 'newPassword' => 'another-password']],
] as [$viewer, $input]) {
    check(isset($account($viewer, $reset, ['input' => $input])['errors']), 'Invalid or unauthorized reset rejected');
    check($db->select('SELECT * FROM clog_users ORDER BY id') === $accounts, 'Rejected reset leaves credentials unchanged');
}
check(!isset($account($admin, $reset, ['input' => ['id' => $helperId, 'newPassword' => 'another-password']])['errors']), 'Administrator resets password');
check(password_verify('another-password', $db->scalar("SELECT password_hash FROM clog_users WHERE username = 'helper'")), 'Reset password verifies');

$delete = 'mutation($input:DeleteClogUserInput!){deleteClogUser(input:$input){deletedId}}';
$stockBefore = $app->queries->search('Inventory')->count();
foreach ([[$editor, $helperId], [$admin, '3'], [$admin, '999']] as [$viewer, $id]) {
    check(isset($account($viewer, $delete, ['input' => ['id' => $id]])['errors']), 'Invalid or unauthorized deletion rejected');
}
check((int) $db->scalar('SELECT COUNT(*) FROM clog_users') === 4, 'Rejected deletion keeps accounts');
$deleted = $account($admin, $delete, ['input' => ['id' => $helperId]]);
check(($deleted['data']['deleteClogUser']['deletedId'] ?? null) === $helperId, 'Administrator deletes account: ' . json_encode($deleted));
check($db->scalar("SELECT COUNT(*) FROM clog_users WHERE username = 'helper'") === 0, 'Deleted account removed');
check($app->queries->search('Inventory')->count() === $stockBefore, 'Account deletion leaves inventory unchanged');
echo "PASS: Account administration authorization, validation, pagination, reset and deletion\n";
