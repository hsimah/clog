import { test, expect } from "./fixtures";

test("Overview consumes server data without a GraphQL request", async ({ page, authenticate }) => {
  test.skip(process.env.CLOG_TEST_SSR !== "1", "Enable with CLOG_SSR=1.");
  await authenticate();
  const operations: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/graphql"))
      operations.push(request.postDataJSON()?.operationName);
  });
  const response = await page.goto("/");
  expect(response?.headers()["cache-control"]).toContain("no-store");
  const data = JSON.parse(await page.locator("#tsquid-data").textContent() ?? "null");
  expect(data.responses[0].operation).toBe("HomePageQuery");
  await expect(page.getByRole("heading", { name: "Overview", exact: true })).toBeVisible();
  expect(operations).not.toContain("HomePageQuery");
  await page.getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Items", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Items", exact: true })).toBeVisible();
  expect(operations).toContain("ItemPageQuery");
});

for (const { url, operation, variables, heading } of [
  { url: "/items", operation: "ItemPageQuery", variables: { term: "" }, heading: "Items" },
  { url: "/items?term=Heinz", operation: "ItemPageQuery", variables: { term: "Heinz" }, heading: "Items" },
  { url: "/locations?term=Garage", operation: "LocationPageQuery", variables: { term: "Garage" }, heading: "Locations" },
  { url: "/inventory?term=Heinz&location=1", operation: "InventoryPageQuery", variables: { term: "Heinz", location: "1" }, heading: "Inventory" },
  { url: "/users", operation: "UserPageQuery", variables: {}, heading: "Users" },
  { url: "/items/1?term=Heinz", operation: "ItemPageQuery", variables: { term: "Heinz" }, heading: "Heinz Ketchup" },
]) {
  test(`generated SSR data satisfies ${url}`, async ({ page, authenticate }) => {
    test.skip(process.env.CLOG_TEST_SSR !== "1", "Enable with CLOG_SSR=1.");
    await authenticate("admin");
    const operations: string[] = [];
    page.on("request", (request) => {
      if (request.url().endsWith("/graphql"))
        operations.push(request.postDataJSON()?.operationName);
    });
    await page.goto(url);
    const data = JSON.parse(await page.locator("#tsquid-data").textContent() ?? "null");
    expect(data.responses[0].operation).toBe(operation);
    expect(data.responses[0].variables).toEqual(variables);
    expect(data.responses[0].response.errors).toBeUndefined();
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    expect(operations).not.toContain(operation);
    if (url.startsWith("/items/1")) expect(operations).toContain("ItemRecordQuery");
  });
}

test("invalid SSR URL has no payload and remains recoverable", async ({ page, authenticate }) => {
  test.skip(process.env.CLOG_TEST_SSR !== "1", "Enable with CLOG_SSR=1.");
  await authenticate();
  await page.goto("/items?term=a&term=b");
  await expect(page.locator("#tsquid-data")).toHaveCount(0);
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("navigation").getByRole("link", { name: "Items", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Items", exact: true })).toBeVisible();
});

test("anonymous HTML contains no initial route data", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  expect(await response.text()).not.toContain('id="tsquid-data"');
});

test("SSR executes account queries with the requesting viewer's permissions", async ({ page, authenticate }) => {
  test.skip(process.env.CLOG_TEST_SSR !== "1", "Enable with CLOG_SSR=1.");
  await authenticate("reader");
  await page.goto("/users");
  const data = JSON.parse(await page.locator("#tsquid-data").textContent() ?? "null");
  expect(data.responses[0].operation).toBe("UserPageQuery");
  expect(data.responses[0].response.data.clogUsers).toBeNull();
});

test("hover and focus preload route queries before navigation", async ({
  page,
  authenticate,
}) => {
  await authenticate();
  const operations: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/graphql"))
      operations.push(request.postDataJSON()?.operationName);
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await nav.getByRole("link", { name: "Items", exact: true }).hover();
  await expect.poll(() => operations.includes("ItemPageQuery")).toBe(true);
  await expect(page).toHaveURL(/\/$/);
  await nav.getByRole("link", { name: "Locations", exact: true }).focus();
  await expect.poll(() => operations.includes("LocationPageQuery")).toBe(true);
  await expect(page).toHaveURL(/\/$/);
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Locations", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
});

for (const section of ["items", "locations"]) {
  test(`${section} search survives detail, edit, close, reload and back`, async ({
    page,
    authenticate,
  }) => {
    await authenticate();
    const term = section === "items" ? "Heinz" : "Garage";
    const name = section === "items" ? "Heinz Ketchup" : "Garage Shelves";
    await page.goto(`/${section}?term=${term}`);
    await expect(
      page.getByLabel(`Search ${section}`, { exact: true }),
    ).toHaveValue(term);
    await page.getByRole("link", { name, exact: true }).click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    expect(new URL(page.url()).searchParams.get("term")).toBe(term);
    await page.getByRole("link", { name: "Edit", exact: true }).click();
    await expect(page.getByRole("textbox", { name: /^Name/ })).toHaveValue(
      name,
    );
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${section}\\?term=${term}$`));
    await page.reload();
    await expect(
      page.getByLabel(`Search ${section}`, { exact: true }),
    ).toHaveValue(term);
    await page.goBack();
    await expect(page.getByRole("textbox", { name: /^Name/ })).toHaveValue(
      name,
    );
  });
}

test("typing a URL-backed search retains focus across entrypoint loads", async ({
  page,
  authenticate,
}) => {
  await authenticate();
  await page.goto("/items");
  const input = page.getByLabel("Search items", { exact: true });
  await input.pressSequentially("Heinz", { delay: 150 });
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("Heinz");
  await expect(page.getByRole("link", { name: "Heinz Ketchup" })).toBeVisible();
  expect(new URL(page.url()).searchParams.get("term")).toBe("Heinz");
});

test("invalid typed URL shows a recoverable error", async ({
  page,
  authenticate,
}) => {
  await authenticate();
  await page.goto("/items?term=a&term=b");
  await expect(page.getByRole("alert")).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Items", exact: true })
    .click();
  await expect(page.getByRole("link", { name: "Heinz Ketchup" })).toBeVisible();
});
