import assert from "node:assert/strict";
import { test, after } from "node:test";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import ts from "typescript";

// Run the committed catalogue through the same TS syntax transform as the app.
const directory = mkdtempSync(
  new URL("../node_modules/.clog-routes-", import.meta.url),
);
after(() => rmSync(directory, { recursive: true, force: true }));
const compiled = ts.transpileModule(
  readFileSync(
    new URL("../src/routes/__generated__/routes.ts", import.meta.url),
    "utf8",
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
writeFileSync(`${directory}/routes.mjs`, compiled);
const routes = await import(pathToFileURL(`${directory}/routes.mjs`).href);

test("every application route round-trips escaped path and query values", () => {
  const config = JSON.parse(
    readFileSync(new URL("../routes.json", import.meta.url), "utf8"),
  );
  for (const route of config.routes) {
    const input = Object.fromEntries(
      Object.keys(route.fields).map((key) => [key, "id/with + & unicode λ"]),
    );
    assert.deepEqual(
      routes[`${route.name}URI`].parseURI(
        routes[`${route.name}URI`].getURI(input),
      ),
      input,
      route.name,
    );
  }
});

test("detail and edit URIs retain filters and scanner input is shareable", () => {
  const filters = { term: "tinned beans", location: "ClogLocation:9" };
  const detail = routes.InventoryItemDetailURI.getURI({
    ...filters,
    id: "ClogItem:3",
  });
  assert.deepEqual(routes.InventoryItemDetailURI.parseURI(detail), {
    ...filters,
    id: "ClogItem:3",
  });
  assert.deepEqual(
    routes.ItemNewURI.parseURI(
      routes.ItemNewURI.getURI({ barcode: "0012345", term: "beans" }),
    ),
    { barcode: "0012345", term: "beans" },
  );
});

test("malformed path encoding and duplicate filters fail instead of silently coercing", () => {
  assert.throws(() => routes.ItemDetailURI.parseURI("/items/%ZZ"));
  assert.throws(() =>
    routes.InventoryIndexURI.parseURI("/inventory?location=1&location=2"),
  );
  assert.throws(() => routes.ItemIndexURI.parseURI("/items?term=a&term=b"));
});
