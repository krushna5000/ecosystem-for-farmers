import { pgTable, serial, varchar, text } from "drizzle-orm/pg-core";

// public.super_admins — platform super administrator accounts
export const superAdmins = pgTable("super_admins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull(),
});
