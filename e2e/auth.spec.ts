import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@promopress.local";
const ADMIN_PASSWORD = "ChangeMe123!"; // matches prisma/seed.ts defaults

test.describe("authentication and access control", () => {
  test("registering always assigns CUSTOMER and blocks admin routes", async ({ page }) => {
    const email = `customer-${Date.now()}@test.com`;

    await page.goto("/register");
    await page.fill('input[name="name"]', "E2E Customer");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "password1234");
    await page.click('button:has-text("Create account")');

    await expect(page).toHaveURL(/\/mockups$/);
    await expect(page.locator("nav")).toContainText("CUSTOMER");
    await expect(page.locator("nav")).not.toContainText("Products");

    // A customer has no UI path to admin routes, and direct navigation
    // must be blocked server-side (middleware), not just hidden in the UI.
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  });

  test("seeded admin can log in and reach admin routes", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Log in")');

    await expect(page).toHaveURL(/\/mockups$/);
    await expect(page.locator("nav")).toContainText("ADMIN");

    await page.goto("/admin/users");
    await expect(page.locator("main")).toContainText(ADMIN_EMAIL);
  });

  test("admin can promote another user's role", async ({ page }) => {
    const email = `promote-${Date.now()}@test.com`;

    // Register the target user first (in a fresh, unauthenticated context).
    await page.goto("/register");
    await page.fill('input[name="name"]', "Promote Me");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "password1234");
    await page.click('button:has-text("Create account")');
    await expect(page).toHaveURL(/\/mockups$/);
    await page.locator('form button:has-text("Log out")').click();
    await expect(page).toHaveURL("/");

    // Log in as admin and promote them.
    await page.goto("/login");
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Log in")');
    await expect(page).toHaveURL(/\/mockups$/);

    await page.goto("/admin/users");
    const row = page.locator("li", { hasText: email });
    await row.locator('button:has-text("Make SALES")').click();
    await expect(row).toContainText("SALES");
  });
});
