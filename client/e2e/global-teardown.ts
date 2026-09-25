import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const TEST_PREFIX = 'Clog E2E ';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const GRAPHQL_URL = process.env.VITE_GRAPHQL_URL || 'http://localhost:8080/graphql';

async function graphql(query: string, variables: Record<string, unknown>, token: string) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (!res.ok || body.errors?.length) {
    throw new Error(JSON.stringify(body.errors ?? { status: res.status }));
  }
  return body;
}

async function authenticate(): Promise<string> {
  const username = process.env.WP_ADMIN_USER;
  const password = process.env.WP_ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error('WP_ADMIN_USER and WP_ADMIN_PASSWORD must be set in .env');
  }

  const body = await graphql(
    `mutation Login($username: String!, $password: String!) {
      login(input: { username: $username, password: $password }) {
        authToken
      }
    }`,
    { username, password },
    '',
  );

  const token = body.data?.login?.authToken;
  if (!token) {
    throw new Error(`Login failed: ${JSON.stringify(body.errors ?? body)}`);
  }
  return token;
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

async function globalTeardown() {
  let token: string;
  try {
    token = await authenticate();
  } catch (e) {
    console.log(`[teardown] Skipping cleanup: ${(e as Error).message}`);
    return;
  }

  // Fetch all data
  const [itemsRes, locationsRes, inventoryRes] = await Promise.all([
    graphql(`query { clogItems(first: 100) { nodes { id name } } }`, {}, token),
    graphql(`query { clogLocations(first: 100) { nodes { id name } } }`, {}, token),
    graphql(
      `query { clogInventoryEntries(first: 100) { nodes { id item { name } location { name } } } }`,
      {},
      token,
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
        token,
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
        token,
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
        token,
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

export default globalTeardown;
