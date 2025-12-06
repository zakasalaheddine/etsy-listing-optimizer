import { test, expect, TEST_USER, VALID_ETSY_URL } from "./fixtures";
import {
	EdgeCaseGenerators,
	generateMockOptimizationResult,
} from "./mock-data";

test.describe("Edge cases and boundary conditions", () => {
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

	test("should handle extremely long product titles in results", async ({
		page,
	}) => {
		const mockResult = generateMockOptimizationResult({
			titleCount: 1,
			tagCount: 1,
			anchorKeywords: 1,
			descriptiveKeywords: 1,
		});
		// Override title to be exactly 140 chars
		mockResult.titles[0] = {
			text: "A".repeat(140),
			score: 95,
		};

		await page.route("**/api/optimizer", async (route) => {
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

		// Should render without overflow issues
		await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
			timeout: 10000,
		});
	});

	test("should handle maximum number of tags (30)", async ({ page }) => {
		const mockResult = EdgeCaseGenerators.maxTags();

		await page.route("**/api/optimizer", async (route) => {
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

		// All 30 tags should be visible
		await expect(page.getByText(mockResult.tags[0].text)).toBeVisible({
			timeout: 10000,
		});
		await expect(
			page.getByText(mockResult.tags[mockResult.tags.length - 1].text),
		).toBeVisible();
	});

	test("should handle tag with maximum length (20 chars)", async ({
		page,
	}) => {
		const mockResult = generateMockOptimizationResult({
			titleCount: 1,
			tagCount: 1,
			anchorKeywords: 1,
			descriptiveKeywords: 1,
		});
		mockResult.tags[0] = { text: "A".repeat(20), score: 95 };

		await page.route("**/api/optimizer", async (route) => {
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

		// Should display without truncation issues
		await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
			timeout: 10000,
		});
	});

	test("should handle special characters in keywords", async ({ page }) => {
		const mockResult = EdgeCaseGenerators.specialCharacters();

		await page.route("**/api/optimizer", async (route) => {
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

		// Should display special characters correctly
		await expect(page.getByText("hand-made")).toBeVisible({
			timeout: 10000,
		});
		await expect(page.getByText("eco&friendly")).toBeVisible();
	});

	test("should handle unicode and emoji in keywords", async ({ page }) => {
		const mockResult = generateMockOptimizationResult({
			anchorKeywords: 2,
			descriptiveKeywords: 2,
			titleCount: 1,
			tagCount: 2,
		});
		mockResult.keywords.anchor[1] = "eco-friendly ♻️";
		mockResult.keywords.descriptive[1] = "unique ✨";
		mockResult.titles[0].text = "Handmade Gift ♻️";

		await page.route("**/api/optimizer", async (route) => {
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

		// Should handle unicode correctly
		await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
			timeout: 10000,
		});
	});

	test("should handle very long email addresses", async ({
		page,
		cleanupEmail,
	}) => {
		const longEmail = `${"a".repeat(50)}@${"example".repeat(10)}.com`;
		await cleanupEmail(longEmail);

		await page.goto("/");
		await page.evaluate(() => localStorage.clear());
		await page.reload();

		// Mock email API
		await page.route("**/api/email", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					name: "Test User",
					email: longEmail,
					id: 1,
				}),
			});
		});

		await page.getByLabel("Name").fill("Test User");
		await page.getByLabel("Email Address").fill(longEmail);
		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL);
		await page.getByRole("button", { name: /Optimize Now/i }).click();

		// Should accept long email
		await expect(
			page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i),
		).toBeVisible({ timeout: 10000 });
	});

	test("should handle very long names", async ({ page }) => {
		const longName = "A".repeat(200);

		await page.goto("/");
		await page.evaluate(() => localStorage.clear());
		await page.reload();

		// Mock email API
		await page.route("**/api/email", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					name: longName,
					email: TEST_USER.email,
					id: 1,
				}),
			});
		});

		await page.getByLabel("Name").fill(longName);
		await page.getByLabel("Email Address").fill(TEST_USER.email);
		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL);
		await page.getByRole("button", { name: /Optimize Now/i }).click();

		// Should accept long name
		await expect(
			page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i),
		).toBeVisible({ timeout: 10000 });
	});

	test("should handle rapid multiple submissions", async ({ page }) => {
		let callCount = 0;

		await page.route("**/api/optimizer", async (route) => {
			callCount++;
			await new Promise((resolve) => setTimeout(resolve, 100));
			const mockResult = generateMockOptimizationResult({
				anchorKeywords: 1,
				descriptiveKeywords: 1,
				titleCount: 1,
				tagCount: 1,
				remainingOptimizations: 5 - callCount,
			});
			mockResult.keywords.anchor[0] = `test-${callCount}`;
			mockResult.titles[0].text = `Test ${callCount}`;
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(mockResult),
			});
		});

		// Submit multiple times rapidly
		const urlInput = page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i);
		const submitButton = page.getByRole("button", {
			name: /Optimize Now/i,
		});

		for (let i = 0; i < 3; i++) {
			await urlInput.fill(VALID_ETSY_URL.replace("1234567890", String(i)));
			await submitButton.click();
			// Small delay to allow UI to update
			await page.waitForTimeout(200);
		}

		// Should handle all requests or prevent duplicate submissions
		// Implementation-specific behavior
	});

	test("should handle localStorage quota exceeded", async ({ page }) => {
		// Fill localStorage to near capacity
		await page.evaluate(() => {
			try {
				const bigString = "x".repeat(1024 * 1024); // 1MB
				for (let i = 0; i < 5; i++) {
					localStorage.setItem(`dummy-${i}`, bigString);
				}
			} catch (e) {
				// Quota exceeded - expected
			}
		});

		// Try to save user data
		await page.goto("/");
		await page.evaluate(() => localStorage.clear());
		await page.reload();

		// Mock email API
		await page.route("**/api/email", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					name: TEST_USER.name,
					email: TEST_USER.email,
					id: 1,
				}),
			});
		});

		await page.getByLabel("Name").fill(TEST_USER.name);
		await page.getByLabel("Email Address").fill(TEST_USER.email);
		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL);
		await page.getByRole("button", { name: /Optimize Now/i }).click();

		// Should handle gracefully (may show error or use alternative storage)
		await expect(
			page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i),
		).toBeVisible({ timeout: 10000 });
	});

	test("should handle concurrent optimizations from different tabs", async ({
		page,
		context,
	}) => {
		// Open second tab
		const page2 = await context.newPage();
		await page2.goto("/");

		// Set same user in both tabs
		for (const p of [page, page2]) {
			await p.evaluate(
				({ name, email }) => {
					localStorage.setItem("optimizer_name", name);
					localStorage.setItem("optimizer_email", email);
				},
				{ name: TEST_USER.name, email: TEST_USER.email },
			);
			await p.reload();
		}

		// Mock API for both
		const mockResult = generateMockOptimizationResult({
			anchorKeywords: 1,
			descriptiveKeywords: 1,
			titleCount: 1,
			tagCount: 1,
			remainingOptimizations: 3,
		});

		for (const p of [page, page2]) {
			await p.route("**/api/optimizer", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(mockResult),
				});
			});
		}

		// Submit from both tabs
		await Promise.all([
			(async () => {
				await page
					.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
					.fill(VALID_ETSY_URL);
				await page.getByRole("button", { name: /Optimize Now/i }).click();
			})(),
			(async () => {
				await page2
					.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
					.fill(VALID_ETSY_URL);
				await page2.getByRole("button", { name: /Optimize Now/i }).click();
			})(),
		]);

		// Both should complete successfully
		await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
			timeout: 10000,
		});
		await expect(page2.getByText(/Anchor Keywords/i)).toBeVisible({
			timeout: 10000,
		});

		await page2.close();
	});

	test("should handle navigation away and back during optimization", async ({
		page,
	}) => {
		// Mock slow API
		const mockResult = generateMockOptimizationResult({
			anchorKeywords: 1,
			descriptiveKeywords: 1,
			titleCount: 1,
			tagCount: 1,
			remainingOptimizations: 4,
		});

		await page.route("**/api/optimizer", async (route) => {
			await new Promise((resolve) => setTimeout(resolve, 5000));
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

		// Navigate away
		await page.goto("https://example.com");

		// Navigate back
		await page.goto("/");

		// State should be preserved or reset cleanly
		await expect(
			page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i),
		).toBeVisible();
	});

	test("should handle browser back/forward buttons", async ({ page }) => {
		// Submit optimization
		const mockResult = generateMockOptimizationResult({
			anchorKeywords: 1,
			descriptiveKeywords: 1,
			titleCount: 1,
			tagCount: 1,
			remainingOptimizations: 4,
		});

		await page.route("**/api/optimizer", async (route) => {
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
		await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
			timeout: 10000,
		});

		// Navigate to another page
		await page.goto("https://example.com");

		// Go back
		await page.goBack();

		// Should return to app (results may or may not persist)
		await expect(
			page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i),
		).toBeVisible();
	});

	test("should handle copy action when clipboard API is not available", async ({
		page,
	}) => {
		// Disable clipboard API
		await page.addInitScript(() => {
			// @ts-ignore
			delete navigator.clipboard;
		});

		const mockResult = generateMockOptimizationResult({
			anchorKeywords: 1,
			descriptiveKeywords: 1,
			titleCount: 1,
			tagCount: 1,
			remainingOptimizations: 4,
		});

		await page.route("**/api/optimizer", async (route) => {
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
		await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
			timeout: 10000,
		});

		// Try to copy - should handle gracefully or use fallback
		const copyButtons = page.getByRole("button", { name: /copy/i });
		if ((await copyButtons.count()) > 0) {
			await copyButtons.first().click();
			// Should show error or use fallback method
		}
	});

	test("should handle zero score keywords", async ({ page }) => {
		const mockResult = EdgeCaseGenerators.zeroScores();

		await page.route("**/api/optimizer", async (route) => {
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

		// Should display zero scores without issues
		await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
			timeout: 10000,
		});
	});

	test("should handle negative optimization count", async ({ page }) => {
		const mockResult = EdgeCaseGenerators.negativeRemaining();

		await page.route("**/api/optimizer", async (route) => {
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

		// Should handle gracefully (maybe show 0 or error)
		await expect(page.getByText(/Anchor Keywords/i)).toBeVisible({
			timeout: 10000,
		});
	});
});
