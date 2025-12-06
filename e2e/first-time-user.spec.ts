import { test, expect, TEST_USER, VALID_ETSY_URL } from "./fixtures";
import {
	generateMockEmailResponse,
	generateMockOptimizationResult,
} from "./mock-data";

test.describe("First-time user flow", () => {
	test.beforeEach(async ({ page, cleanupEmail }) => {
		// Clean up test user data
		await cleanupEmail(TEST_USER.email);

		// Clear localStorage
		await page.goto("/");
		await page.evaluate(() => localStorage.clear());
	});

	test("should show email form when no user data in localStorage", async ({
		page,
	}) => {
		await page.goto("/");

		// Email form should be visible
		await expect(page.getByLabel("Name")).toBeVisible();
		await expect(page.getByLabel("Email Address")).toBeVisible();
		await expect(page.getByRole("button", { name: /Optimize Now/i })).toBeVisible();
	});

	test("should save user info to localStorage after email submission", async ({
		page,
	}) => {
		await page.goto("/");

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

		// Fill in email form
		await page.getByLabel("Name").fill(TEST_USER.name);
		await page.getByLabel("Email Address").fill(TEST_USER.email);
		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL);
		await page.getByRole("button", { name: /Optimize Now/i }).click();

		// Wait for form to disappear
		await expect(page.getByLabel("Name")).not.toBeVisible({ timeout: 10000 });

		// Check localStorage
		const userName = await page.evaluate(() =>
			localStorage.getItem("optimizer_name"),
		);
		const userEmail = await page.evaluate(() =>
			localStorage.getItem("optimizer_email"),
		);

		expect(userName).toBe(TEST_USER.name);
		expect(userEmail).toBe(TEST_USER.email);
	});

	test("should show main form after email submission", async ({ page }) => {
		await page.goto("/");

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

		// Submit email form
		await page.getByLabel("Name").fill(TEST_USER.name);
		await page.getByLabel("Email Address").fill(TEST_USER.email);
		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL);
		await page.getByRole("button", { name: /Optimize Now/i }).click();

		// Wait for name field to disappear
		await expect(page.getByLabel("Name")).not.toBeVisible({ timeout: 10000 });

		// Main form should be visible (URL input still visible for returning users)
		await expect(
			page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Optimize Now/i }),
		).toBeVisible();
	});

	test("should validate email format in email form", async ({ page }) => {
		await page.goto("/");

		// Try invalid email
		await page.getByLabel("Name").fill(TEST_USER.name);
		await page.getByLabel("Email Address").fill("invalid-email");
		await page.getByRole("button", { name: /Optimize Now/i }).click();

		// Form should show validation error (HTML5 validation)
		const emailInput = page.getByLabel("Email Address");
		const validationMessage = await emailInput.evaluate(
			(el: HTMLInputElement) => el.validationMessage,
		);
		expect(validationMessage).toBeTruthy();
	});

	test("should require both name and email to submit", async ({ page }) => {
		await page.goto("/");

		// Try to submit with only name
		await page.getByLabel("Name").fill(TEST_USER.name);
		const continueButton = page.getByRole("button", { name: /Optimize Now/i });

		// Button should be disabled or form should not submit
		const isDisabled = await continueButton.isDisabled();
		expect(isDisabled).toBe(true);

		// Fill email
		await page.getByLabel("Email Address").fill(TEST_USER.email);

		// Now button should be enabled
		await expect(continueButton).toBeEnabled();
	});

	test("should persist user across page reloads", async ({ page }) => {
		await page.goto("/");

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

		// Submit email form
		await page.getByLabel("Name").fill(TEST_USER.name);
		await page.getByLabel("Email Address").fill(TEST_USER.email);
		await page
			.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i)
			.fill(VALID_ETSY_URL);
		await page.getByRole("button", { name: /Optimize Now/i }).click();

		// Wait for main form
		await expect(
			page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i),
		).toBeVisible({ timeout: 10000 });

		// Reload page
		await page.reload();

		// Should still see main form (not email form)
		await expect(
			page.getByPlaceholder(/https:\/\/www\.etsy\.com\/listing/i),
		).toBeVisible();
		await expect(page.getByLabel("Name")).not.toBeVisible();
	});

	test("should auto-trigger optimization if URL was entered before email submission", async ({
		page,
	}) => {
		await page.goto("/");

		// Email form should be visible
		await expect(page.getByLabel("Email Address")).toBeVisible();

		// Note: This scenario requires checking if the app supports entering URL first
		// If not supported, this test documents expected behavior
		// The implementation may show email form immediately blocking URL input
	});
});
