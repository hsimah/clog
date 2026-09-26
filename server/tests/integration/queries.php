<?php

use Clog\Runtime\Clog;
use Eleph\WPGraphQL\Relay\GlobalId;

function queryCheck(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
    WP_CLI::log('PASS ' . $message);
}
function queryResult(string $query, array $variables = []): array {
    $result = graphql(['query' => $query, 'variables' => $variables]);
    if (!empty($result['errors'])) throw new RuntimeException(wp_json_encode($result['errors']));
    return $result['data'];
}
$gateway = Clog::instance()->gateway();
$admin = get_current_user_id();
$baseline = queryResult('{ clogSummary { items locations inventory } }')['clogSummary'];
$location = $gateway->create('Location', ['name' => 'Pagination shelf']);
$other = $gateway->create('Location', ['name' => 'Pagination freezer']);
$items = [];
for ($n = 0; $n < 125; $n++) {
    $item = $gateway->create('Item', ['name' => sprintf('Pagination item %03d', $n), 'barcode' => sprintf('000%05d', $n)]);
    $items[] = $item;
    $gateway->create('Inventory', ['item' => $item->id->raw(), 'location' => $location->id->raw(), 'dateAdded' => '2020-01-01T00:00:00Z']);
}
// Another 125 physical units of the same item must not duplicate item search results.
for ($n = 0; $n < 125; $n++) {
    $gateway->create('Inventory', ['item' => $items[0]->id->raw(), 'location' => $other->id->raw(), 'dateAdded' => '2021-01-01T00:00:00Z']);
}
$shelf = GlobalId::encode('ClogLocation', (string) $location->id);
$freezer = GlobalId::encode('ClogLocation', (string) $other->id);
$firstItem = GlobalId::encode('ClogItem', (string) $items[0]->id);
$lastItem = GlobalId::encode('ClogItem', (string) $items[124]->id);
$search = 'query($after: String) { clogItemSearch(where: {term: "Pagination item"}, first: 37, after: $after) { totalCount edges { cursor node { id name } } pageInfo { hasNextPage endCursor } } }';
$ids = [];
$cursor = null;
do {
    $connection = queryResult($search, ['after' => $cursor])['clogItemSearch'];
    queryCheck(125 === $connection['totalCount'], 'search count ignores the current page');
    foreach ($connection['edges'] as $edge) $ids[] = $edge['node']['id'];
    $cursor = $connection['pageInfo']['hasNextPage'] ? $connection['pageInfo']['endCursor'] : null;
} while (null !== $cursor);
queryCheck(125 === count(array_unique($ids)) && 125 === count($ids), 'more than 100 items page without missing or duplicate records');
queryCheck($firstItem === $ids[0] && $lastItem === $ids[124], 'stable name ordering across pages');
$detail = queryResult('query($id: ID!) { node(id: $id) { id ... on ClogItem { name stockCount } } }', ['id' => $lastItem]);
queryCheck('Pagination item 124' === $detail['node']['name'], 'detail is independent of the loaded page');
$barcode = queryResult('{ clogItemSearch(where: {term: "00000124"}) { totalCount nodes { barcode } } }')['clogItemSearch'];
queryCheck(1 === $barcode['totalCount'] && '00000124' === $barcode['nodes'][0]['barcode'], 'barcode search preserves leading zeroes');
$filtered = queryResult('query($location: ID!) { clogItemSearch(where: {location: $location}) { totalCount nodes { id stockCount(location: $location) } } }', ['location' => $freezer])['clogItemSearch'];
queryCheck(1 === $filtered['totalCount'] && 125 === $filtered['nodes'][0]['stockCount'], 'location-filtered item list and stock count are complete');
$stock = queryResult('query($item: ID!, $location: ID!) { clogInventorySearch(where: {item: $item, location: $location}, first: 100) { totalCount nodes { id } pageInfo { endCursor hasNextPage } } }', ['item' => $firstItem, 'location' => $freezer])['clogInventorySearch'];
queryCheck(125 === $stock['totalCount'] && 100 === count($stock['nodes']) && $stock['pageInfo']['hasNextPage'], 'stock pagination never truncates totals');
$next = queryResult('query($item: ID!, $location: ID!, $after: String!) { clogInventorySearch(where: {item: $item, location: $location}, first: 100, after: $after) { nodes { id } pageInfo { hasNextPage } } }', ['item' => $firstItem, 'location' => $freezer, 'after' => $stock['pageInfo']['endCursor']])['clogInventorySearch'];
queryCheck(25 === count($next['nodes']) && !$next['pageInfo']['hasNextPage'], 'remaining stock page is complete');
queryCheck(125 === queryResult('{ clogInventorySearch(where: {term: "Pagination freezer"}) { totalCount } }')['clogInventorySearch']['totalCount'], 'inventory search includes location names');
queryCheck(1 === queryResult('{ clogInventorySearch(where: {term: "item 124"}) { totalCount } }')['clogInventorySearch']['totalCount'], 'inventory search includes item names');
$locations = queryResult('query($item: ID!) { clogLocationSearch(where: {item: $item}) { totalCount nodes { stockCount(item: $item) } } }', ['item' => $firstItem])['clogLocationSearch'];
queryCheck(2 === $locations['totalCount'] && 126 === array_sum(array_column($locations['nodes'], 'stockCount')), 'item location breakdown counts all units');
$summary = queryResult('{ clogSummary { items locations inventory } }')['clogSummary'];
queryCheck($baseline['items'] + 125 === $summary['items'] && $baseline['inventory'] + 250 === $summary['inventory'], 'dashboard totals are authoritative');
// The workspace groups items before paging; it must not group a truncated stock page.
$empty = $gateway->create('Item', ['name' => 'Pagination item empty']);
$groupQuery = 'query($after: String) { clogStockedItems(where: {term: "Pagination item"}, first: 37, after: $after) { totalCount edges { node { id stockCount } } pageInfo { hasNextPage endCursor } } }';
$groupIds = [];
$groupUnits = 0;
$cursor = null;
do {
    $groups = queryResult($groupQuery, ['after' => $cursor])['clogStockedItems'];
    queryCheck(125 === $groups['totalCount'], 'stocked-item count excludes empty items and ignores page size');
    foreach ($groups['edges'] as $edge) {
        $groupIds[] = $edge['node']['id'];
        $groupUnits += $edge['node']['stockCount'];
    }
    $cursor = $groups['pageInfo']['hasNextPage'] ? $groups['pageInfo']['endCursor'] : null;
} while (null !== $cursor);
queryCheck($ids === $groupIds && 250 === $groupUnits, 'stocked groups page deterministically without duplicate or missing units');
queryCheck(126 === queryResult('{ clogItemSearch(where: {term: "Pagination item"}) { totalCount } }')['clogItemSearch']['totalCount'], 'catalogue still includes items with no stock');
$groupFilter = 'query($location: ID, $term: String) { clogStockedItems(where: {term: $term, location: $location}) { totalCount nodes { id stockCount(location: $location) } } }';
$freezerGroups = queryResult($groupFilter, ['term' => 'Pagination freezer'])['clogStockedItems'];
queryCheck(1 === $freezerGroups['totalCount'] && $firstItem === $freezerGroups['nodes'][0]['id'], 'stocked search matches location names without duplicating item groups');
$freezerGroups = queryResult($groupFilter, ['location' => $freezer, 'term' => '00000000'])['clogStockedItems'];
queryCheck(1 === $freezerGroups['totalCount'] && 125 === $freezerGroups['nodes'][0]['stockCount'], 'stocked search combines barcode and location filters with accurate counts');
queryCheck(0 === queryResult($groupFilter, ['location' => $shelf, 'term' => 'Pagination freezer'])['clogStockedItems']['totalCount'], 'a location name match must belong to the selected location');
queryCheck(!empty(graphql(['query' => $groupFilter, 'variables' => ['location' => $firstItem]])['errors']), 'stocked query rejects a location ID with the wrong type');
foreach (['last: 5', 'first: 101', 'after: "invalid"'] as $arguments) {
    queryCheck(!empty(graphql(['query' => '{ clogStockedItems(' . $arguments . ') { totalCount } }'])['errors']), 'stocked query uses the shared pagination validation');
}
foreach (['Item', 'Location', 'Inventory'] as $entity) {
    $id = GlobalId::encode('Clog' . $entity, 1);
    $sameNumber[$entity] = queryResult('query($id: ID!) { node(id: $id) { id __typename } }', ['id' => $id])['node'];
}
queryCheck(3 === count(array_unique(array_column($sameNumber, 'id'))), 'equal numeric IDs occupy distinct Relay records');
$raw = queryResult('query($id: ID!) { clogItem(id: $id) { id } }', ['id' => (string) $items[124]->id]);
queryCheck($lastItem === $raw['clogItem']['id'], 'old raw-ID detail links resolve to canonical global IDs');
$updated = queryResult('mutation($input: UpdateClogItemInput!) { updateClogItem(input: $input) { clogItem { id name stockCount } } }', ['input' => ['id' => $lastItem, 'name' => 'Pagination renamed']]);
queryCheck($lastItem === $updated['updateClogItem']['clogItem']['id'], 'mutation response uses the same Relay identity');
foreach (['{ clogItemSearch(last: 5) { totalCount } }', '{ clogItemSearch(after: "invalid") { totalCount } }', '{ clogItemSearch(first: 101) { totalCount } }'] as $invalidQuery) {
    queryCheck(!empty(graphql(['query' => $invalidQuery])['errors']), 'unsupported pagination is rejected explicitly');
}
$wrongType = graphql(['query' => 'query($id: ID!) { clogItemSearch(where: {location: $id}) { totalCount } }', 'variables' => ['id' => $firstItem]]);
queryCheck(!empty($wrongType['errors']), 'search rejects a global ID for the wrong entity type');
$literal = $gateway->create('Item', ['name' => 'Literal %_ marker']);
queryCheck(1 === queryResult('{ clogItemSearch(where: {term: "%_"}) { totalCount } }')['clogItemSearch']['totalCount'], 'search treats SQL wildcard characters literally');
$literalUnit = $gateway->create('Inventory', ['item' => $literal->id->raw(), 'location' => $location->id->raw(), 'dateAdded' => '2020-01-01T00:00:00Z']);
queryCheck(1 === queryResult('{ clogStockedItems(where: {term: "%_"}) { totalCount } }')['clogStockedItems']['totalCount'], 'stocked search escapes SQL wildcard characters');
$gateway->delete('Inventory', $literalUnit->id);
queryCheck(0 === queryResult('{ clogStockedItems(where: {term: "%_"}) { totalCount } }')['clogStockedItems']['totalCount'], 'removing the last unit removes its item from workspace groups');
$deleted = queryResult('mutation($input: DeleteClogItemInput!) { deleteClogItem(input: $input) { deletedId } }', ['input' => ['id' => GlobalId::encode('ClogItem', (string) $literal->id)]]);
queryCheck(GlobalId::encode('ClogItem', (string) $literal->id) === $deleted['deleteClogItem']['deletedId'], 'delete payload identifies the Relay record to remove');
wp_set_current_user(0);
$anonymous = queryResult('{ clogStockedItems { totalCount nodes { id } } clogSummary { inventory } clogItemSearch { totalCount nodes { id stockCount } } clogInventorySearch { totalCount nodes { id } } }');
queryCheck(0 === $anonymous['clogStockedItems']['totalCount'] && [] === $anonymous['clogStockedItems']['nodes'] && null === $anonymous['clogSummary'] && 0 === $anonymous['clogItemSearch']['totalCount'] && [] === $anonymous['clogInventorySearch']['nodes'], 'aggregates and search do not disclose anonymous inventory');
wp_set_current_user($admin);
WP_CLI::success('Paginated inventory query contract passed.');
