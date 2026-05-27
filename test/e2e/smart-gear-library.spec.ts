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
<<<<<<< HEAD

  test("typing a new item name and tabbing creates the item then focuses description", async ({
    page,
  }) => {
    const now = Date.now();
    await registerUser(
      page,
      `inline${now}`,
      "testtest",
      `inline+${now}@lighterpack.com`,
    );

    await page.getByText("Add new item").click();
    const newItemInput = page.locator(".lpAddItemInput");
    await newItemInput.fill("Trail spoon");
    await newItemInput.press("Tab");

    const createdItem = page.locator(".lpItem[data-item-id] .lpName").last();
    await expect(createdItem).toHaveValue("Trail spoon");

    await expect
      .poll(async () =>
        page.evaluate(() =>
          document.activeElement?.classList.contains("lpDescription"),
        ),
      )
      .toBe(true);
  });

  test("gear room can create a new library item from search text", async ({
    page,
  }) => {
    const now = Date.now();
    await registerUser(
      page,
      `gearroom${now}`,
      "testtest",
      `gearroom+${now}@lighterpack.com`,
    );

    await page.getByRole("button", { name: /gear room/i }).click();
    await expect(page.locator(".lpGearRoomModal")).toBeVisible();

    await page.locator(".lpGearRoomModal .librarySearch").fill("Trail mug");
    await page.getByRole("button", { name: /new gear item/i }).click();

    await expect(page.locator("#itemDetailDialog")).toBeVisible();
    await expect(page.locator("#itemDetailDialog")).toContainText("Trail mug");
  });

  test("gear search has a clear button that resets the input and keeps focus", async ({
    page,
  }) => {
    const now = Date.now();
    await registerUser(
      page,
      `clear${now}`,
      "testtest",
      `clear+${now}@lighterpack.com`,
    );

    const search = page.locator(".librarySearch").first();
    await search.fill("ser");
    await page.getByRole("button", { name: /clear gear search/i }).click();

    await expect(search).toHaveValue("");
    await expect
      .poll(async () =>
        page.evaluate(() =>
          document.activeElement?.classList.contains("librarySearch"),
        ),
      )
      .toBe(true);
  });

  test("item detail can add gear to a brand new category in the current list", async ({
    page,
  }) => {
    const now = Date.now();
    await registerUser(
      page,
      `newcat${now}`,
      "testtest",
      `newcat+${now}@lighterpack.com`,
    );

    await page.getByRole("button", { name: /gear room/i }).click();
    await page.locator(".lpGearRoomModal .librarySearch").fill("Camp cup");
    await page.getByRole("button", { name: /new gear item/i }).click();

    await expect(page.locator("#itemDetailDialog")).toBeVisible();
    await page.getByRole("button", { name: /\+ add to list/i }).click();
    await page.getByPlaceholder("New category").fill("Kitchen");
    await page.getByRole("button", { name: /^create$/i }).click();

    await expect(page.locator("#itemDetailDialog")).toBeHidden();
    await expect(page.locator(".lpCategoryName").last()).toHaveValue("Kitchen");
    await expect(page.locator(".lpItem .lpName").last()).toHaveValue("Camp cup");
  });
=======
>>>>>>> origin/main
});
