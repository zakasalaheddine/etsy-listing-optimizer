import { vi } from "vitest";

/**
 * Mock database state for testing
 */
export class MockDatabase {
  private emailsData: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }> = [];

  private optimizationsData: Array<{
    id: string;
    email: string;
    createdAt: Date;
  }> = [];

  /**
   * Reset all data (useful between tests)
   */
  reset() {
    this.emailsData = [];
    this.optimizationsData = [];
  }

  /**
   * Get all emails
   */
  getEmails() {
    return [...this.emailsData];
  }

  /**
   * Get all optimizations
   */
  getOptimizations() {
    return [...this.optimizationsData];
  }

  /**
   * Add an email record
   */
  addEmail(record: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }) {
    this.emailsData.push(record);
    return record;
  }

  /**
   * Add an optimization record
   */
  addOptimization(record: { id: string; email: string; createdAt: Date }) {
    this.optimizationsData.push(record);
    return record;
  }

  /**
   * Find email by email address
   */
  findEmailByAddress(email: string) {
    return this.emailsData.find((record) => record.email === email);
  }

  /**
   * Count optimizations for an email on a specific date
   */
  countOptimizations(email: string, startDate: Date): number {
    return this.optimizationsData.filter(
      (record) => record.email === email && record.createdAt >= startDate,
    ).length;
  }

  /**
   * Set up predefined data for testing
   */
  seedData(
    emails: typeof this.emailsData,
    optimizations: typeof this.optimizationsData,
  ) {
    this.emailsData = [...emails];
    this.optimizationsData = [...optimizations];
  }
}

/**
 * Shared mock database instance
 */
export const mockDb = new MockDatabase();

/**
 * Creates a mock Drizzle DB instance with configurable behavior
 */
export function createMockDb(options?: {
  insertEmailError?: Error;
  selectEmailsResult?: unknown[];
  selectOptimizationsResult?: unknown[];
  insertOptimizationError?: Error;
}) {
  const mockSelect = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi
        .fn()
        .mockResolvedValue(
          options?.selectOptimizationsResult || [{ count: 0 }],
        ),
    }),
  });

  const mockInsert = vi.fn((table: unknown) => {
    // Determine which table is being inserted into
    // Use a safe property check instead of JSON.stringify to avoid circular reference errors
    // Note: Using 'any' is necessary here to access drizzle-orm table internal properties for mocking
    const tableName = String(
      (table as any)?._?.name || (table as any)?.name || "",
    );
    const isEmailsTable =
      tableName === "emails" || tableName.includes("emails");

    return {
      values: vi.fn().mockImplementation(async (values: unknown) => {
        if (isEmailsTable && options?.insertEmailError) {
          throw options.insertEmailError;
        }
        if (!isEmailsTable && options?.insertOptimizationError) {
          throw options.insertOptimizationError;
        }

        // Simulate successful insert by adding to mock database
        if (isEmailsTable) {
          const emailValues = values as { email: string; name: string };
          mockDb.addEmail({
            id: `mock-id-${Date.now()}`,
            email: emailValues.email,
            name: emailValues.name,
            createdAt: new Date(),
          });
        } else {
          const optValues = values as { email: string };
          mockDb.addOptimization({
            id: `mock-opt-${Date.now()}`,
            email: optValues.email,
            createdAt: new Date(),
          });
        }

        return values;
      }),
    };
  });

  return {
    select: mockSelect,
    insert: mockInsert,
  };
}

/**
 * Mock the database module
 */
export function mockDatabaseModule() {
  return vi.mock("@/lib/db", () => ({
    db: createMockDb(),
  }));
}

/**
 * Helper to create mock query results for rate limiting
 */
export function createRateLimitQueryResult(count: number) {
  return [{ count }];
}

/**
 * Helper to simulate database errors
 */
export const dbErrors = {
  duplicateEmail: () => {
    const error = new Error("duplicate key value violates unique constraint");
    Object.assign(error, {
      code: "23505",
      constraint: "emails_email_unique",
    });
    return error;
  },

  connectionError: () => new Error("Connection terminated unexpectedly"),

  timeoutError: () => new Error("Query timeout"),

  genericError: () => new Error("Database error"),
};

/**
 * Create a mock for the db module with custom behavior
 */
export function createCustomMockDb(config: {
  emailExists?: boolean;
  todayOptimizationsCount?: number;
  insertEmailShouldFail?: boolean;
  insertOptimizationShouldFail?: boolean;
}) {
  const mockInsert = vi.fn((table: unknown) => {
    // Use a safe property check instead of JSON.stringify to avoid circular reference errors
    // Note: Using 'any' is necessary here to access drizzle-orm table internal properties for mocking
    const tableName = String(
      (table as any)?._?.name || (table as any)?.name || "",
    );
    const isEmailsTable =
      tableName === "emails" || tableName.includes("emails");

    return {
      values: vi.fn().mockImplementation(async (values: unknown) => {
        if (isEmailsTable && config.insertEmailShouldFail) {
          throw dbErrors.duplicateEmail();
        }
        if (!isEmailsTable && config.insertOptimizationShouldFail) {
          throw dbErrors.genericError();
        }

        // Successful insert
        if (isEmailsTable) {
          const emailValues = values as { email: string; name: string };
          return mockDb.addEmail({
            id: `mock-id-${Date.now()}`,
            email: emailValues.email,
            name: emailValues.name,
            createdAt: new Date(),
          });
        }

        const optValues = values as { email: string };
        return mockDb.addOptimization({
          id: `mock-opt-${Date.now()}`,
          email: optValues.email,
          createdAt: new Date(),
        });
      }),
    };
  });

  const mockSelect = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi
        .fn()
        .mockResolvedValue([{ count: config.todayOptimizationsCount || 0 }]),
    }),
  });

  return {
    select: mockSelect,
    insert: mockInsert,
  };
}
