import { test, expect } from "@playwright/test";
import path from "path";
import { registerUser } from "./auth-utils";

const isSuccessfulSave = (response: any) =>
  response.url().includes("/saveLibrary") && response.ok();

test.describe("Smart Gear Library", () => {
  test("CSV import with brand column deduplicates matching items", async ({
    page,
  }) => {
    const now = Date.now();
    await registerUser(
      page,
      `dedup${now}`,
      "testtest",
      `dedup+${now}@lighterpack.com`,
    );

    const csvPath = path.join(
      process.cwd(),
      "test/fixtures/csv/brand-dedup.csv",
    );

    // First import to populate library
    await page.setInputFiles("#csv", csvPath);
    await expect(page.locator("#importValidate")).toBeVisible();
    const firstSave = page.waitForResponse(isSuccessfulSave, {
      timeout: 35000,
    });
    await page.locator("#importConfirm").click();
    await firstSave;

    // Second import of same file — should detect duplicates
    await page.setInputFiles("#csv", csvPath);
    await expect(page.locator("#importValidate")).toBeVisible();
    await expect(page.locator("#importValidate")).toContainText(
      "will merge with existing gear",
    );
  });

  test("library sidebar has category filter select", async ({ page }) => {
    const now = Date.now();
    await registerUser(
      page,
      `filter${now}`,
      "testtest",
      `filter+${now}@lighterpack.com`,
    );

    // Category filter select should be visible in sidebar
    await expect(page.locator(".lpLibraryFilterSelect")).toBeVisible();
  });

  test("library sidebar category filter select can be changed", async ({
    page,
  }) => {
    const now = Date.now();
    await registerUser(
      page,
      `catfil${now}`,
      "testtest",
      `catfil+${now}@lighterpack.com`,
    );

    const csvPath = path.join(
      process.cwd(),
      "test/fixtures/csv/brand-dedup.csv",
    );
    await page.setInputFiles("#csv", csvPath);
    await expect(page.locator("#importValidate")).toBeVisible();
    const importSave = page.waitForResponse(isSuccessfulSave, {
      timeout: 35000,
    });
    await page.locator("#importConfirm").click();
    await importSave;

    await expect(page.locator(".lpLibraryFilterSelect")).toBeVisible();
    await page.locator(".lpLibraryFilterSelect").selectOption("Sleep");
    await expect(page.locator(".lpLibraryFilterSelect")).toHaveValue("Sleep");
    await expect(page.locator("#library .lpLibraryItem")).toHaveCount(1);
    await expect(page.locator("#library .lpLibraryItem .lpName")).toContainText([
      "Sleeping Bag",
    ]);
  });
});
