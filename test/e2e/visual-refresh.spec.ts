import { test, expect } from '@playwright/test';
import path from 'path';

import { registerUser } from './auth-utils';

const isSuccessfulExternalId = response => response.url().includes('/externalId') && response.ok();
const isSuccessfulSave = response => response.url().includes('/saveLibrary') && response.ok();

test.describe('Visual refresh', () => {
  test('should de-emphasize zero-quantity rows in edit and share views', async ({ page, browser }) => {
    const now = Date.now();
    const username = `visual${now}`;
    const email = `visual+${now}@lighterpack.com`;
    const password = 'testtest';
    const csvPath = path.join(process.cwd(), 'test/fixtures/csv/roundtrip-rich.csv');

    await registerUser(page, username, password, email);

    await page.setInputFiles('#csv', csvPath);
    const importSave = page.waitForResponse(isSuccessfulSave, { timeout: 35000 });
    await page.locator('#importConfirm').click();
    await importSave;

    await expect(page.locator('.lpItem .lpName').nth(2)).toHaveValue('Rain jacket');
    const zeroQtyRow = page.locator('.lpItem').nth(2);
    await expect(zeroQtyRow).toHaveClass(/lpQtyZero/);

    const externalIdSave = page.waitForResponse(isSuccessfulSave, { timeout: 35000 });
    const externalIdResponse = page.waitForResponse(isSuccessfulExternalId, { timeout: 35000 });
    await page.getByText('Share', { exact: true }).hover();
    await externalIdResponse;

    const shareUrlLocator = page.getByLabel('Share your list');
    await expect(shareUrlLocator).toHaveValue(/\S/, { timeout: 35000 });
    const shareUrl = await shareUrlLocator.inputValue();
    await externalIdSave;

    const shareContext = await browser.newContext();
    const sharePage = await shareContext.newPage();

    try {
      await sharePage.goto(shareUrl);
      const sharedZeroQtyRow = sharePage.locator('.lpItem').filter({ hasText: 'Rain jacket' });
      await expect(sharedZeroQtyRow).toHaveClass(/lpQtyZero/);
    } finally {
      await shareContext.close();
    }
  });
});
