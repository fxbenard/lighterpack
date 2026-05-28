import { test, expect } from '@playwright/test';

import { testRoot } from './utils';

const isSuccessfulExternalId = response => response.url().includes('/externalId') && response.ok();
const isSuccessfulSave = response => response.url().includes('/saveLibrary') && response.ok();

test.describe('LighterPack+ public sharing', () => {
  test('publishes an indexable list through the improved public route', async ({ page }) => {
    test.setTimeout(60000);

    const now = Date.now();
    const username = `plus${now}`;
    const email = `plus+${now}@lighterpack.com`;
    const password = 'testtest';

    const registerResponse = await page.request.post(`${testRoot}register`, {
      data: { username, email, password },
    });
    expect(registerResponse.ok()).toBeTruthy();

    await page.goto(testRoot);
    await expect(page.getByText(`Signed in as ${username}`)).toBeVisible({ timeout: 35000 });
    await expect(page.getByPlaceholder('List Name')).toBeVisible({ timeout: 35000 });

    const externalIdResponse = page.waitForResponse(isSuccessfulExternalId, { timeout: 35000 });
    const shareTrigger = page.locator('#share');
    await expect(shareTrigger).toBeVisible();
    await shareTrigger.hover();
    await externalIdResponse;

    const shareUrlLocator = page.getByLabel('Share your list');
    await expect(shareUrlLocator).toHaveValue(/\S/, { timeout: 35000 });

    const visibilitySave = page.waitForResponse(isSuccessfulSave, { timeout: 35000 });
    await page.getByLabel('Visibility').selectOption('indexable');
    await visibilitySave;

    const indexingSave = page.waitForResponse(isSuccessfulSave, { timeout: 35000 });
    await page.getByLabel('Allow search engines to index this list').check();
    await indexingSave;

    const shareUrl = await shareUrlLocator.inputValue();
    expect(shareUrl).toContain('/p/');

    await page.goto(shareUrl);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });
});
