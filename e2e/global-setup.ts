import { chromium, type FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("Setting up e2e test environment...");

  // Note: Database cleanup is skipped in global setup to avoid authentication issues
  // Tests will handle their own database cleanup using fixtures

  // Verify the app is accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(
      config.projects[0].use?.baseURL || "http://localhost:3000",
      {
        timeout: 60000,
      },
    );
    console.log("App is accessible");
  } catch (error) {
    console.error("App is not accessible:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
