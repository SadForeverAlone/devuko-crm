import { expect, test } from "@playwright/test";

test.describe("CRM smoke", () => {
  test("login screen renders on /crm", async ({ page }) => {
    await page.goto("/crm");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /продолжить|continue/i })).toBeVisible();
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("sites alias redirects to projects while showing login", async ({ page }) => {
    await page.goto("/crm/sites");
    await expect(page).toHaveURL(/\/crm\/projects$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("security alias redirects to monitoring while showing login", async ({ page }) => {
    await page.goto("/crm/security");
    await expect(page).toHaveURL(/\/crm\/monitoring$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("unknown crm path still shows login shell", async ({ page }) => {
    await page.goto("/crm/does-not-exist");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("API health endpoint is reachable", async ({ request }) => {
    test.skip(!process.env.PLAYWRIGHT_API_URL, "Set PLAYWRIGHT_API_URL to exercise API health");
    const apiBase = process.env.PLAYWRIGHT_API_URL!;
    const response = await request.get(`${apiBase}/health`);
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as { ok?: boolean; db?: string };
    expect(body.ok).toBe(true);
    expect(body.db).toBe("up");
  });
});
