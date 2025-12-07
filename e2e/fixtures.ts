import { test as base, expect } from "@playwright/test";
import { generateMockOptimizationResult } from "./mock-data";

type TestFixtures = {
  cleanupEmail: (email: string) => Promise<void>;
  addOptimizations: (email: string, count: number) => Promise<void>;
  resetDatabase: () => Promise<void>;
};

export const test = base.extend<TestFixtures>({
  // Cleanup specific email from all tables (no-op - we use mocks)
  // biome-ignore lint/correctness/noEmptyPattern: Intentional empty pattern for no-op fixture
  cleanupEmail: async ({}, use) => {
    const cleanup = async (_email: string) => {
      // No-op: All tests use mocked API responses, no database needed
    };
    await use(cleanup);
  },

  // Add optimization records for testing rate limiting (no-op - we use mocks)
  // biome-ignore lint/correctness/noEmptyPattern: Intentional empty pattern for no-op fixture
  addOptimizations: async ({}, use) => {
    const addOpts = async (_email: string, _count: number) => {
      // No-op: Rate limiting tests should mock API responses directly
    };
    await use(addOpts);
  },

  // Reset entire database (no-op - we use mocks)
  // biome-ignore lint/correctness/noEmptyPattern: Intentional empty pattern for no-op fixture
  resetDatabase: async ({}, use) => {
    const reset = async () => {
      // No-op: All tests use mocked API responses, no database needed
    };
    await use(reset);
  },
});

export { expect };

// Constants for testing
export const TEST_USER = {
  name: "Test User",
  email: "test@example.com",
};

export const VALID_ETSY_URL =
  "https://www.etsy.com/listing/1234567890/test-product";
export const INVALID_URL = "https://invalid-url.com/product";

// Mock optimization result helper (using generator)
export const MOCK_OPTIMIZATION_RESULT = generateMockOptimizationResult();
