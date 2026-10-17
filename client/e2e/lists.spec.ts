import { test, expect } from './fixtures';

for (const { section, heading, empty, term, matches, excluded } of [
  { section: 'items', heading: 'Items', empty: 'No items found', term: 'ketchup', matches: ['Heinz Ketchup'], excluded: ['Purina Dry Dog Food', 'Pedigree Wet Dog Food'] },
  { section: 'locations', heading: 'Locations', empty: 'No locations found', term: 'garage', matches: ['Garage Shelves', 'Garage Freezer'], excluded: ['Kitchen Cabinet', 'Kitchen Freezer'] },
  { section: 'inventory', heading: 'Inventory', empty: 'No inventory found', term: 'ketchup', matches: ['Heinz Ketchup'], excluded: ['Purina Dry Dog Food', 'Pedigree Wet Dog Food'] },
]) {
  test(`${section} lists seed records, filters by search and reports no results`, async ({ page, authenticate }) => {
    await authenticate();
    await page.goto(`/${section}`);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    for (const name of [...matches, ...excluded]) await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
    await page.getByPlaceholder(`Search ${section}...`).fill(term);
    for (const name of matches) await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
    for (const name of excluded) await expect(page.getByRole('link', { name, exact: true })).not.toBeVisible();
    await page.getByPlaceholder(`Search ${section}...`).fill('nonexistent xyz');
    await expect(page.getByText(empty)).toBeVisible();
  });
}
