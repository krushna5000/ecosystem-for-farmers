import { pgSchema, serial, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const adminsSchema = pgSchema("admins_schema");

// admins_schema.admins — platform administrators
export const admins = adminsSchema.table("admins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});
