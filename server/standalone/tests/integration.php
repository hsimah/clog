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
