import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";

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

