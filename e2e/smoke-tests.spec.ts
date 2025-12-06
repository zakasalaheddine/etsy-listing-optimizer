import { test, expect, TEST_USER, VALID_ETSY_URL } from "./fixtures";
import {
  generateMockEmailResponse,
  generateMockErrorResponse,
  generateMockOptimizationResult,
} from "./mock-data";

/**
 * Smoke tests - Critical user flows that must work
 * These tests use mocked API responses and never touch the database
 */

test.describe("Smoke Tests - Critical Flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("should show user info form for first-time visitor", async ({
    page,
  }) => {
    // Verify the form shows with correct labels
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Optimize Now/i }),
    ).toBeVisible();
  });

  test("should accept user info and show main form", async ({ page }) => {
    // Mock email API
    await page.route("**/api/email", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          generateMockEmailResponse(TEST_USER.name, TEST_USER.email),
        ),
      });
    });

    // Fill in user info
    await page.getByLabel("Name").fill(TEST_USER.name);
    await page.getByLabel("Email Address").fill(TEST_USER.email);
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Wait for form to update (name field should disappear)
    await expect(page.getByLabel("Name")).not.toBeVisible({
      timeout: 10000,
    });

    // Should show the URL input (still visible for returning users)
    await expect(
      page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i),
    ).toBeVisible();
  });

  test("should persist user info in localStorage", async ({ page }) => {
    // Mock the email API endpoint
    await page.route("**/api/email", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          generateMockEmailResponse(TEST_USER.name, TEST_USER.email),
        ),
      });
    });

    // Submit user info
    await page.getByLabel("Name").fill(TEST_USER.name);
    await page.getByLabel("Email Address").fill(TEST_USER.email);
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Wait for the name field to disappear (indicating user info was saved)
    await expect(page.getByLabel("Name")).not.toBeVisible({ timeout: 10000 });

    // Check localStorage
    const name = await page.evaluate(() =>
      localStorage.getItem("optimizer_name"),
    );
    const email = await page.evaluate(() =>
      localStorage.getItem("optimizer_email"),
    );

    expect(name).toBe(TEST_USER.name);
    expect(email).toBe(TEST_USER.email);
  });

  test("should skip user info form for returning users", async ({ page }) => {
    // Set localStorage
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );

    // Reload page
    await page.reload();

    // Should go straight to main form
    await expect(page.getByLabel("Name")).not.toBeVisible();
    await expect(
      page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i),
    ).toBeVisible();
  });

  test("should display optimization results after successful API call", async ({
    page,
  }) => {
    // Setup user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();

    // Mock successful API response using generator
    const mockResult = generateMockOptimizationResult({
      anchorKeywords: 2,
      descriptiveKeywords: 2,
      whoKeywords: 1,
      whatKeywords: 1,
      whereKeywords: 1,
      whenKeywords: 1,
      whyKeywords: 1,
      titleCount: 2,
      descriptionCount: 1,
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

    // Submit URL
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Wait for results to appear - check for keyword section
    await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
      timeout: 10000,
    });

    // Verify keywords are visible
    if (mockResult.keywords.anchor.length > 0) {
      await expect(
        page.getByText(mockResult.keywords.anchor[0], { exact: false }),
      ).toBeVisible();
    }
    if (mockResult.keywords.descriptive.length > 0) {
      await expect(
        page.getByText(mockResult.keywords.descriptive[0], { exact: false }),
      ).toBeVisible();
    }

    // Verify remaining count is shown
    await expect(page.getByText(/4.*remaining/i)).toBeVisible();
  });

  test("should handle rate limit error gracefully", async ({ page }) => {
    // Setup user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();

    // Mock rate limit response using generator
    const errorResponse = generateMockErrorResponse(
      429,
      "Daily limit reached. Request more access:",
      undefined,
      {
        remaining: 0,
        maxPerDay: 5,
        contactEmail: "support@example.com",
      },
    );

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify(errorResponse),
      });
    });

    // Submit URL
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show error message
    await expect(page.getByText(/daily limit|limit reached/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("should handle server errors gracefully", async ({ page }) => {
    // Setup user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();

    // Mock server error using generator
    const errorResponse = generateMockErrorResponse(
      500,
      "Internal server error",
      "Something went wrong. Please try again later.",
    );

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify(errorResponse),
      });
    });

    // Submit URL
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show error message
    await expect(page.getByText(/error|wrong|try again/i).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("should validate Etsy URL format", async ({ page }) => {
    // Setup user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();

    // Mock API error for invalid URL using generator
    const errorResponse = generateMockErrorResponse(
      400,
      "Invalid Etsy URL",
      "Please provide a valid Etsy listing URL",
    );

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify(errorResponse),
      });
    });

    // Try invalid URL
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill("https://amazon.com");

    // Click submit button
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show error message
    await expect(
      page.getByText(/error|invalid|valid etsy/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });
});
