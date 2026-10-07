import {
  pgSchema,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  jsonb,
  check,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";

export const companySchema = pgSchema("company_schema");

export const companyTypes = companySchema.table("company_types", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 100 }).notNull().unique(),
  description: text("description"),
});

export const companies = companySchema.table("companies", {
  id: serial("id").primaryKey(),
  // Documented as NOT NULL with ON DELETE SET NULL (contradictory); kept literal.
  companyType: integer("company_type")
    .notNull()
    .references(() => companyTypes.id, { onDelete: "set null" }),
  llpNo: varchar("llp_no", { length: 100 }),
  cinNo: varchar("cin_no", { length: 100 }),
  name: varchar("name", { length: 200 }).notNull(),
  address: text("address").notNull(),
  gstNo: varchar("gst_no", { length: 50 }).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  // Doc DDL says NOT NULL, but the column table says NULLABLE and the admin flow
  // creates companies without a password (set later via the reset-password link).
  password: varchar("password", { length: 255 }),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false),
  isDelete: boolean("is_delete").notNull().default(false),
  verifyToken: text("verify_token"),
  // NOT IN DOC: written/read by the admin portal code (company logo upload).
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_co_companies_company_type").on(t.companyType),
    uniqueIndex("uq_co_companies_gst_no_active").on(t.gstNo).where(sql`${t.isDelete} IS NOT TRUE`),
    uniqueIndex("uq_co_companies_email_active").on(t.email).where(sql`${t.isDelete} IS NOT TRUE`),
    uniqueIndex("uq_co_companies_phone_active").on(t.phone).where(sql`${t.isDelete} IS NOT TRUE`),
    index("idx_co_companies_verify_token").on(t.verifyToken).where(sql`${t.verifyToken} IS NOT NULL`),
]);

export const companyOtp = companySchema.table("company_otp", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  phone: varchar("phone", { length: 20 }).notNull(),
  otpCode: varchar("otp_code", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
},
(t) => [
    index("idx_co_company_otp_company_id").on(t.companyId),
]);

export const companyOtpVerification = companySchema.table("company_otp_verification", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  otpCode: varchar("otp_code", { length: 10 }),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  attempts: integer("attempts").default(0),
  blockedUntil: timestamp("blocked_until"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
},
(t) => [
    index("idx_co_company_otp_verification_company_id").on(t.companyId),
]);

export const companyBrands = companySchema.table("brands", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  logo: text("logo"),
  brandName: varchar("brand_name", { length: 150 }).notNull(),
  status: boolean("status").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    uniqueIndex("uq_co_brands_company_brand_name").on(t.companyId, t.brandName),
]);

export const companyCategories = companySchema.table("categories", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  brandId: integer("brand_id")
    .notNull()
    .references(() => companyBrands.id, { onDelete: "cascade" }),
  categoryName: varchar("category_name", { length: 150 }).notNull(),
  status: boolean("status").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_co_categories_company_id").on(t.companyId),
    index("idx_co_categories_brand_id").on(t.brandId),
]);

export const companySubCategories = companySchema.table("sub_categories", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  brandId: integer("brand_id")
    .notNull()
    .references(() => companyBrands.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => companyCategories.id, { onDelete: "cascade" }),
  subCategoryName: varchar("sub_category_name", { length: 150 }).notNull(),
  status: boolean("status").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_co_sub_categories_company_id").on(t.companyId),
    index("idx_co_sub_categories_brand_id").on(t.brandId),
    index("idx_co_sub_categories_category_id").on(t.categoryId),
]);

export const companyProducts = companySchema.table("products", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  brandId: integer("brand_id")
    .notNull()
    .references(() => companyBrands.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => companyCategories.id, { onDelete: "cascade" }),
  subCategoryId: integer("sub_category_id")
    .notNull()
    .references(() => companySubCategories.id, { onDelete: "cascade" }),
  productName: varchar("product_name", { length: 200 }).notNull(),
  description: text("description"),
  chemicalComposition: jsonb("chemical_composition").notNull(),
  image: text("image"),
  status: boolean("status").default(true),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .$onUpdate(() => new Date()),
  cropIds: integer("crop_ids").array().default(sql`'{}'`),
  diseaseNames: varchar("disease_names", { length: 255 }).array().default(sql`'{}'`),
},
(t) => [
    index("idx_co_products_company_id").on(t.companyId),
    index("idx_co_products_brand_id").on(t.brandId),
    index("idx_co_products_category_id").on(t.categoryId),
    index("idx_co_products_sub_category_id").on(t.subCategoryId),
    index("idx_co_products_crop_ids_gin").using("gin", t.cropIds),
    index("idx_co_products_disease_names_gin").using("gin", t.diseaseNames),
]);

export const companyInventory = companySchema.table("inventory", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => companyProducts.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(0),
  stockStatus: varchar("stock_status", { length: 50 }).default("IN_STOCK"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_co_inventory_company_id").on(t.companyId),
    index("idx_co_inventory_product_id").on(t.productId),
    check("co_inventory_quantity_check", sql`${t.quantity} >= 0`),
    check("co_inventory_stock_status_check", sql`${t.stockStatus} IN ('IN_STOCK', 'OUT_OF_STOCK')`),
]);

export const companyServiceLocations = companySchema.table("service_locations", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  state: varchar("state", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  isServiceable: boolean("is_serviceable").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_co_service_locations_company_id").on(t.companyId),
]);

// company_schema.company — company onboarding/approval profile (distinct from `companies`)
export const company = companySchema.table(
  "company",
  {
    id: serial("id").primaryKey(),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
    email: varchar("email", { length: 255 }).unique(),
    contactPersonName: varchar("contact_person_name", { length: 255 }),
    contactPersonPhone: varchar("contact_person_phone", { length: 20 }),
    panNumber: varchar("pan_number", { length: 20 }).unique(),
    businessAddress: text("business_address"),
    approvalStatus: varchar("approval_status", { length: 20 }).default("pending"),
    rejectionReason: text("rejection_reason"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    check(
      "company_approval_status_check",
      sql`${t.approvalStatus} IN ('pending', 'approved', 'rejected')`,
    ),
  ],
);

export const marketplaceListings = companySchema.table(
  "marketplace_listings",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cropName: varchar("crop_name", { length: 100 }).notNull(),
    variety: varchar("variety", { length: 100 }),
    minYield: numeric("min_yield", { precision: 10, scale: 2 }),
    maxYield: numeric("max_yield", { precision: 10, scale: 2 }),
    desiredRate: numeric("desired_rate", { precision: 10, scale: 2 }).notNull(),
    imageUrl: text("image_url"),
    status: varchar("status", { length: 20 }).default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("idx_co_marketplace_listings_user_id").on(t.userId),
    check(
      "marketplace_listings_status_check",
      sql`${t.status} IN ('pending', 'deal_done', 'cancelled')`,
    ),
  ],
);

// NOT IN DOC: queried/updated by the company portal lead management
// (Company/backend/controllers/leadController.js). Columns inferred from that code.
export const leads = companySchema.table("leads", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => companyProducts.id, {
    onDelete: "set null",
  }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  status: varchar("status", { length: 20 }).default("new"), // new | contacted | converted
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
},
(t) => [
    index("idx_co_leads_company_id_status").on(t.companyId, t.status),
    index("idx_co_leads_product_id").on(t.productId),
    check("co_leads_status_check", sql`${t.status} IN ('new', 'contacted', 'converted')`),
]);
