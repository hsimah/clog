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

wp_set_current_user(0);
rejected(fn () => $gateway->find('Item', $item->id), 'anonymous entity read denied');
rejected(fn () => $gateway->create('Item', ['name' => 'Unauthorized']), 'anonymous write denied');
$anonymous = graphql(['query' => '{ clogItems(first: 100) { nodes { id name } } }']);
check(empty($anonymous['data']['clogItems']['nodes']), 'anonymous collection does not disclose stock');
$reader = wp_insert_user(['user_login' => 'clog-reader', 'user_pass' => 'test-only', 'role' => 'subscriber']);
check(is_int($reader), 'reader account created');
wp_set_current_user($reader);
check(null !== $gateway->find('Item', $item->id), 'signed-in household reader can read');
rejected(fn () => $gateway->create('Location', ['name' => 'Unauthorized shelf']), 'reader write denied');
rejected(fn () => $gateway->update('Item', $item->id, ['name' => 'Unauthorized']), 'reader update denied');
rejected(fn () => $gateway->delete('Item', $item->id), 'reader deletion denied');
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
