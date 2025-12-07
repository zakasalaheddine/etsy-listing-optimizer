/**
 * Runtime Database Generator - Simulates database behavior in memory
 * Used for testing and when DATABASE_URL is not available
 */

import type { emails, optimizations } from "./schema";

type EmailRecord = typeof emails.$inferInsert & { id: string; createdAt: Date };
type OptimizationRecord = typeof optimizations.$inferInsert & {
  id: string;
  createdAt: Date;
};

/**
 * In-memory database storage
 */
class RuntimeDatabase {
  private emails: Map<string, EmailRecord> = new Map();
  private optimizations: Map<string, OptimizationRecord> = new Map();
  private emailIdCounter = 1;
  private optimizationIdCounter = 1;

  /**
   * Reset all data (useful for test cleanup)
   */
  reset() {
    this.emails.clear();
    this.optimizations.clear();
    this.emailIdCounter = 1;
    this.optimizationIdCounter = 1;
  }

  /**
   * Seed data for testing
   */
  seed(emails: EmailRecord[], optimizations: OptimizationRecord[]) {
    this.reset();
    emails.forEach((email) => {
      this.emails.set(email.email, email);
    });
    optimizations.forEach((opt) => {
      this.optimizations.set(opt.id, opt);
    });
  }

  /**
   * Get all emails
   */
  getAllEmails(): EmailRecord[] {
    return Array.from(this.emails.values());
  }

  /**
   * Get all optimizations
   */
  getAllOptimizations(): OptimizationRecord[] {
    return Array.from(this.optimizations.values());
  }

  /**
   * Find email by email address
   */
  findEmailByAddress(email: string): EmailRecord | undefined {
    return this.emails.get(email);
  }

  /**
   * Count optimizations for an email since a specific date
   */
  countOptimizationsSince(email: string, since: Date): number {
    return Array.from(this.optimizations.values()).filter(
      (opt) => opt.email === email && opt.createdAt >= since,
    ).length;
  }

  /**
   * Add an email record
   */
  addEmail(data: Omit<EmailRecord, "id" | "createdAt">): EmailRecord {
    const id = `mock-email-${this.emailIdCounter++}`;
    const record: EmailRecord = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.emails.set(data.email, record);
    return record;
  }

  /**
   * Add an optimization record
   */
  addOptimization(
    data: Omit<OptimizationRecord, "id" | "createdAt">,
  ): OptimizationRecord {
    const id = `mock-opt-${this.optimizationIdCounter++}`;
    const record: OptimizationRecord = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.optimizations.set(id, record);
    return record;
  }
}

// Shared instance
const runtimeDb = new RuntimeDatabase();

/**
 * Helper to extract conditions from drizzle-orm where clauses
 */
function extractConditions(condition: unknown): Array<{
  type: "eq" | "gte" | "and";
  column?: string;
  value?: unknown;
  conditions?: unknown[];
}> {
  if (!condition || typeof condition !== "object") {
    return [];
  }

  const result: Array<{
    type: "eq" | "gte" | "and";
    column?: string;
    value?: unknown;
    conditions?: unknown[];
  }> = [];

  // Check if it's an 'and' condition
  if ("op" in condition && condition.op === "and") {
    result.push({
      type: "and",
      conditions: (condition as { conditions?: unknown[] }).conditions || [],
    });
    return result;
  }

  // Check if it's an 'eq' condition
  if ("op" in condition && condition.op === "eq") {
    const cond = condition as {
      left?: { name?: string; column?: { name?: string } };
      right?: { value?: unknown };
    };
    const columnName =
      cond.left?.name ||
      cond.left?.column?.name ||
      (cond.left as { name?: string })?.name;
    result.push({
      type: "eq",
      column: columnName,
      value: cond.right?.value || (cond.right as { value?: unknown })?.value,
    });
  }

  // Check if it's a 'gte' condition
  if ("op" in condition && condition.op === "gte") {
    const cond = condition as {
      left?: { name?: string; column?: { name?: string } };
      right?: { value?: unknown };
    };
    const columnName =
      cond.left?.name ||
      cond.left?.column?.name ||
      (cond.left as { name?: string })?.name;
    result.push({
      type: "gte",
      column: columnName,
      value: cond.right?.value || (cond.right as { value?: unknown })?.value,
    });
  }

  return result;
}

/**
 * Applies drizzle conditions to filter records
 */
function applyConditions<T extends { email?: string; createdAt?: Date }>(
  records: T[],
  condition: unknown,
): T[] {
  let result = [...records];
  const conditions = extractConditions(condition);

  for (const cond of conditions) {
    if (cond.type === "and" && cond.conditions) {
      // Recursively apply all conditions in the 'and' clause
      for (const subCond of cond.conditions) {
        result = applyConditions(result, subCond);
      }
    } else if (cond.type === "eq" && cond.column === "email") {
      result = result.filter((r) => r.email === cond.value);
    } else if (
      cond.type === "gte" &&
      (cond.column === "created_at" || cond.column === "createdAt") &&
      cond.value instanceof Date
    ) {
      result = result.filter(
        (r) => r.createdAt && r.createdAt >= (cond.value as Date),
      );
    }
  }

  return result;
}

/**
 * Creates a mock Drizzle DB instance that behaves like a real database
 */
export function createMockDb() {
  return {
    select: (columns?: unknown) => {
      return {
        from: (table: unknown) => {
          const tableName = String(
            (table as { _?: { name?: string }; name?: string })?._?.name ||
              (table as { name?: string })?.name ||
              "",
          );

          // Helper to get the result based on table and conditions
          const getResult = (
            condition?: unknown,
          ):
            | Array<{ count: number }>
            | OptimizationRecord[]
            | EmailRecord[] => {
            // Handle optimizations table queries
            if (tableName.includes("optimizations")) {
              let result = runtimeDb.getAllOptimizations();

              // Apply where conditions
              if (condition) {
                result = applyConditions(result, condition);
              }

              // Check if we're counting (sql`count(*)` pattern)
              const isCount =
                columns &&
                typeof columns === "object" &&
                ("count" in columns ||
                  (columns as { count?: unknown })?.count !== undefined);

              if (isCount) {
                return [{ count: result.length }];
              }

              return result;
            }

            // Handle emails table queries
            if (tableName.includes("emails")) {
              let result = runtimeDb.getAllEmails();

              // Apply where conditions if any
              if (condition) {
                result = applyConditions(result, condition);
              }

              // Check if we're counting
              const isCount =
                columns &&
                typeof columns === "object" &&
                ("count" in columns ||
                  (columns as { count?: unknown })?.count !== undefined);

              if (isCount) {
                return [{ count: result.length }];
              }

              return result;
            }

            return [];
          };

          // Create a thenable object that can be awaited directly (for queries without .where())
          const result = getResult();
          const thenable = Promise.resolve(result) as Promise<
            Array<{ count: number }> | OptimizationRecord[] | EmailRecord[]
          > & {
            where: (
              condition: unknown,
            ) => Promise<
              Array<{ count: number }> | OptimizationRecord[] | EmailRecord[]
            >;
          };

          // Add the where method for queries with conditions
          thenable.where = async (condition: unknown) => {
            return getResult(condition);
          };

          return thenable;
        },
      };
    },

    insert: (table: unknown) => {
      const tableName = String(
        (table as { _?: { name?: string }; name?: string })?._?.name ||
          (table as { name?: string })?.name ||
          "",
      );

      const isEmailsTable =
        tableName === "emails" || tableName.includes("emails");

      return {
        values: (values: unknown) => {
          if (isEmailsTable) {
            const emailData = values as { email: string; name: string };
            // Check if email already exists (simulate unique constraint)
            if (runtimeDb.findEmailByAddress(emailData.email)) {
              const error = new Error(
                "duplicate key value violates unique constraint",
              );
              Object.assign(error, {
                code: "23505",
                constraint: "emails_email_unique",
              });
              throw error;
            }
            const record = runtimeDb.addEmail(emailData);
            return {
              returning: async () => Promise.resolve([record]),
            };
          } else {
            // Optimizations table - return a thenable that resolves to the record
            const optData = values as {
              email: string;
              listingUrl?: string;
            };
            const record = runtimeDb.addOptimization({
              email: optData.email,
              listingUrl: optData.listingUrl || null,
            });
            return Promise.resolve(record) as unknown as OptimizationRecord & {
              returning?: () => Promise<OptimizationRecord[]>;
            };
          }
        },
      };
    },
  };
}

/**
 * Get the runtime database instance for direct access (useful for tests)
 */
export function getRuntimeDb() {
  return runtimeDb;
}
