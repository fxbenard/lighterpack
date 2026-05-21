import { test, expect } from '@playwright/test';

import { testRoot } from './utils';

import { registerUser } from './auth-utils';

const isSuccessfulExternalId = response => response.url().includes('/externalId') && response.ok();
const isSuccessfulSave = response => response.url().includes('/saveLibrary') && response.ok();

test.describe('List tests', () => {
  test('should successfully get an external ID', async ({ page }) => {
    const now = Date.now();
    const username = `id${now}`;
    const email = `id+${now}@lighterpack.com`;
    const password = 'testtest';

    await registerUser(page, username, password, email);

    const externalIdResponse = page.waitForResponse(isSuccessfulExternalId, { timeout: 35000 });
    await page.getByText('Share', { exact: true }).hover();
    await externalIdResponse;

    const shareUrlLocator = page.getByLabel('Share your list');
    await expect(shareUrlLocator).toHaveValue(/\S/, { timeout: 35000 });
    const shareUrl = await shareUrlLocator.inputValue();

    await expect(async () => {
        const response = await page.request.get(shareUrl);
        expect(response.status()).toBe(200);
    }).toPass();
    await page.goto(shareUrl);
  });

  test('should save list name', async ({ page }) => {
    const now = Date.now();
    const username = `name${now}`;
    const email = `name+${now}@lighterpack.com`;
    const password = 'testtest';
    const listName = 'Test List Name';

    await registerUser(page, username, password, email);

    const externalIdResponse = page.waitForResponse(isSuccessfulExternalId, { timeout: 35000 });
    await page.getByText('Share', { exact: true }).hover();
    await externalIdResponse;
    
    const shareUrlLocator = page.getByLabel('Share your list');
    await expect(shareUrlLocator).toHaveValue(/\S/, { timeout: 35000 });
    const shareUrl = await shareUrlLocator.inputValue();

    const saveResponse = page.waitForResponse(isSuccessfulSave, { timeout: 35000 });
    await page.getByPlaceholder('List Name').fill(listName);
    await saveResponse;

    await expect(async () => {
        const response = await page.request.get(shareUrl);
        expect(response.status()).toBe(200);
    }).toPass();

    await page.goto(shareUrl);
    await expect(page.getByRole('heading').filter({hasText: listName})).toBeVisible();
  });
});
