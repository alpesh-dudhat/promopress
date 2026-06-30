import { test, expect } from "@playwright/test";
import path from "path";

const ADMIN_EMAIL = "admin@promopress.local";
const ADMIN_PASSWORD = "ChangeMe123!";
const PRODUCT_IMAGE = path.join(__dirname, "fixtures", "red.png");

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button:has-text("Log in")');
  await expect(page).toHaveURL(/\/mockups$/);
}

test.describe("admin product catalog", () => {
  test("create a product, color, view, and print zone", async ({ page }) => {
    const productName = `E2E Polo ${Date.now()}`;

    await loginAsAdmin(page);
    await page.goto("/admin/products");
    await page.fill('input[name="name"]', productName);
    await page.fill('input[name="category"]', "Polo Shirts");
    await page.click('button:has-text("Create product")');
    await expect(page).toHaveURL(/\/admin\/products\/[^/]+$/);

    await page.fill('input[name="name"]', "Navy");
    await page.locator('input[type="color"]').fill("#1f2937");
    await page.click('button:has-text("Add color")');
    await expect(page.locator("main")).toContainText("Navy");

    await page.selectOption('select[name="name"]', "front");
    await page.setInputFiles('input[name="image"]', PRODUCT_IMAGE);
    await page.click('button:has-text("Add view")');
    await expect(page.locator("main")).toContainText("front");

    await page.locator("a", { hasText: "front" }).click();
    await expect(page).toHaveURL(/\/views\//);

    const img = page.locator('img[alt="Product view"]');
    const box = await img.boundingBox();
    if (!box) throw new Error("Product view image did not render");
    await page.mouse.move(box.x + 10, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + 60, box.y + 60, { steps: 5 });
    await page.mouse.up();

    await page.fill('input[name="label"]', "Left Chest");
    await page.check('input[name="decorationTypes"][value="PRINT"]');
    await page.fill('input[name="maxWidthCm"]', "10");
    await page.fill('input[name="maxHeightCm"]', "8");
    await page.click('button:has-text("Save zone")');

    const zoneRow = page.locator("text=Left Chest");
    await expect(zoneRow).toBeVisible();
    await expect(page.locator("main")).toContainText("PRINT");
    await expect(page.locator("main")).toContainText("max 10x8cm");
  });

  test("customer cannot reach the product catalog route", async ({ page }) => {
    // Page-level enforcement (middleware). Server-action-level enforcement
    // (requireAdmin() inside createProduct etc.) is exercised indirectly:
    // there's no UI path to call those actions without first reaching this
    // page, and unit/integration coverage of requireAdmin() itself would
    // require mocking the session, which isn't worth it for this check.
    const email = `noadmin-${Date.now()}@test.com`;
    await page.goto("/register");
    await page.fill('input[name="name"]', "No Admin");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "password1234");
    await page.click('button:has-text("Create account")');
    await expect(page).toHaveURL(/\/mockups$/);

    const res = await page.goto("/admin/products");
    expect(res?.url()).toMatch(/\/login\?callbackUrl=/);
  });
});
