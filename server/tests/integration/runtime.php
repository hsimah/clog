<?php

use Clog\Runtime\Clog;
use Eleph\Runtime\Identity\EntityId;

// Runs only in the disposable stack created by tests/docker-compose.yml.
function check(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
    WP_CLI::log('PASS ' . $message);
}

function rejected(callable $operation, string $message): void
{
    try {
        $operation();
    } catch (Throwable $failure) {
        WP_CLI::log('PASS ' . $message . ' (' . $failure->getMessage() . ')');
        return;
    }
    throw new RuntimeException('Expected rejection: ' . $message);
}

$clog = Clog::instance();
$gateway = $clog->gateway();
$admin = get_current_user_id();
$seedIds = array_map(static fn ($row): string => (string) $row->getId(), $gateway->all('Inventory')->all());
check($admin > 0, 'authorized CLI identity');
check($clog->tables()->plan()->isEmpty(), 'fresh schema matches manifest');
check([] === $clog->tables()->install(), 'schema installation is idempotent');

$item = $gateway->create('Item', ['name' => 'Test item', 'barcode' => '00001234']);
$location = $gateway->create('Location', ['name' => 'Test shelf']);
$otherLocation = $gateway->create('Location', ['name' => 'Test freezer']);
check('00001234' === $item->entity->getBarcode(), 'barcode leading zeroes survive');
check($item->entity->getCreatedAt() instanceof DateTimeImmutable, 'creation timestamp supplied by runtime');
check($item->entity->getUpdatedAt() instanceof DateTimeImmutable, 'modification timestamp supplied by runtime');
$createdAt = $item->entity->getCreatedAt();
$gateway->create('Item', ['name' => 'No barcode one', 'barcode' => null]);
$gateway->create('Item', ['name' => 'No barcode two', 'barcode' => null]);
rejected(fn () => $gateway->create('Item', ['name' => 'Duplicate', 'barcode' => '00001234']), 'duplicate barcode');
$gateway->update('Item', $item->id, ['barcode' => null, 'name' => 'Test item']);
check(null === $gateway->find('Item', $item->id)->getBarcode(), 'cleared barcode persists SQL NULL, not empty string');
check('Test item' === $gateway->find('Item', $item->id)->getName(), 'nullable update preserves following field bindings');
$cleared = $gateway->create('Item', ['name' => 'Second cleared barcode', 'barcode' => '00998877']);
$gateway->update('Item', $cleared->id, ['barcode' => null]);
check(null === $gateway->find('Item', $cleared->id)->getBarcode(), 'multiple cleared barcodes remain independently nullable');
$gateway->update('Item', $item->id, ['barcode' => '00001234']);
rejected(fn () => $gateway->create('Location', ['name' => 'Test shelf']), 'duplicate location');
rejected(fn () => $gateway->create('Item', []), 'required item name');

$stock = $gateway->create('Inventory', [
    'item' => $item->id->raw(),
    'location' => $location->id->raw(),
    'dateAdded' => '2026-09-25T12:00:00Z',
]);
check('Test item @ Test shelf' === $stock->entity->getName(), 'inventory display label derived without client input');
check((string) $stock->entity->getItem()->getId() === (string) $item->id, 'item edge persisted');
check((string) $stock->entity->getLocation()->getId() === (string) $location->id, 'location edge persisted');
rejected(fn () => $gateway->create('Inventory', ['dateAdded' => '2026-09-25T12:00:00Z']), 'required stock relationships');
rejected(fn () => $gateway->create('Inventory', [
    'item' => $item->id->raw(), 'location' => 999999999, 'dateAdded' => '2026-09-25T12:00:00Z',
]), 'nonexistent stock relationship');

$updated = $gateway->update('Inventory', $stock->id, [
    'dateAdded' => '2026-09-24T12:00:00Z',
    'location' => $otherLocation->id->raw(),
    'name' => 'Client cannot override the label',
]);
check('Test item @ Test freezer' === $updated->entity->getName(), 'field and relationship update together');
$before = $updated->entity->getDateAdded();
rejected(fn () => $gateway->update('Inventory', $stock->id, [
    'dateAdded' => '2026-09-20T12:00:00Z', 'location' => 999999999,
]), 'invalid edge rejects entire update');
$after = $gateway->find('Inventory', $stock->id);
check($before == $after->getDateAdded(), 'failed update preserves fields');
check((string) $after->getLocation()->getId() === (string) $otherLocation->id, 'failed update preserves edge');
rejected(fn () => $gateway->delete('Location', $otherLocation->id), 'stocked location deletion restricted');
$renamed = $gateway->update('Item', $item->id, ['name' => 'Renamed', 'createdAt' => '2000-01-01T00:00:00Z']);
check($createdAt == $renamed->entity->getCreatedAt(), 'client cannot overwrite managed creation time');

$result = graphql(['query' => '{ clogItems(first: 100) { nodes { id name } } }']);
check(empty($result['errors']), 'GraphQL collection resolves');
$node = array_values(array_filter($result['data']['clogItems']['nodes'], fn ($row) => 'Renamed' === $row['name']))[0];
$detail = graphql([
    'query' => 'query($id: ID!) { node(id: $id) { id ... on ClogItem { name } } }',
    'variables' => ['id' => $node['id']],
]);
check(empty($detail['errors']) && 'Renamed' === $detail['data']['node']['name'], 'global Node identity round-trips');
$mutation = graphql([
    'query' => 'mutation($input: CreateClogInventoryInput!) { createClogInventory(input: $input) { clogInventory { id name item { id } } } }',
    'variables' => ['input' => [
        'item' => $node['id'],
        'location' => (string) $otherLocation->id,
        'dateAdded' => '2026-09-25T12:00:00Z',
    ]],
]);
check(empty($mutation['errors']), 'GraphQL creates stock with managed timestamps and label');
check($node['id'] === $mutation['data']['createClogInventory']['clogInventory']['item']['id'], 'GraphQL decodes global edge IDs');
$locationNodes = graphql(['query' => '{ clogLocations(first: 100) { nodes { id name } } }']);
$locationNode = array_values(array_filter($locationNodes['data']['clogLocations']['nodes'], fn ($row) => 'Test freezer' === $row['name']))[0];
$policyCases = [
    ['Item', $item->id, $node['id'], ['name' => 'Unauthorized item']],
    ['Location', $otherLocation->id, $locationNode['id'], ['name' => 'Unauthorized location']],
    ['Inventory', $stock->id, $mutation['data']['createClogInventory']['clogInventory']['id'], [
        'item' => $node['id'], 'location' => $locationNode['id'], 'dateAdded' => '2026-09-25T12:00:00Z',
    ]],
];

wp_set_current_user(0);
rejected(fn () => $gateway->find('Item', $item->id), 'anonymous entity read denied');
rejected(fn () => $gateway->create('Item', ['name' => 'Unauthorized']), 'anonymous write denied');
$anonymous = graphql(['query' => '{ clogItems(first: 100) { nodes { id name } } }']);
check(empty($anonymous['data']['clogItems']['nodes']), 'anonymous collection does not disclose stock');
foreach ($policyCases as [$entity, $id, $globalId]) {
    rejected(fn () => $gateway->find($entity, $id), 'anonymous ' . $entity . ' lookup denied');
    $lookup = graphql(['query' => 'query($id: ID!) { node(id: $id) { id } }', 'variables' => ['id' => $globalId]]);
    check(empty($lookup['data']['node']), 'anonymous GraphQL ' . $entity . ' node denied');
}
$reader = wp_insert_user(['user_login' => 'clog-reader', 'user_pass' => 'test-only', 'role' => 'subscriber']);
check(is_int($reader), 'reader account created');
wp_set_current_user($reader);
check(null !== $gateway->find('Item', $item->id), 'signed-in household reader can read');
rejected(fn () => $gateway->create('Location', ['name' => 'Unauthorized shelf']), 'reader write denied');
rejected(fn () => $gateway->update('Item', $item->id, ['name' => 'Unauthorized']), 'reader update denied');
rejected(fn () => $gateway->delete('Item', $item->id), 'reader deletion denied');
foreach ($policyCases as [$entity, $id, $globalId, $createInput]) {
    check(null !== $gateway->find($entity, $id), 'reader can read ' . $entity);
    foreach (['create', 'update', 'delete'] as $verb) {
        $input = match ($verb) {
            'create' => $createInput,
            'update' => ['id' => $globalId, 'name' => 'Unauthorized rename'],
            'delete' => ['id' => $globalId],
        };
        $type = ucfirst($verb) . 'Clog' . $entity . 'Input!';
        $field = $verb . 'Clog' . $entity;
        $payload = 'delete' === $verb ? 'deletedId' : 'clog' . $entity . ' { id }';
        $denied = graphql(['query' => 'mutation($input: ' . $type . ') { ' . $field . '(input: $input) { ' . $payload . ' } }',
            'variables' => ['input' => $input]]);
        check(!empty($denied['errors']), 'reader GraphQL ' . $verb . ' ' . $entity . ' denied');
    }
}
$edges = graphql(['query' => '{ clogInventoryEntries(first: 100) { nodes { item { id name } location { id name } } } }']);
check(empty($edges['errors']) && !empty($edges['data']['clogInventoryEntries']['nodes'][0]['item']), 'reader can traverse inventory relationships');
$writer = wp_insert_user(['user_login' => 'clog-writer', 'user_pass' => 'test-only', 'role' => 'author']);
check(is_int($writer), 'writer account created');
wp_set_current_user($writer);
$writerItem = $gateway->create('Item', ['name' => 'Writer item']);
check('Writer renamed' === $gateway->update('Item', $writerItem->id, ['name' => 'Writer renamed'])->entity->getName(), 'edit_posts user can create and update');
$gateway->delete('Item', $writerItem->id);
check(null === $gateway->find('Item', $writerItem->id), 'edit_posts user can delete');
wp_set_current_user($admin);

$gateway->delete('Item', $item->id);
check(null === $gateway->find('Inventory', $stock->id), 'item deletion cascades to stock');
foreach ($seedIds as $seedId) {
    check(null !== $gateway->find('Inventory', EntityId::of($seedId)), 'cascade preserves unrelated stock ' . $seedId);
}
$gateway->delete('Location', $otherLocation->id);
check(null === $gateway->find('Location', $otherLocation->id), 'empty location can be deleted');
global $wpdb;
check(0 === (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type IN ('clog_item', 'clog_location', 'clog_inventory')"), 'entity writes do not create post projections');
WP_CLI::success('Clog runtime and GraphQL integration checks passed.');
