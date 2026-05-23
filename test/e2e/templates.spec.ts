import { test, expect } from "@playwright/test";
import { testRoot } from "./utils";
import { registerUser, registerUserWithTemplate } from "./auth-utils";

test.describe("Template picker", () => {
  test("picker appears after register form submit", async ({ page }) => {
    await page.goto(testRoot);

    const now = Date.now();
    await page.fill('.lpRegister input[name="username"]', `tpl${now}`);
    await page.fill(
      '.lpRegister input[name="email"]',
      `tpl+${now}@lighterpack.com`,
    );
    await page.fill('.lpRegister input[name="password"]', "testtest");
    await page.fill('.lpRegister input[name="passwordConfirm"]', "testtest");
    await page.getByRole("button").filter({ hasText: "Register" }).click();

    await expect(page.getByText("Start with a template")).toBeVisible();
    await expect(page.getByText("3-Day Backpacking")).toBeVisible();
    await expect(page.getByText("Weekend Ultralight")).toBeVisible();
    await expect(page.getByText("Winter Car Camping")).toBeVisible();
    await expect(page.getByText("Start blank")).toBeVisible();
  });

  test("register with template populates list categories", async ({ page }) => {
    const now = Date.now();
    const username = `tpl${now}`;

    let libraryPayload: string | null = null;
    await page.route("**/register", async (route) => {
      const body = route.request().postDataJSON();
      libraryPayload = body?.library ?? null;
      await route.continue();
    });

    await registerUserWithTemplate(
      page,
      username,
      "testtest",
      `tpl+${now}@lighterpack.com`,
      "3-Day Backpacking",
    );

    await expect(page.getByText(`Signed in as ${username}`)).toBeVisible();
    expect(libraryPayload).not.toBeNull();

    const library = JSON.parse(libraryPayload!);
    expect(library.items.length).toBeGreaterThan(0);
    expect(library.lists[0].name).toBe("3-Day Backpacking");

    await expect(page.getByText("Shelter")).toBeVisible();
  });

  test("dismiss picker starts blank — POST fires with empty library", async ({
    page,
  }) => {
    const now = Date.now();
    const username = `tpl${now}`;

    let libraryPayload: string | null | undefined = undefined;
    await page.route("**/register", async (route) => {
      const body = route.request().postDataJSON();
      libraryPayload = body?.library ?? null;
      await route.continue();
    });

    await registerUser(
      page,
      username,
      "testtest",
      `tpl+${now}@lighterpack.com`,
    );

    await expect(page.getByText(`Signed in as ${username}`)).toBeVisible();
    expect(libraryPayload).toBeNull();
  });

  test("skip registration with template populates local library", async ({
    page,
  }) => {
    await page.goto(testRoot);

    await page.getByText("Skip registration").click();
    await expect(page.getByText("Start with a template")).toBeVisible();

    await page
      .getByText("Weekend Ultralight")
      .locator("..")
      .locator("..")
      .getByRole("button", { name: "Select" })
      .click();

    await expect(page.getByText("Shelter")).toBeVisible();
  });
});
