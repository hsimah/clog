# Relay in Clog

The runtime/compiler use Relay 21. Astryx/StyleX are independent of data
ownership. All application data uses route-owned Relay queries; there is no
Apollo cache or global collection provider.

- `scripts/node.sh npm run relay` regenerates application artifacts from
  `client/schema.graphql` and rebuilds `persisted_queries.json` from empty to
  remove old operation versions. Query text remains in the artifacts, so the
  HTTP transport continues sending full queries. Commit both outputs with their
  source operations, then run `npm run routes` through the Node wrapper and
  `scripts/php.sh vendor/bin/eleph generate` to update the SSR manifests.
- `scripts/node.sh npm run relay:check` validates both the application artifacts
  and the API contract fixture. CI/release builds run this without a live server.
- `scripts/php.sh php standalone/tests/export-schema.php` refreshes the schema
  using an in-memory SQLite database. Pass `--check` to verify the snapshot.

Tsquid entrypoints own initial query references and preload the complete route
query graph on navigation and link hover/focus. `routes.json` defines the URL
inputs; generated route contexts provide typed reads and scoped `updateURI`.
Route roots read the references with `usePreloadedQuery` under Suspense, while
feature components read colocated `useFragment` or `usePaginationFragment` data.

`useRouteQuery` retains explicit list refreshes and on-demand picker/drilldown
queries. Its optional initial reference comes from the entrypoint and is not
loaded twice. References it creates are disposed on replacement and unmount,
releasing retention and canceling network work. Query boundaries retry failed
reads; the application boundary handles route parsing and entrypoint errors.
Keep loading, not-found, empty, and error states distinct. Do not duplicate Relay
response shapes as handwritten entity models or load whole collections into
application context.

The location list uses a 25-row `clogLocationSearch` connection and its `where`
filter is part of the Relay connection identity. Totals are server counts. Search
and successful writes reset to the first page rather than appending to a shifting
offset cursor. Detail/edit routes call `clogLocation(id:)` directly, preserving
raw numeric URLs as well as global IDs. Names and route keys use normalized global
IDs returned by the server. More contract rules: `server/docs/graphql-contract.md`.

`relay/environment.ts` uses the common cookie/nonce `sessionFetch` transport and
abortable Observable subscriptions. HTTP, GraphQL and malformed payload failures
reach the query boundary or mutation callback. No operation retries automatically.
Account changes/logout abort in-flight work and clear the entire record source;
the session boundary unmounts its authenticated children and requires a reload.
Same-account session recovery preserves form state while the UI is hidden/inert.
No Relay records or credentials are persisted in browser storage.

Each mutation document belongs in its own `use…Mutation.ts` hook, which calls
`useSaveMutation` for writes. It exposes Relay's pending state, marks the store
stale after a successful payload, and suppresses component callbacks after unmount.
Request the fragments needed to normalize updated records. A successful write
refreshes its owning list route; deletions use `@deleteRecord`. Disable duplicate
submits; preserve input and tell the user to check inventory before retrying an
uncertain write. Respect `canWrite` in the UI; server policy remains authoritative.

## Inventory workspace

`clogStockedItems` pages item groups before loading physical units. A group's
quantity and each location breakdown use server `stockCount` fields, never loaded
array lengths. Expanding an item fetches a paginated occupied-location connection;
a selected location fetches its own count directly. The details carousel pages
`clogInventorySearch` and resets after writes. All stock actions live in that panel.

Location tabs are paginated; an off-page selected location is fetched directly.
Search and location filters live in URL parameters. Nested item/location/stock
routes keep those parameters through open, edit, save, close, reload and browser
history. The root `/` displays Overview; workspace links use `/inventory`.
Standalone item and location pages retain their own route contexts.

Inventory creation uses paginated item/location selectors and creates one physical
unit. Date editing does not change its item or location. Lost write responses are
reported without replay; all writes use the shared session gate and pending state.

## Initial item stock and scanning

New items are created once, then their optional initial stock is added sequentially.
The form records the returned item ID before adding any units, reports confirmed
additions, and disables item creation once that ID is known. A failed stock response
stops the batch; its result may be uncertain, so the form links to the saved item
for review instead of replaying it or recreating the item. Leaving the route stops
further additions after the current request; pending work warns before tab closure.
Location selection uses server search and a paginated connection, including choices
outside the first page.

The Astryx scanner offers manual input even if camera permission or detection fails.
Its hook invalidates old capture sessions, closes tracks on detection/close/unmount,
and stops streams whose permission request resolves after closure. Session expiry
closes the native dialog and stops the camera. Barcode values remain strings; the
form trims surrounding space, preserves leading zeroes, and writes null when empty.

The dashboard requests only `clogSummary`; its counts never depend on a loaded
connection page. Returning to the route reloads those totals after writes.
