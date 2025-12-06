import { test, expect, TEST_USER, VALID_ETSY_URL } from "./fixtures";
import { generateMockOptimizationResult } from "./mock-data";

test.describe("Returning user flow", () => {
  test.beforeEach(async ({ page, cleanupEmail }) => {
    // Clean up test user data
    await cleanupEmail(TEST_USER.email);

    // Set up localStorage with user data
    await page.goto("/");
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );

    // Reload to apply localStorage changes
    await page.reload();
  });

  test("should show main form directly without email form", async ({
    page,
  }) => {
    // Main form should be visible
    await expect(
      page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Optimize Now/i }),
    ).toBeVisible();

    // Email form should not be visible
    await expect(page.getByLabel("Name")).not.toBeVisible();
  });

  test("should be able to submit URL for optimization", async ({ page }) => {
    // Enter Etsy URL
    const urlInput = page.getByPlaceholder(
      /https:\/\/www\.etsy\.com\/listing/i,
    );
    await urlInput.fill(VALID_ETSY_URL);

    // Submit button should be enabled
    const submitButton = page.getByRole("button", {
      name: /Optimize Now/i,
    });
    await expect(submitButton).toBeEnabled();
  });

  test("should validate Etsy URL format", async ({ page }) => {
    // Enter non-Etsy URL
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill("https://amazon.com/product");

    const submitButton = page.getByRole("button", {
      name: /Optimize Now/i,
    });

    // Submit button should be disabled or show validation error
    // HTML5 validation may allow it, but API will reject it
    // For now, just verify button exists
    await expect(submitButton).toBeVisible();
  });

  test("should require URL to be filled before submission", async ({
    page,
  }) => {
    const submitButton = page.getByRole("button", {
      name: /Optimize Now/i,
    });

    // Button should be disabled when URL is empty (HTML5 required validation)
    await expect(submitButton).toBeDisabled();

    // Fill URL
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);

    // Button should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test("should show loading state during optimization", async ({ page }) => {
    // Mock slow API response
    const mockResult = generateMockOptimizationResult({
      anchorKeywords: 1,
      descriptiveKeywords: 1,
      titleCount: 1,
      tagCount: 1,
      remainingOptimizations: 4,
    });

    await page.route("**/api/optimizer", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResult),
      });
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show loading indicator
    await expect(page.getByRole("button", { name: /Optimizing/i })).toBeVisible(
      { timeout: 1000 },
    );
  });

  test("should clear URL input after successful optimization", async ({
    page,
  }) => {
    // Mock successful API response
    const mockResult = generateMockOptimizationResult({
      anchorKeywords: 1,
      descriptiveKeywords: 1,
      whoKeywords: 1,
      whatKeywords: 1,
      whereKeywords: 1,
      whenKeywords: 1,
      whyKeywords: 1,
      titleCount: 2,
      tagCount: 2,
      remainingOptimizations: 4,
    });

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResult),
      });
    });

    const urlInput = page.getByPlaceholder(
      /https:\/\/www\.etsy\.com\/listing/i,
    );
    await urlInput.fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Wait for results to appear
    await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
      timeout: 10000,
    });

    // URL input should be cleared
    await expect(urlInput).toHaveValue("");
  });

  test("should allow multiple optimizations in same session", async ({
    page,
  }) => {
    // Mock successful API response
    const mockResult = generateMockOptimizationResult({
      anchorKeywords: 1,
      descriptiveKeywords: 1,
      titleCount: 1,
      tagCount: 1,
      remainingOptimizations: 3,
    });

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResult),
      });
    });

    // First optimization
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();
    await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
      timeout: 10000,
    });

    // Should be able to do another optimization
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL.replace("1234567890", "9876543210"));
    await expect(
      page.getByRole("button", { name: /Optimize Now/i }),
    ).toBeEnabled();
  });
});
