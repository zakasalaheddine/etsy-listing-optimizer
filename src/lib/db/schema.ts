import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const emails = pgTable(
  "emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: unique().on(table.email),
  }),
);

export const optimizations = pgTable(
  "optimizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    listingUrl: text("listing_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("optimizations_email_idx").on(table.email),
    createdAtIdx: index("optimizations_created_at_idx").on(table.createdAt),
  }),
);
