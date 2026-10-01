import {
  pgSchema,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  uuid,
  inet,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const websiteSchema = pgSchema("website_schema");

export const connections = websiteSchema.table("connections", {
  connectionId: integer("connection_id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 150 }),
  mobile: varchar("mobile", { length: 15 }),
  query: text("query"),
  status: varchar("status", { length: 50 }), // read | unread
  source: varchar("source", { length: 100 }),
  ipAddress: inet("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// website_schema.admin — website CMS admin (UUID primary key supplied by the app)
export const websiteAdmin = websiteSchema.table("admin", {
  adminId: uuid("admin_id").primaryKey(),
  adminName: varchar("admin_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const jobs = websiteSchema.table("jobs", {
  jobId: integer("job_id").primaryKey().generatedAlwaysAsIdentity(),
  jobTitle: varchar("job_title", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  salaryRange: varchar("salary_range", { length: 100 }),
  jobType: varchar("job_type", { length: 100 }), // Internship / Full-time / Part-time
  jobDescription: text("job_description"),
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const blogs = websiteSchema.table(
  "blogs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    tags: text("tags").array().default(sql`'{}'`),
    images: text("images").array().default(sql`'{}'`),
    video: text("video"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    wordCount: integer("word_count").default(0),
    charCount: integer("char_count").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [check("blogs_status_check", sql`${t.status} IN ('draft', 'published')`)],
);

export const teamMembers = websiteSchema.table("team_members", {
  empId: varchar("emp_id", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  position: varchar("position", { length: 150 }).notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  thoughts: text("thoughts"),
  subThoughts: text("sub_thoughts"),
  isReversedLayout: boolean("is_reversed_layout").default(false),
});
