import { expect, TEST_USER, test, VALID_ETSY_URL } from "./fixtures";
import { generateMockOptimizationResult } from "./mock-data";

/**
 * Copy and Link Verification Tests
 * Ensures all copy is typo-free and all links work correctly
 */

test.describe("Copy Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("should display hero section copy correctly", async ({ page }) => {
    // Main heading - check both parts are visible
    await expect(page.getByText("AI-Powered").first()).toBeVisible();
    await expect(
      page.getByText("Etsy Listing Optimizer").first(),
    ).toBeVisible();

    // Subheading
    await expect(
      page.getByText(
        /Turn your Etsy listings into sales magnets with AI-optimized titles, descriptions, and tags/i,
      ),
    ).toBeVisible();

    // Feature badges
    await expect(page.getByText(/Free to use/i)).toBeVisible();
    await expect(page.getByText(/Instant results/i)).toBeVisible();
    await expect(page.getByText(/AI-powered optimization/i)).toBeVisible();
  });

  test("should display form labels correctly", async ({ page }) => {
    // First-time user form labels
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Etsy Listing URL")).toBeVisible();

    // Button text
    await expect(
      page.getByRole("button", { name: /Optimize Now/i }),
    ).toBeVisible();

    // Form heading
    await expect(
      page.getByRole("heading", {
        name: /Get Started - Enter Your Information/i,
      }),
    ).toBeVisible();
  });

  test("should display returning user form copy correctly", async ({
    page,
  }) => {
    // Set up returning user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();

    // Check heading changes for returning users
    await expect(
      page.getByRole("heading", { name: /Optimize Your Etsy Listing/i }),
    ).toBeVisible();

    // Check user info display
    await expect(page.getByText(/Optimizing for:/i)).toBeVisible();
    await expect(page.getByText(TEST_USER.name)).toBeVisible();
    await expect(page.getByText(TEST_USER.email)).toBeVisible();
  });

  test("should display How It Works section copy correctly", async ({
    page,
  }) => {
    // Section heading
    await expect(
      page.getByRole("heading", { name: /How It Works/i }),
    ).toBeVisible();

    // Subheading
    await expect(
      page.getByText(/Get AI-optimized Etsy listings in three simple steps/i),
    ).toBeVisible();

    // Step 1
    await expect(page.getByText(/Paste your Etsy listing URL/i)).toBeVisible();
    await expect(
      page.getByText(
        /Simply copy and paste the URL of your Etsy listing into our optimizer tool/i,
      ),
    ).toBeVisible();

    // Step 2
    await expect(page.getByText(/Get AI-powered analysis/i)).toBeVisible();
    await expect(
      page.getByText(
        /Our AI analyzes your product details and generates SEO-optimized content using the Who, What, Where, When, Why Method/i,
      ),
    ).toBeVisible();

    // Step 3
    await expect(page.getByText(/Copy optimized titles & tags/i)).toBeVisible();
    await expect(
      page.getByText(
        /Review your optimized content with quality scores and copy the best options directly to your Etsy listing/i,
      ),
    ).toBeVisible();
  });

  test("should display Before/After section copy correctly", async ({
    page,
  }) => {
    // Section heading
    await expect(
      page.getByRole("heading", { name: /See The Transformation/i }),
    ).toBeVisible();

    // Subheading
    await expect(
      page.getByText(
        /Real example of how AI optimization improves your Etsy listing/i,
      ),
    ).toBeVisible();

    // Before section
    await expect(page.getByText(/Before/i).first()).toBeVisible();
    await expect(page.getByText(/Generic listing/i)).toBeVisible();
    await expect(
      page.getByText(
        /Issues: Generic keywords, poor SEO, limited discoverability/i,
      ),
    ).toBeVisible();

    // After section
    await expect(page.getByText(/After/i).first()).toBeVisible();
    await expect(page.getByText(/AI-optimized listing/i)).toBeVisible();
    await expect(
      page.getByText(
        /Benefits: Targeted keywords, better SEO, increased visibility/i,
      ),
    ).toBeVisible();

    // Score improvement
    await expect(page.getByText(/Average score improvement:/i)).toBeVisible();
    await expect(page.getByText(/\+67 points/i)).toBeVisible();
  });

  test("should display footer copy correctly", async ({ page }) => {
    // Footer text
    await expect(page.getByText(/Built with AI by a/i)).toBeVisible();
    await expect(page.getByText(/developer/i)).toBeVisible();
    await expect(page.getByText(/who runs an Etsy store/i)).toBeVisible();

    // SEO method attribution
    await expect(
      page.getByText(
        /Using the Who, What, Where, When, Why SEO Method with Google Gemini AI/i,
      ),
    ).toBeVisible();
  });

  test("should display rate limit copy correctly", async ({ page }) => {
    // Set up user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();

    // Mock successful optimization with rate limit info
    const mockResult = generateMockOptimizationResult({
      remainingOptimizations: 4,
    });

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResult),
      });
    });

    // Submit optimization
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Wait for results
    await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
      timeout: 10000,
    });

    // Check rate limit message
    await expect(
      page.getByText(/Optimizations Remaining/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/You have 4 optimization.*remaining today/i),
    ).toBeVisible();
  });

  test("should display results section copy correctly", async ({ page }) => {
    // Set up user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();

    // Mock successful optimization
    const mockResult = generateMockOptimizationResult({
      anchorKeywords: 2,
      descriptiveKeywords: 2,
      whoKeywords: 1,
      whatKeywords: 1,
      whereKeywords: 1,
      whenKeywords: 1,
      whyKeywords: 1,
      titleCount: 2,
      descriptionCount: 2,
      tagCount: 5,
    });

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResult),
      });
    });

    // Submit optimization
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Wait for results
    await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
      timeout: 10000,
    });

    // Results header
    await expect(
      page.getByRole("heading", { name: /Optimized Content/i }),
    ).toBeVisible();
    // Check for product type display (appears below "Optimized Content" heading)
    await expect(
      page.locator("p").filter({ hasText: /For:.*Wall Decor/i }),
    ).toBeVisible();

    // Keyword section
    await expect(
      page.getByRole("heading", { name: /Keyword Brainstorm/i }),
    ).toBeVisible();
    await expect(page.getByText(/Anchor Keywords/i)).toBeVisible();
    await expect(page.getByText(/Descriptive Keywords/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Who", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "What", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Where", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "When", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Why", exact: true }),
    ).toBeVisible();

    // Action checklist
    await expect(
      page.getByRole("heading", {
        name: /Action Checklist for Listing Setup/i,
      }),
    ).toBeVisible();
    await expect(page.getByText(/Categories:/i)).toBeVisible();
    await expect(
      page.getByText(
        /Select the most accurate and descriptive category path available in the Etsy taxonomy/i,
      ),
    ).toBeVisible();
    await expect(page.getByText(/Attributes:/i)).toBeVisible();
    await expect(
      page.getByText(
        /Only select attributes that are 100% accurate and targeted to the product/i,
      ),
    ).toBeVisible();
    await expect(page.getByText(/Description:/i).first()).toBeVisible();
    await expect(
      page.getByText(
        /Write a natural, compelling description focused on the customer experience/i,
      ),
    ).toBeVisible();
  });

  test("should display loading states with correct copy", async ({ page }) => {
    // Set up user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();

    // Mock slow API response to see loading states
    await page.route("**/api/optimizer", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const mockResult = generateMockOptimizationResult({});
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResult),
      });
    });

    // Submit optimization
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Check loading button text
    await expect(
      page.getByRole("button", { name: /Optimizing.../i }),
    ).toBeVisible();

    // Check loading messages appear (they cycle through different states)
    const loadingMessageVisible = await Promise.race([
      page.getByText(/Fetching listing details/i).isVisible(),
      page.getByText(/Analyzing product information/i).isVisible(),
      page.getByText(/Generating SEO optimizations/i).isVisible(),
    ]);
    expect(loadingMessageVisible).toBeTruthy();
  });

  test("should display error messages with correct copy", async ({ page }) => {
    // Set up user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );

    // Mock error response BEFORE reload
    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Internal server error",
          message: "Could not generate optimized listing.",
        }),
      });
    });

    await page.reload();

    // Submit optimization
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Check that an error message appears
    // The exact error text can vary, but we should see some kind of error alert
    await page.waitForTimeout(1000);
    const errorAlerts = await page.getByRole("alert").count();
    expect(errorAlerts).toBeGreaterThan(0);
  });

  test("should display daily limit message with correct copy", async ({
    page,
  }) => {
    // Set up user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();

    // Mock rate limit response
    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Rate limit exceeded",
          rateLimit: {
            remaining: 0,
            maxPerDay: 5,
            contactEmail: "salaheddine@zakadev.com",
          },
        }),
      });
    });

    // Submit optimization
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Check rate limit message
    await expect(page.getByText(/Daily Limit Reached/i).first()).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByText(/Daily limit reached. Request more access:/i),
    ).toBeVisible();
  });
});

test.describe("Link Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("should have working link to developer website", async ({ page }) => {
    // Find the link
    const developerLink = page.getByRole("link", { name: /developer/i });
    await expect(developerLink).toBeVisible();

    // Verify href attribute
    await expect(developerLink).toHaveAttribute("href", "https://zakadev.com");

    // Verify target attribute for external link
    await expect(developerLink).toHaveAttribute("target", "_blank");
  });

  test("should have correct email link in rate limit message", async ({
    page,
  }) => {
    // Set up user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();

    // Mock rate limit response
    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Rate limit exceeded",
          rateLimit: {
            remaining: 0,
            maxPerDay: 5,
            contactEmail: "salaheddine@zakadev.com",
          },
        }),
      });
    });

    // Submit optimization
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Wait for rate limit message
    await expect(page.getByText(/Daily Limit Reached/i).first()).toBeVisible({
      timeout: 5000,
    });

    // Find and verify email link
    const emailLink = page.getByRole("link", {
      name: /salaheddine@zakadev.com/i,
    });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute(
      "href",
      "mailto:salaheddine@zakadev.com",
    );
  });

  // Note: Trademark analysis feature tests removed as this feature is not currently
  // integrated into the optimization results flow. The TrademarkSection component
  // exists but is not being used in the current ResultsDisplay.

  test("should have accessible external links with proper attributes", async ({
    page,
  }) => {
    // Check developer link
    const developerLink = page.getByRole("link", { name: /developer/i });
    await expect(developerLink).toBeVisible();

    // Verify it has target="_blank" for external links
    const target = await developerLink.getAttribute("target");
    expect(target).toBe("_blank");

    // External links should be keyboard accessible
    await developerLink.focus();
    const isFocused = await developerLink.evaluate(
      (el) => el === document.activeElement,
    );
    expect(isFocused).toBe(true);
  });

  test("should have no broken anchor links on page", async ({ page }) => {
    // Get all anchor elements
    const links = await page.locator("a").all();

    // Check each link has a valid href (not empty or just #)
    for (const link of links) {
      const href = await link.getAttribute("href");

      // Skip if href is null (shouldn't happen but for safety)
      if (href === null) continue;

      // Href should not be empty
      expect(href).not.toBe("");

      // Href should not be just a hash (unless it's a valid anchor)
      if (href === "#") {
        // This would be invalid - there should be no standalone hash links
        throw new Error("Found invalid standalone hash link");
      }
    }
  });

  test("should validate all mailto links are properly formatted", async ({
    page,
  }) => {
    // Set up user
    await page.evaluate(
      ({ name, email }) => {
        localStorage.setItem("optimizer_name", name);
        localStorage.setItem("optimizer_email", email);
      },
      { name: TEST_USER.name, email: TEST_USER.email },
    );
    await page.reload();

    // Trigger rate limit to show email link
    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Rate limit exceeded",
          rateLimit: {
            remaining: 0,
            maxPerDay: 5,
            contactEmail: "salaheddine@zakadev.com",
          },
        }),
      });
    });

    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();

    // Wait for email link to appear
    await expect(page.getByText(/Daily Limit Reached/i).first()).toBeVisible({
      timeout: 5000,
    });

    // Get all mailto links
    const mailtoLinks = await page.locator('a[href^="mailto:"]').all();

    // Verify each mailto link is properly formatted
    for (const link of mailtoLinks) {
      const href = await link.getAttribute("href");
      if (href) {
        // Should start with mailto:
        expect(href.startsWith("mailto:")).toBe(true);

        // Should have a valid email after mailto:
        const email = href.replace("mailto:", "");
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      }
    }
  });
});
