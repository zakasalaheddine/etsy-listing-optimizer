# E2E Tests for Etsy Listing Optimizer

Comprehensive end-to-end tests using Playwright to ensure the application works correctly from a user's perspective.

## Test Coverage

### 1. First-Time User Flow (`first-time-user.spec.ts`)
- Email form display and validation
- User info persistence to localStorage
- Email format validation
- Form submission requirements
- User data persistence across reloads

### 2. Returning User Flow (`returning-user.spec.ts`)
- Direct access to main form for returning users
- URL submission and validation
- Etsy URL format validation
- Loading states during optimization
- Multiple optimizations in same session
- URL input clearing after success

### 3. Rate Limiting (`rate-limiting.spec.ts`)
- Remaining optimizations count display
- Rate limit exceeded error handling
- Contact email display on limit reached
- Count decrementation after each optimization
- Daily reset functionality
- Per-email tracking
- Edge case of exactly reaching limit

### 4. Error Handling (`error-handling.spec.ts`)
- Network errors
- Server errors (500)
- Invalid URL errors (400)
- Gemini API errors
- Extraction failures
- Database connection errors
- Retry after error
- Malformed JSON responses
- Timeout scenarios
- Missing required fields
- Error state clearing
- CORS errors
- Email submission errors

### 5. Results Display (`results-display.spec.ts`)
- All keyword categories display
- Keywords in respective categories
- All 5 title variations display
- Quality scores for titles
- Tags with scores
- Copy individual titles
- Copy individual tags
- Copy confirmation feedback
- Copy all tags at once
- Titles sorted by score
- Tags sorted by score
- Empty keyword categories
- Character count display
- Character limit highlighting
- Remaining optimizations display
- Results persistence
- Scrolling through results
- Mobile responsiveness

### 6. Edge Cases (`edge-cases.spec.ts`)
- Extremely long product titles (140 chars)
- Maximum number of tags (30)
- Maximum tag length (20 chars)
- Special characters in keywords
- Unicode and emoji in keywords
- Very long email addresses
- Very long names
- Rapid multiple submissions
- localStorage quota exceeded
- Concurrent optimizations from different tabs
- Navigation away and back during optimization
- Browser back/forward buttons
- Copy without clipboard API
- Zero score keywords
- Negative optimization count

## Prerequisites

1. Node.js 20 or higher
2. PostgreSQL database (for integration tests)
3. Environment variables configured in `.env.test`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Set up test database:
```bash
# Create test database
createdb etsy_optimizer_test

# Push schema to test database
DATABASE_URL=postgresql://user:password@localhost:5432/etsy_optimizer_test npm run db:push
```

4. Configure environment variables:
```bash
# Copy .env.test.example to .env.test and update values
cp .env.test.example .env.test
```

## Running Tests

### Run all tests (headless mode)
```bash
npm run test:e2e
```

### Run with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug mode
```bash
npm run test:e2e:debug
```

### Run specific browser
```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Run specific test file
```bash
npx playwright test e2e/first-time-user.spec.ts
```

### Run specific test
```bash
npx playwright test -g "should show email form"
```

## Test Structure

### Fixtures (`fixtures.ts`)
Custom test fixtures providing:
- `dbClient`: PostgreSQL client
- `db`: Drizzle ORM instance
- `cleanupEmail`: Helper to clean up test data
- `addOptimizations`: Helper to add optimization records
- `resetDatabase`: Helper to reset entire database

### Global Setup (`global-setup.ts`)
Runs before all tests to:
- Clean up test database
- Verify app is accessible
- Initialize test environment

### Test Constants
- `TEST_USER`: Standard test user credentials
- `VALID_ETSY_URL`: Valid Etsy listing URL for testing
- `MOCK_OPTIMIZATION_RESULT`: Mock optimization response

## Writing New Tests

1. Import fixtures:
```typescript
import { test, expect, TEST_USER } from "./fixtures";
```

2. Use beforeEach for cleanup:
```typescript
test.beforeEach(async ({ page, cleanupEmail }) => {
  await cleanupEmail(TEST_USER.email);
});
```

3. Write descriptive test names:
```typescript
test("should display error when rate limit exceeded", async ({ page }) => {
  // Test implementation
});
```

4. Use Page Object Model for complex interactions (optional).

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

GitHub Actions workflow: `.github/workflows/e2e-tests.yml`

### CI Environment
- Ubuntu latest
- PostgreSQL 15 service container
- Node.js 20
- Playwright browsers installed

### Artifacts
- Playwright HTML report (30 day retention)
- Test results (30 day retention)
- Screenshots on failure
- Videos on failure
- Traces on first retry

## Viewing Test Reports

### Local Reports
```bash
npm run test:e2e:report
```

### CI Reports
Download artifacts from GitHub Actions workflow run.

## Best Practices

1. **Cleanup**: Always clean up test data in `beforeEach`
2. **Isolation**: Each test should be independent
3. **Selectors**: Use semantic selectors (labels, roles) over CSS
4. **Waits**: Use Playwright's auto-waiting, avoid arbitrary timeouts
5. **Assertions**: Use expect with specific matchers
6. **Mocking**: Mock external APIs (Gemini) for reliability
7. **Database**: Use test database fixtures for data setup

## Troubleshooting

### Tests failing locally
1. Ensure database is running and accessible
2. Check environment variables in `.env.test`
3. Run `npm run build` to ensure app builds correctly
4. Check if port 3000 is available

### Tests timing out
1. Increase timeout in test or config
2. Check if app server started correctly
3. Verify database connection

### Database errors
1. Ensure test database exists
2. Run `db:push` to update schema
3. Check database credentials

### Flaky tests
1. Use Playwright's auto-waiting mechanisms
2. Avoid hard-coded timeouts
3. Ensure test isolation (cleanup between tests)
4. Check for race conditions

## Advanced Usage

### Parallelization
Tests run in parallel by default. Adjust in `playwright.config.ts`:
```typescript
workers: process.env.CI ? 1 : 4
```

### Retries
Configure retries for flaky tests:
```typescript
retries: process.env.CI ? 2 : 0
```

### Multiple Browsers
Run tests across all browsers:
```bash
npx playwright test --project=chromium --project=firefox --project=webkit
```

### Visual Comparison (Future)
Add visual regression tests:
```typescript
await expect(page).toHaveScreenshot();
```

## Contributing

When adding new features:
1. Write e2e tests covering happy path
2. Add error handling tests
3. Consider edge cases
4. Update this README if adding new test files

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
