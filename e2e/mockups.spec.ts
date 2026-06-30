import { test, expect, Page } from "@playwright/test";
import path from "path";

const ADMIN_EMAIL = "admin@promopress.local";
const ADMIN_PASSWORD = "ChangeMe123!";
const PRODUCT_IMAGE = path.join(__dirname, "fixtures", "red.png");
const LOGO_1 = path.join(__dirname, "fixtures", "blue.png");
const LOGO_2 = path.join(__dirname, "fixtures", "blue.png");

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button:has-text("Log in")');
  await expect(page).toHaveURL(/\/mockups$/);
}

async function addZone(
  page: Page,
  label: string,
  decorationType: "PRINT" | "EMBROIDERY",
  maxWidthCm: string,
  maxHeightCm: string
) {
  const img = page.locator('img[alt="Product view"]');
  const box = await img.boundingBox();
  if (!box) throw new Error("Product view image did not render");
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 60, box.y + 60, { steps: 5 });
  await page.mouse.up();

  await page.fill('input[name="label"]', label);
  await page.check(`input[name="decorationTypes"][value="${decorationType}"]`);
  await page.fill('input[name="maxWidthCm"]', maxWidthCm);
  await page.fill('input[name="maxHeightCm"]', maxHeightCm);
  await page.click('button:has-text("Save zone")');
  await expect(page.locator("text=" + label)).toBeVisible();
}

test.describe("mockup builder", () => {
  test("save a mockup with placements on two different views", async ({ page }) => {
    const productName = `E2E Hoodie ${Date.now()}`;
    const salesOrderRef = `SO-E2E-${Date.now()}`;

    await loginAsAdmin(page);

    // --- Catalog setup: one product, one color, front + back views, one zone each ---
    await page.goto("/admin/products");
    await page.fill('input[name="name"]', productName);
    await page.fill('input[name="category"]', "Hoodies");
    await page.click('button:has-text("Create product")');
    await expect(page).toHaveURL(/\/admin\/products\/[^/]+$/);

    await page.fill('input[name="name"]', "Black");
    await page.locator('input[type="color"]').fill("#000000");
    await page.click('button:has-text("Add color")');
    await expect(page.locator("main")).toContainText("Black");

    await page.selectOption('select[name="name"]', "front");
    await page.setInputFiles('input[name="image"]', PRODUCT_IMAGE);
    await page.click('button:has-text("Add view")');
    await expect(page.locator("main")).toContainText("front");

    await page.selectOption('select[name="name"]', "back");
    await page.setInputFiles('input[name="image"]', PRODUCT_IMAGE);
    await page.click('button:has-text("Add view")');
    await expect(page.locator("main")).toContainText("back");

    await page.locator("a", { hasText: "front" }).click();
    await expect(page).toHaveURL(/\/views\//);
    await addZone(page, "Front Chest", "PRINT", "10", "8");

    await page.goBack();
    await expect(page.locator("main")).toContainText("back");
    await page.locator("a", { hasText: "back" }).click();
    await expect(page).toHaveURL(/\/views\//);
    await addZone(page, "Full Back", "EMBROIDERY", "20", "15");

    // --- Build the mockup itself ---
    await page.goto("/mockups/new");
    await expect(page.locator("main")).toContainText("New mockup");

    await page.locator("main input").first().fill(salesOrderRef);

    // Product select defaults to the most recently created product since
    // listProductsForMockupBuilder orders by name; select explicitly to be safe.
    await page.locator("main select").nth(0).selectOption({ label: productName });

    await page.locator("main select").nth(2).selectOption({ label: "front" });
    await page.locator('main input[type="file"]').setInputFiles(LOGO_1);
    await page.waitForTimeout(200); // allow the object URL preview + aspect ratio to load
    await page.click('button:has-text("+ Add this placement")');
    await expect(page.locator("text=Placements to save (1)")).toBeVisible();

    await page.locator("main select").nth(2).selectOption({ label: "back" });
    await page.locator('main input[type="file"]').setInputFiles(LOGO_2);
    await page.waitForTimeout(200);
    await page.click('button:has-text("+ Add this placement")');
    await expect(page.locator("text=Placements to save (2)")).toBeVisible();

    await page.click('button:has-text("Save mockup")');
    await expect(page).toHaveURL(/\/mockups\/[^/]+$/);
    await expect(page.locator("main")).toContainText(salesOrderRef);

    // Both views rendered, both placements listed in the spec sheet.
    await expect(page.locator("span", { hasText: "front" })).toBeVisible();
    await expect(page.locator("span", { hasText: "back" })).toBeVisible();
    await expect(page.locator("main")).toContainText("Front Chest");
    await expect(page.locator("main")).toContainText("Full Back");
    await expect(page.locator("main")).toContainText("PRINT");
    await expect(page.locator("main")).toContainText("EMBROIDERY");

    // Approve flow works end-to-end too.
    await page.click('button:has-text("Approve")');
    await expect(page.locator("text=Status: APPROVED")).toBeVisible();
  });
});
