import { test, expect } from '@playwright/test';

import { registerUser } from './auth-utils';

test.describe('Save and reload tests', () => {
  test('should preserve list edits after reload', async ({ page }) => {
    const now = Date.now();
    const username = `save${now}`;
    const email = `save+${now}@lighterpack.com`;
    const password = 'testtest';
    const listName = `Saved List ${now}`;
    const itemName = 'Saved Backpack';
    const itemDescription = 'Still here after reload';

    await registerUser(page, username, password, email);

    await page.getByPlaceholder('List Name').fill(listName);
    await page.locator('.lpItem .lpName').first().fill(itemName);
    await page.locator('.lpItem .lpDescription').first().fill(itemDescription);
    await page.locator('.lpItem .lpWeight').first().fill('880');
    await page.locator('.lpItem .lpQty').first().fill('2');

    await expect(async () => {
      await page.reload();
      await expect(page.getByPlaceholder('List Name')).toHaveValue(listName);
      await expect(page.locator('.lpItem .lpName').first()).toHaveValue(itemName);
      await expect(page.locator('.lpItem .lpDescription').first()).toHaveValue(itemDescription);
      await expect(page.locator('.lpItem .lpQty').first()).toHaveValue('2');
    }).toPass({ timeout: 35000 });
  });
});
