import { test, expect } from "./fixtures";

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
