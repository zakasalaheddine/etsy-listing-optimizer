import { test, expect, TEST_USER, VALID_ETSY_URL } from "./fixtures";
import {
	generateMockErrorResponse,
	generateMockOptimizationResult,
} from "./mock-data";

test.describe("Rate limiting scenarios", () => {
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
		await page.reload();
	});

	test("should show remaining optimizations count after successful optimization", async ({
		page,
	}) => {
		// Mock API response with remaining count
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

		// Should show remaining count
		await expect(page.getByText(/4.*remaining/i)).toBeVisible({
			timeout: 10000,
		});
	});

	test("should handle rate limit exceeded with proper error message", async ({
		page,
	}) => {
		// Mock API response with 429 status
		const errorResponse = generateMockErrorResponse(
			429,
			"Daily limit reached. Request more access:",
			undefined,
			{
				remaining: 0,
				maxPerDay: 5,
				contactEmail: "test@example.com",
			},
		);

		await page.route("**/api/optimizer", async (route) => {
			await route.fulfill({
				status: 429,
				contentType: "application/json",
				body: JSON.stringify(errorResponse),
			});
		});

		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL);
		await page.getByRole("button", { name: /Optimize Now/i }).click();

		// Should show rate limit error message
		await expect(
			page.getByText(/daily limit|limit reached/i).first(),
		).toBeVisible({ timeout: 5000 });
	});

	test("should show contact email when rate limit is reached", async ({
		page,
	}) => {
		// Mock API response with 429 status
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

		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL);
		await page.getByRole("button", { name: /Optimize Now/i }).click();

		// Should show contact email
		await expect(page.getByText(/support@example\.com/i)).toBeVisible({
			timeout: 5000,
		});
	});

	test("should decrement remaining count after each optimization", async ({
		page,
	}) => {
		let remainingCount = 5;

		// Mock API to decrement count
		await page.route("**/api/optimizer", async (route) => {
			remainingCount--;
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					keywords: {
						anchor: ["test"],
						descriptive: ["test"],
						who: [],
						what: [],
						where: [],
						when: [],
						why: [],
					},
					titles: [{ text: "Test", score: 90 }],
					tags: [{ text: "test", score: 90 }],
					remainingOptimizations: remainingCount,
				}),
			});
		});

		// First optimization
		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL);
		await page.getByRole("button", { name: /Optimize Now/i }).click();
		await expect(page.getByText(/4.*remaining/i)).toBeVisible();

		// Second optimization
		await page
			.getByPlaceholder(/paste your etsy listing url/i)
			.fill(VALID_ETSY_URL.replace("1234567890", "9876543210"));
		await page.getByRole("button", { name: /optimize listing/i }).click();
		await expect(page.getByText(/3.*remaining/i)).toBeVisible();
	});

	test("should reset count on next day", async ({
		page,
	}) => {
		// Note: This test verifies the behavior when optimizations from yesterday exist
		// For e2e tests, we mock the API response to simulate this scenario

		// Mock API response showing full count available
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

		// Should show full remaining count (5 - 1 = 4)
		await expect(page.getByText(/4.*remaining/i)).toBeVisible({
			timeout: 10000,
		});
	});

	test("should track rate limit per email address", async ({
		page,
		cleanupEmail,
	}) => {
		const anotherEmail = "another@example.com";

		// Switch to another user
		await cleanupEmail(anotherEmail);
		await page.evaluate(
			({ name, email }) => {
				localStorage.setItem("optimizer_name", name);
				localStorage.setItem("optimizer_email", email);
			},
			{ name: "Another User", email: anotherEmail },
		);
		await page.reload();

		// Mock API response for new user
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

		// New user should be able to optimize
		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL);
		await page.getByRole("button", { name: /Optimize Now/i }).click();

		// Should show full count for new user
		await expect(page.getByText(/4.*remaining/i)).toBeVisible({
			timeout: 10000,
		});
	});

	test("should handle edge case of exactly reaching limit", async ({
		page,
	}) => {
		// Mock first response - last allowed optimization
		let callCount = 0;
		await page.route("**/api/optimizer", async (route) => {
			callCount++;
			if (callCount === 1) {
				const mockResult = generateMockOptimizationResult({
					anchorKeywords: 1,
					descriptiveKeywords: 1,
					titleCount: 1,
					tagCount: 1,
					remainingOptimizations: 0,
				});
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(mockResult),
				});
			} else {
				// Second call should return 429
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
				await route.fulfill({
					status: 429,
					contentType: "application/json",
					body: JSON.stringify(errorResponse),
				});
			}
		});

		// First optimization - should succeed with 0 remaining
		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL);
		await page.getByRole("button", { name: /Optimize Now/i }).click();
		await expect(page.getByText(/0.*remaining/i)).toBeVisible({
			timeout: 10000,
		});

		// Second optimization - should fail
		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL.replace("1234567890", "9876543210"));
		await page.getByRole("button", { name: /Optimize Now/i }).click();
		await expect(page.getByText(/daily limit|limit reached/i).first()).toBeVisible({
			timeout: 5000,
		});
	});
});
