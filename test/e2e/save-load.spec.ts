import { test, expect } from '@playwright/test';

import { registerUser } from './auth-utils';

test.describe('Save and reload tests', () => {
  test('should persist list edits to the share page', async ({ page, browser }) => {
    test.setTimeout(60000);
    const now = Date.now();
    const username = `save${now}`;
    const email = `save+${now}@lighterpack.com`;
    const password = 'testtest';
    const listName = `Saved List ${now}`;
    const itemName = 'Saved Backpack';
    const itemDescription = 'Still here after reload';
    const isSuccessfulSave = (response) => response.url().includes('/saveLibrary') && response.ok();

    await registerUser(page, username, password, email);

    await page.getByPlaceholder('List Name').fill(listName);
    await page.locator('.lpItem .lpName').first().fill(itemName);
    await page.locator('.lpItem .lpDescription').first().fill(itemDescription);
    await page.locator('.lpItem .lpWeight').first().fill('880');

    const editedFieldsSave = page.waitForResponse(isSuccessfulSave, { timeout: 35000 });
    await page.locator('.lpItem .lpQty').first().fill('2');
    await editedFieldsSave;

    const externalIdSave = page.waitForResponse(isSuccessfulSave, { timeout: 35000 });
    await page.getByText('Share', { exact: true }).hover();

    const shareUrlLocator = page.getByLabel('Share your list');
    await expect(shareUrlLocator).toHaveValue(/\S/);
    const shareUrl = await shareUrlLocator.inputValue();
    await externalIdSave;

    const shareContext = await browser.newContext();
    const sharePage = await shareContext.newPage();

    try {
      await sharePage.goto(shareUrl);

      const firstSharedItem = sharePage.locator('.lpItem').first();
      await expect(sharePage.locator('h1.lpListName')).toHaveText(listName);
      await expect(firstSharedItem.locator('.lpName')).toContainText(itemName);
      await expect(firstSharedItem.locator('.lpDescription')).toContainText(itemDescription);
      await expect(firstSharedItem.locator('.lpWeight')).toContainText('880');
      await expect(firstSharedItem.locator('.lpQtyCell')).toContainText('2');
    } finally {
      await shareContext.close();
    }
  });
});
