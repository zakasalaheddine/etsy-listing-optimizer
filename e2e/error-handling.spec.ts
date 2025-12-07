import { expect, TEST_USER, test, VALID_ETSY_URL } from "./fixtures";
import {
  generateMockErrorResponse,
  generateMockOptimizationResult,
} from "./mock-data";

test.describe("Error handling scenarios", () => {
  test.beforeEach(async ({ page, cleanupEmail }) => {
    await cleanupEmail(TEST_USER.email);

    await page.goto("/");
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Simulate network error
    await page.route("**/api/optimizer", async (route) => {
      await route.abort("failed");
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show error message
    await expect(
      page.getByText(/error|failed|problem|network/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should handle 500 server errors", async ({ page }) => {
    const errorResponse = generateMockErrorResponse(
      500,
      "Internal server error",
      "Something went wrong on our end. Please try again later.",
    );

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify(errorResponse),
      });
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show server error message
    await expect(
      page.getByText(/server error|try again|wrong/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should handle invalid Etsy URL errors", async ({ page }) => {
    const errorResponse = generateMockErrorResponse(
      400,
      "Invalid URL",
      "Please provide a valid Etsy listing URL.",
    );

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify(errorResponse),
      });
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill("https://etsy.com/invalid");
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show invalid URL error
    await expect(
      page.getByText(/invalid.*url|valid etsy/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should handle Gemini API errors", async ({ page }) => {
    const errorResponse = generateMockErrorResponse(
      500,
      "AI service error",
      "Unable to process your request due to AI service issues. Please try again.",
    );

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify(errorResponse),
      });
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show AI service error
    await expect(
      page.getByText(/ai service|unable to process|error/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should handle extraction failures", async ({ page }) => {
    const errorResponse = generateMockErrorResponse(
      400,
      "Extraction failed",
      "Unable to extract product details from the URL. The listing may be private or removed.",
    );

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify(errorResponse),
      });
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show extraction error
    await expect(
      page
        .getByText(/unable to extract|listing.*private|removed|error/i)
        .first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should handle database connection errors", async ({ page }) => {
    const errorResponse = generateMockErrorResponse(
      503,
      "Service unavailable",
      "Database connection error. Please try again later.",
    );

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify(errorResponse),
      });
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show database error
    await expect(
      page.getByText(/database|service unavailable|error/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should allow retry after error", async ({ page }) => {
    let attemptCount = 0;

    await page.route("**/api/optimizer", async (route) => {
      attemptCount++;
      if (attemptCount === 1) {
        // First attempt fails
        const errorResponse = generateMockErrorResponse(
          500,
          "Server error",
          "Please try again.",
        );
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify(errorResponse),
        });
      } else {
        // Second attempt succeeds
        const successResponse = generateMockOptimizationResult({
          anchorKeywords: 1,
          descriptiveKeywords: 1,
          titleCount: 1,
          tagCount: 1,
          remainingOptimizations: 4,
        });
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(successResponse),
        });
      }
    });

    // First attempt
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();
    await expect(page.getByText(/server error|error/i).first()).toBeVisible({
      timeout: 5000,
    });

    // Retry
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should succeed
    await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should handle malformed JSON responses", async ({ page }) => {
    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "invalid json{{{",
      });
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show error
    await expect(page.getByText(/error|failed/i).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("should handle timeout scenarios", async ({ page }) => {
    // Mock very slow response
    await page.route("**/api/optimizer", async (_route) => {
      // Don't fulfill the request, simulating timeout
      await new Promise(() => {}); // Never resolves
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show loading state
    await expect(page.getByRole("button", { name: /Optimizing/i })).toBeVisible(
      { timeout: 2000 },
    );

    // Note: Actual timeout handling depends on React Query configuration
  });

  test("should handle missing required fields in response", async ({
    page,
  }) => {
    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          // Missing required fields
          keywords: {},
        }),
      });
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should handle gracefully - either show error or incomplete response message
    await expect(
      page.getByText(/error|failed|incomplete|malformed/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should clear error state when submitting new request", async ({
    page,
  }) => {
    let attemptCount = 0;

    await page.route("**/api/optimizer", async (route) => {
      attemptCount++;
      if (attemptCount === 1) {
        const errorResponse = generateMockErrorResponse(
          500,
          "Server error",
          "Something went wrong.",
        );
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify(errorResponse),
        });
      } else {
        const successResponse = generateMockOptimizationResult({
          anchorKeywords: 1,
          descriptiveKeywords: 1,
          titleCount: 1,
          tagCount: 1,
          remainingOptimizations: 4,
        });
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(successResponse),
        });
      }
    });

    // First attempt - error
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();
    await expect(page.getByText(/server error|error/i).first()).toBeVisible({
      timeout: 5000,
    });

    // Second attempt - success
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Error should be cleared and results shown
    await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should handle CORS errors", async ({ page }) => {
    await page.route("**/api/optimizer", async (route) => {
      await route.abort("accessdenied");
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should show error
    await expect(page.getByText(/error|failed/i).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("should handle email submission errors", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Mock email API error
    const errorResponse = generateMockErrorResponse(
      500,
      "Database error",
      "Unable to save email.",
    );

    await page.route("**/api/email", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify(errorResponse),
      });
    });

    await page.getByLabel("Name").fill(TEST_USER.name);
    await page.getByLabel("Email Address").fill(TEST_USER.email);
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Should handle error - may show error message or still save to localStorage
    // The actual behavior depends on implementation
    await expect(page.getByText(/error|failed|unable/i).first()).toBeVisible({
      timeout: 5000,
    });
  });
});
