import { chromium, type FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("Setting up e2e test environment...");

  // Note: Database cleanup is skipped in global setup to avoid authentication issues
  // Tests will handle their own database cleanup using fixtures

  // Verify the app is accessible with retries
  // Playwright's webServer starts before globalSetup, but we need to wait for it to be ready
  const baseURL = config.projects[0].use?.baseURL || "http://localhost:3000";
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const maxRetries = 10;
  const retryDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(baseURL, {
        timeout: 10000,
        waitUntil: "networkidle",
      });
      console.log("App is accessible");
      await browser.close();
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(
          `App is not accessible after ${maxRetries} attempts:`,
          error,
        );
        await browser.close();
        throw error;
      }
      console.log(
        `Attempt ${attempt}/${maxRetries}: App not ready yet, retrying in ${retryDelay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  await browser.close();
}

export default globalSetup;
