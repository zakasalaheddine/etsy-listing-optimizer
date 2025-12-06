import { expect, TEST_USER, test, VALID_ETSY_URL } from "./fixtures";
import { generateMockOptimizationResult } from "./mock-data";

test.describe("Results display and copy functionality", () => {
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

    // Mock successful optimization using generator
    const mockResult = generateMockOptimizationResult({
      anchorKeywords: 3,
      descriptiveKeywords: 3,
      whoKeywords: 2,
      whatKeywords: 2,
      whereKeywords: 2,
      whenKeywords: 2,
      whyKeywords: 2,
      titleCount: 5,
      tagCount: 10,
      remainingOptimizations: 4,
    });

    await page.route("**/api/optimizer", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResult),
      });
    });

    // Trigger optimization
    await page
      .getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
      .fill(VALID_ETSY_URL);
    await page.getByRole("button", { name: /Optimize Now/i }).click();
    await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should display all keyword categories", async ({ page }) => {
    // Check all keyword sections are visible
    await expect(page.getByText(/Anchor Keywords/i)).toBeVisible();
    await expect(page.getByText(/Descriptive Keywords/i)).toBeVisible();
    await expect(page.getByText(/^Who$/i)).toBeVisible();
    await expect(page.getByText(/^What$/i)).toBeVisible();
    await expect(page.getByText(/^Where$/i)).toBeVisible();
    await expect(page.getByText(/^When$/i)).toBeVisible();
    await expect(page.getByText(/^Why$/i)).toBeVisible();
  });

  // test("should display keywords in their respective categories", async ({
  //   page,
  // }) => {
  //   // Check anchor keywords
  //   await expect(page.getByText("handmade").first()).toBeVisible();
  //   await expect(page.getByText("custom").first()).toBeVisible();
  //   await expect(page.getByText("personalized").first()).toBeVisible();

  //   // Check descriptive keywords
  //   await expect(page.getByText("wooden").first()).toBeVisible();
  //   await expect(page.getByText("vintage").first()).toBeVisible();
  //   await expect(page.getByText("unique").first()).toBeVisible();
  // });

  // test("should display all 5 title variations", async ({ page }) => {
  //   // Count title elements
  //   const titles = page.locator(
  //     "text=/Handmade Wooden Wall Decor.*Gift for Mom/i",
  //   );
  //   await expect(titles.first()).toBeVisible();

  //   // Check all titles are rendered
  //   await expect(
  //     page.getByText(/Handmade Wooden Wall Decor, Custom Vintage/),
  //   ).toBeVisible();
  //   await expect(
  //     page.getByText(/Unique Sustainable Wall Decor, Handmade Wooden/),
  //   ).toBeVisible();
  // });

  // test("should display quality scores for titles", async ({ page }) => {
  //   // Check if scores are displayed (95, 90, 88, 85, 82)
  //   await expect(page.getByText(/95|score.*95/i)).toBeVisible();
  //   await expect(page.getByText(/90|score.*90/i)).toBeVisible();
  // });

  // test("should display tags with scores", async ({ page }) => {
  //   // Check tag display
  //   await expect(page.getByText("handmade").first()).toBeVisible();
  //   await expect(page.getByText(/95/)).toBeVisible();

  //   await expect(page.getByText("custom").first()).toBeVisible();
  //   await expect(page.getByText(/94/)).toBeVisible();
  // });

  // test("should allow copying individual titles", async ({ page, context }) => {
  //   // Grant clipboard permissions
  //   await context.grantPermissions(["clipboard-write", "clipboard-read"]);

  //   // Find and click copy button for first title
  //   const copyButtons = page.getByRole("button", { name: /copy/i });
  //   await copyButtons.first().click();

  //   // Check clipboard content
  //   const clipboardText = await page.evaluate(() =>
  //     navigator.clipboard.readText(),
  //   );
  //   expect(clipboardText).toContain("Handmade Wooden Wall Decor");
  // });

  // test("should allow copying individual tags", async ({ page, context }) => {
  //   await context.grantPermissions(["clipboard-write", "clipboard-read"]);

  //   // Find tag copy button
  //   const tagSection = page.locator('text="handmade"').locator("..");
  //   const copyButton = tagSection.getByRole("button", { name: /copy/i });
  //   await copyButton.click();

  //   // Check clipboard
  //   const clipboardText = await page.evaluate(() =>
  //     navigator.clipboard.readText(),
  //   );
  //   expect(clipboardText).toBe("handmade");
  // });

  // test("should show copy confirmation feedback", async ({ page, context }) => {
  //   await context.grantPermissions(["clipboard-write", "clipboard-read"]);

  //   // Click copy button
  //   const copyButton = page.getByRole("button", { name: /copy/i }).first();
  //   await copyButton.click();

  //   // Should show confirmation (check icon, "Copied!" text, etc.)
  //   await expect(page.getByText(/copied|✓|check/i).first()).toBeVisible({
  //     timeout: 2000,
  //   });
  // });

  // test("should allow copying all tags at once", async ({ page, context }) => {
  //   await context.grantPermissions(["clipboard-write", "clipboard-read"]);

  //   // Look for "copy all tags" button
  //   const copyAllButton = page.getByRole("button", {
  //     name: /copy all tags/i,
  //   });
  //   if (await copyAllButton.isVisible()) {
  //     await copyAllButton.click();

  //     const clipboardText = await page.evaluate(() =>
  //       navigator.clipboard.readText(),
  //     );
  //     expect(clipboardText).toContain("handmade");
  //     expect(clipboardText).toContain("custom");
  //   }
  // });

  // test("should display titles sorted by score (highest first)", async ({
  //   page,
  // }) => {
  //   // Get all score elements in title section
  //   const titleScores = await page
  //     .locator('[data-testid="title-score"], .title-score')
  //     .allTextContents();

  //   // Verify descending order if scores are extracted
  //   // This test assumes scores are rendered in a specific way
  // });

  // test("should display tags sorted by score (highest first)", async ({
  //   page,
  // }) => {
  //   // Similar to above, check tag score ordering
  //   const tagScores = await page
  //     .locator('[data-testid="tag-score"], .tag-score')
  //     .allTextContents();

  //   // Verify descending order
  // });

  // test("should handle empty keyword categories gracefully", async ({
  //   page,
  // }) => {
  //   // Reload with response that has empty categories
  //   await page.reload();

  //   await page.route("**/api/optimizer", async (route) => {
  //     await route.fulfill({
  //       status: 200,
  //       contentType: "application/json",
  //       body: JSON.stringify({
  //         keywords: {
  //           anchor: ["test"],
  //           descriptive: ["test"],
  //           who: [], // Empty
  //           what: [], // Empty
  //           where: [], // Empty
  //           when: [], // Empty
  //           why: [], // Empty
  //         },
  //         titles: [{ text: "Test", score: 90 }],
  //         tags: [{ text: "test", score: 90 }],
  //         remainingOptimizations: 4,
  //       }),
  //     });
  //   });

  //   await page
  //     .getByPlaceholder(/paste your etsy listing url/i)
  //     .fill(VALID_ETSY_URL);
  //   await page.getByRole("button", { name: /optimize listing/i }).click();

  //   // Should still render without errors
  //   await expect(page.getByText(/anchor keywords/i)).toBeVisible();

  //   // Empty sections might be hidden or show "No keywords" message
  // });

  // test("should display character count for titles", async ({ page }) => {
  //   // Titles should show character count (max 140)
  //   // Look for character count indicators
  //   const charCountElements = page.locator("text=/\\d+.*char/i");
  //   if ((await charCountElements.count()) > 0) {
  //     await expect(charCountElements.first()).toBeVisible();
  //   }
  // });

  // test("should highlight titles approaching character limit", async ({
  //   page,
  // }) => {
  //   // Mock response with title near limit
  //   await page.reload();

  //   await page.route("**/api/optimizer", async (route) => {
  //     await route.fulfill({
  //       status: 200,
  //       contentType: "application/json",
  //       body: JSON.stringify({
  //         keywords: {
  //           anchor: ["test"],
  //           descriptive: ["test"],
  //           who: [],
  //           what: [],
  //           where: [],
  //           when: [],
  //           why: [],
  //         },
  //         titles: [
  //           {
  //             text: "A".repeat(139), // 139 chars - near limit
  //             score: 90,
  //           },
  //         ],
  //         tags: [{ text: "test", score: 90 }],
  //         remainingOptimizations: 4,
  //       }),
  //     });
  //   });

  //   await page
  //     .getByPlaceholder(/paste your etsy listing url/i)
  //     .fill(VALID_ETSY_URL);
  //   await page.getByRole("button", { name: /optimize listing/i }).click();

  //   // Should render without issues
  //   await expect(page.getByText(/anchor keywords/i)).toBeVisible();
  // });

  // test("should display remaining optimizations count prominently", async ({
  //   page,
  // }) => {
  //   // Check remaining count is visible
  //   await expect(page.getByText(/4.*remaining/i)).toBeVisible();
  // });

  // test("should persist results across page reloads", async ({ page }) => {
  //   // Results should still be visible after reload
  //   await page.reload();

  //   // Note: This depends on whether results are stored in localStorage
  //   // If not stored, results will disappear - document this behavior
  // });

  // test("should allow scrolling through all results", async ({ page }) => {
  //   // Verify all sections are reachable by scrolling
  //   await expect(page.getByText(/anchor keywords/i)).toBeVisible();

  //   // Scroll to tags section
  //   const tagsSection = page.getByText(/tags/i).last();
  //   await tagsSection.scrollIntoViewIfNeeded();
  //   await expect(tagsSection).toBeVisible();
  // });

  // test("should be responsive on mobile viewports", async ({ page }) => {
  //   // Set mobile viewport
  //   await page.setViewportSize({ width: 375, height: 667 });

  //   // Reload to apply mobile styles
  //   await page.reload();

  //   await page.route("**/api/optimizer", async (route) => {
  //     await route.fulfill({
  //       status: 200,
  //       contentType: "application/json",
  //       body: JSON.stringify({
  //         keywords: {
  //           anchor: ["test"],
  //           descriptive: ["test"],
  //           who: [],
  //           what: [],
  //           where: [],
  //           when: [],
  //           why: [],
  //         },
  //         titles: [{ text: "Test", score: 90 }],
  //         tags: [{ text: "test", score: 90 }],
  //         remainingOptimizations: 4,
  //       }),
  //     });
  //   });

  //   await page
  //     .getByPlaceholder(/paste your etsy listing url/i)
  //     .fill(VALID_ETSY_URL);
  //   await page.getByRole("button", { name: /optimize listing/i }).click();

  //   // Results should be visible on mobile
  //   await expect(page.getByText(/anchor keywords/i)).toBeVisible();
  // });
});
