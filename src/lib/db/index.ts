import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createMockDb } from "./mock-db";
import * as schema from "./schema";

// Check if we're in test mode or if DATABASE_URL is not set
const isTestMode =
  process.env.NODE_ENV === "test" ||
  process.env.VITEST === "true" ||
  process.env.PLAYWRIGHT_TEST === "true" ||
  process.env.CI === "true" ||
  !process.env.DATABASE_URL;

let dbInstance: ReturnType<typeof drizzle> | ReturnType<typeof createMockDb>;

if (isTestMode) {
  // Use mock database in test mode
  dbInstance = createMockDb();
} else {
  // Use real database in production/development
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const connectionString = process.env.DATABASE_URL;
  const client = postgres(connectionString);
  dbInstance = drizzle(client, { schema });
}

// Export with proper type assertion to satisfy TypeScript
export const db = dbInstance as ReturnType<typeof drizzle>;
