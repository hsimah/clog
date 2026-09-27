# Inventory GraphQL contract

The generated Elephentity types remain `ClogItem`, `ClogLocation`, and
`ClogInventory`. The app should use the search connections below, not compute
counts from its loaded page. All reads require a signed-in account;
writes require the `inventory.write` capability (the editor role) and use the generated mutations.

## Queries for screens and selectors

| Field | `where` filters | Ordering |
| --- | --- | --- |
| `clogStockedItems` | `term`, `location` | name ascending, then database ID ascending |
| `clogItemSearch` | `term`, `location` | name ascending, then database ID ascending |
| `clogLocationSearch` | `term`, `item` | name ascending, then database ID ascending |
| `clogInventorySearch` | `term`, `item`, `location` | dateAdded descending, then database ID ascending |

Item search matches name **or** barcode, including leading zeroes and numeric item
names. Inventory search matches item name/barcode or location name. Location
search matches its name. Terms are trimmed and capped at 200 characters; `%`, `_`
and backslash are literal, not SQL wildcards. Search uses SQLite LIKE with ASCII case-insensitive matching;
uniqueness and ordering use the application's Unicode lowercase collation. Omitted/null filters mean no restriction.

The inventory workspace uses `clogStockedItems`: it excludes items without stock,
returns each item once, and searches item name/barcode **or** the names of locations
holding that item. With a location filter, the text match must be satisfied at that
location. A name match selects the item group; `stockCount(location:)` still counts
all its units in the selected location (or everywhere when no location is selected).
Removing an item's last unit removes its group. The catalogue and item selector
continue to use `clogItemSearch` so unstocked items remain available.

Filtering items by location returns each stocked item once, regardless of how
many units it has. Filtering locations by item similarly returns each occupied
location once. The same connections without stock filters are paginated selectors
that include empty locations and unstocked items.

```graphql
query ItemsAtLocation($location: ID, $term: String, $after: String) {
  clogStockedItems(first: 25, after: $after, where: {location: $location, term: $term}) {
    totalCount
    edges { cursor node { id name barcode stockCount(location: $location) } }
    pageInfo { hasNextPage endCursor }
  }
}
```

Every search connection supplies `nodes`, `edges`, `pageInfo` and an authoritative
`totalCount` for the **whole filtered set**. `first` is 1–100 (default 10), and
`after` is opaque. Only forward pagination is supported; `last`, `before`, invalid
cursors and out-of-range page sizes produce explicit errors. A cursor belongs to
the current filter/order context: reset to the first page when filters change.

The current Elephentity cursor represents an offset. Ordering is stable for an
unchanged dataset; inserting, deleting or renaming rows between page requests can
shift offsets. Refetch from the first page after writes, or on an explicit refresh,
instead of appending an old cursor to a changed collection. Relay connection keys
must include `where` among their filters.

## Totals and location breakdowns

- `clogSummary { items locations inventory }` returns full dashboard counts.
- `ClogItem.stockCount(location: ID)` counts its units everywhere or at one location.
- `ClogLocation.stockCount(item: ID)` counts all its units or units of one item.
- For an item's location breakdown, page `clogLocationSearch(where: {item: $id})`
  and request each node's `stockCount(item: $id)`.
- For actual units at a given item/location, use `clogInventorySearch` with both IDs.

The custom queries perform SQL counting and page selection; they do not hydrate
all matching stock. Rows returned on a page still pass through the entity gateway.
Aggregate authorization shares `SignedInUsers::allows` with the generated read
policy. This relies on Clog's current uniform read policy: if row-specific access
is introduced, update the SQL counts/search authorization in the same change.
Anonymous searches return no nodes and zero counts; `clogSummary` returns null.

Generated collection roots and inverse `inventoryEntries` connections remain
available for compatibility. Their locked runtime counts hydrate policy-checked
rows, and their ordering is not the app's explicit search ordering; prefer the
search connections and aggregate fields for the new UI.

## Identity, detail routes and mutations

Use opaque global `id` values as Relay records and route parameters. The same raw
number in the three tables produces three different global IDs. A detail route
must fetch `node(id: $id)` (with a type fragment) or the singular root directly;
it must not search a previously loaded collection page.

Legacy numeric links can resolve with `clogItem(id:)`, `clogLocation(id:)` or
`clogInventory(id:)`, then use the returned canonical global ID. `node(id:)`
expects a global ID. IDs refer directly to the entity tables.
Search filter IDs and `stockCount` arguments accept raw database IDs for transition,
but reject a global ID for the wrong entity type.

Generated create/update mutations return the entity with its canonical ID;
delete mutations return `deletedId`. Relay can normalize returned fields and
remove deleted records by these IDs. Connection membership, ordering and aggregate
counts still need refetching:

| Write | Refetch/invalidate |
| --- | --- |
| Item create/rename/barcode/delete | item searches/details, inventory searches matching its name/barcode, dashboard; deletion also changes stock/location totals |
| Location create/rename/delete | location searches/details, inventory searches matching its name, dashboard |
| Inventory create/update/delete | inventory searches, affected item/location totals and breakdowns, dashboard, item/location searches filtered by stock |

Reset affected active connections to the first page. Avoid guessing which of an
arbitrary set of filters a changed row belongs to. Never automatically replay a
mutation after losing its response; it may already have committed. Session changes
must dispose of the Relay store using the shared session subscription from #34.

## Reproduce the contract

```sh
scripts/test-standalone.sh
scripts/php.sh php standalone/tests/export-schema.php
scripts/node.sh npm run relay:contract
scripts/node.sh npm run relay:check
```

The backend tests use isolated SQLite databases; the exporter builds the actual
schema in memory and writes `client/schema.graphql`. Pass `--check` to verify it
without writing. The compiler fixture in `client/relay-contract` proves a Relay
connection query compiles against that schema. CI verifies the snapshot and the
checked-in Relay artifacts. Browser tests cover pagination beyond 100 units,
filters, totals, detail lookup, writes, and account/session behavior.

`Clog\Standalone\GraphQL` combines the generated schema with application search
and aggregate fields. It validates typed IDs and forward-only pagination before
calling the application queries. Never edit generated or vendor files.
