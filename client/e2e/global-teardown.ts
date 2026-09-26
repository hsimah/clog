import { request, type APIRequestContext } from '@playwright/test';
import { login } from './session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const TEST_PREFIX = 'Clog E2E ';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const BASE = new URL(process.env.WP_PROXY_TARGET || process.env.VITE_GRAPHQL_URL || 'http://localhost:8080').origin;
let api: APIRequestContext;

async function graphql(query: string, variables: Record<string, unknown>) {
  const session = await (await api.get(`${BASE}/wp-admin/admin-ajax.php?action=clog_graphql_session`)).json();
  const response = await api.post(`${BASE}/graphql`, {
    headers: { 'X-WP-Nonce': session.nonce },
    data: { query, variables },
  });
  const body = await response.json();
  if (!response.ok() || body.errors?.length) throw new Error(JSON.stringify(body.errors ?? { status: response.status() }));
  return body;
}

interface ClogNode {
  id: string;
  name: string;
}

interface InventoryNode {
  id: string;
  item: { name: string } | null;
  location: { name: string } | null;
}

async function cleanup() {
  api = await request.newContext();
  try {
    await login(api, BASE);
  } catch (e) {
    console.log(`[teardown] Skipping cleanup: ${(e as Error).message}`);
    return;
  }

  // Fetch all data
  const [itemsRes, locationsRes, inventoryRes] = await Promise.all([
    graphql(`query { clogItems(first: 100) { nodes { id name } } }`, {}),
    graphql(`query { clogLocations(first: 100) { nodes { id name } } }`, {}),
    graphql(
      `query { clogInventoryEntries(first: 100) { nodes { id item { name } location { name } } } }`,
      {},
    ),
  ]);

  const allItems: ClogNode[] = itemsRes.data?.clogItems?.nodes ?? [];
  const allLocations: ClogNode[] = locationsRes.data?.clogLocations?.nodes ?? [];
  const allInventory: InventoryNode[] = inventoryRes.data?.clogInventoryEntries?.nodes ?? [];

  const testItems = allItems.filter((i) => i.name.startsWith(TEST_PREFIX));
  const testLocations = allLocations.filter((l) => l.name.startsWith(TEST_PREFIX));

  // Only entries owned by this test suite; never remove unrelated inventory
  const testInventory = allInventory.filter(
    (inv) =>
      (inv.item && inv.item.name.startsWith(TEST_PREFIX)) ||
      (inv.location && inv.location.name.startsWith(TEST_PREFIX)),
  );

  if (testInventory.length === 0 && testItems.length === 0 && testLocations.length === 0) {
    console.log('[teardown] No test data to clean up');
    return;
  }

  // Delete in order: inventory -> items -> locations
  for (const inv of testInventory) {
    try {
      await graphql(
        `mutation DeleteInventory($input: DeleteClogInventoryInput!) {
          deleteClogInventory(input: $input) { deletedId }
        }`,
        { input: { id: String(inv.id) } },
      );
      console.log(`[teardown] Deleted inventory entry ${inv.id}`);
    } catch (e) {
      console.log(`[teardown] Failed to delete inventory ${inv.id}: ${(e as Error).message}`);
    }
  }

  for (const item of testItems) {
    try {
      await graphql(
        `mutation DeleteItem($input: DeleteClogItemInput!) {
          deleteClogItem(input: $input) { deletedId }
        }`,
        { input: { id: String(item.id) } },
      );
      console.log(`[teardown] Deleted item "${item.name}"`);
    } catch (e) {
      console.log(`[teardown] Failed to delete item "${item.name}": ${(e as Error).message}`);
    }
  }

  for (const loc of testLocations) {
    try {
      await graphql(
        `mutation DeleteLocation($input: DeleteClogLocationInput!) {
          deleteClogLocation(input: $input) { deletedId }
        }`,
        { input: { id: String(loc.id) } },
      );
      console.log(`[teardown] Deleted location "${loc.name}"`);
    } catch (e) {
      console.log(`[teardown] Failed to delete location "${loc.name}": ${(e as Error).message}`);
    }
  }

  console.log(
    `[teardown] Cleanup complete: ${testInventory.length} inventory, ${testItems.length} items, ${testLocations.length} locations deleted`,
  );
}

export default async function globalTeardown() {
  try { await cleanup(); } finally { await api?.dispose(); }
}
