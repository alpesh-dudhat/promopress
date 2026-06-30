import { defineConfig, devices } from "@playwright/test";

// e2e tests run against the real dev server with a separate, disposable
// SQLite database (test.db) so they never touch your local dev.db.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1, // tests share one server + SQLite file; keep them serial
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 60_000,
    env: { DATABASE_URL: "file:./test.db" },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
