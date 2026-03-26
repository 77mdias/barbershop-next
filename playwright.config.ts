import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration.
 *
 * Two projects: desktop Chromium (1280×720) and mobile Chromium (390×844).
 * The dev server starts automatically via `webServer`.
 */
export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry twice on CI, zero locally */
  retries: process.env.CI ? 2 : 0,

  /* Parallel workers: 1 on CI to keep resource usage stable */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter: HTML locally, list on CI */
  reporter: process.env.CI ? "list" : "html",

  /* Shared settings for all projects */
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  /* Timeouts */
  timeout: 60_000,
  expect: { timeout: 10_000 },

  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],

  /* Start the Next.js dev server before running tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
