import { test, expect } from "@playwright/test";

test.describe("Smoke test", () => {
  test("homepage loads and displays heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/barbershop/i);
  });
});
