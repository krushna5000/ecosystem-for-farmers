import {
  pgSchema,
  integer,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const vendorSchema = pgSchema("vendor_schema");

export const vendors = vendorSchema.table("vendors", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  password: varchar("password", { length: 100 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  shopActNo: varchar("shop_act_no", { length: 50 }),
  shopActPdf: text("shop_act_pdf"),
  gstNo: varchar("gst_no", { length: 50 }),
  gstPdf: text("gst_pdf"),
  licenceNo: varchar("licence_no", { length: 50 }),
  licencePdf: text("licence_pdf"),
  panNo: varchar("pan_no", { length: 20 }),
  panPdf: text("pan_pdf"),
  isActive: boolean("is_active").default(true),
  isApprove: boolean("is_approve").default(false),
  isDelete: boolean("is_delete").default(false),
  verifyToken: text("verify_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    uniqueIndex("uq_vd_vendors_email_active").on(t.email).where(sql`${t.isDelete} IS NOT TRUE`),
    uniqueIndex("uq_vd_vendors_phone_active").on(t.phone).where(sql`${t.isDelete} IS NOT TRUE`),
    index("idx_vd_vendors_verify_token").on(t.verifyToken).where(sql`${t.verifyToken} IS NOT NULL`),
]);

export const vendorOtp = vendorSchema.table("vendor_otp", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 150 }),
  otp: varchar("otp", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
},
(t) => [
    index("idx_vd_vendor_otp_vendor_id").on(t.vendorId),
    index("idx_vd_vendor_otp_email").on(t.email),
]);

export const vendorOtpVerification = vendorSchema.table("vendor_otp_verification", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  otp: varchar("otp", { length: 10 }),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
},
(t) => [
    index("idx_vd_vendor_otp_verification_vendor_id").on(t.vendorId),
]);

export const vendorBrands = vendorSchema.table("brands", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  logo: text("logo"),
  brandName: varchar("brand_name", { length: 150 }).notNull(),
  status: boolean("status").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_vd_brands_vendor_id").on(t.vendorId),
]);

export const vendorCategories = vendorSchema.table("categories", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  brandId: integer("brand_id")
    .notNull()
    .references(() => vendorBrands.id, { onDelete: "cascade" }),
  categoryName: varchar("category_name", { length: 150 }).notNull(),
  status: boolean("status").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_vd_categories_vendor_id").on(t.vendorId),
    index("idx_vd_categories_brand_id").on(t.brandId),
]);

export const vendorSubCategories = vendorSchema.table("sub_categories", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  brandId: integer("brand_id")
    .notNull()
    .references(() => vendorBrands.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => vendorCategories.id, { onDelete: "cascade" }),
  subCategoryName: varchar("sub_category_name", { length: 150 }).notNull(),
  status: boolean("status").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_vd_sub_categories_vendor_id").on(t.vendorId),
    index("idx_vd_sub_categories_brand_id").on(t.brandId),
    index("idx_vd_sub_categories_category_id").on(t.categoryId),
]);

export const vendorProducts = vendorSchema.table("products", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  brandId: integer("brand_id")
    .notNull()
    .references(() => vendorBrands.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => vendorCategories.id, { onDelete: "cascade" }),
  subCategoryId: integer("sub_category_id")
    .notNull()
    .references(() => vendorSubCategories.id, { onDelete: "cascade" }),
  productName: varchar("product_name", { length: 200 }).notNull(),
  description: text("description"),
  chemicalComposition: jsonb("chemical_composition").notNull(),
  image: text("image"),
  status: boolean("status").default(true),
  cropIds: integer("crop_ids").array().default(sql`'{}'`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_vd_products_vendor_id").on(t.vendorId),
    index("idx_vd_products_brand_id").on(t.brandId),
    index("idx_vd_products_category_id").on(t.categoryId),
    index("idx_vd_products_sub_category_id").on(t.subCategoryId),
    index("idx_vd_products_crop_ids_gin").using("gin", t.cropIds),
]);

export const vendorInventory = vendorSchema.table("inventory", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => vendorProducts.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(0),
  stockStatus: varchar("stock_status", { length: 50 }).default("IN_STOCK"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_vd_inventory_vendor_id").on(t.vendorId),
    index("idx_vd_inventory_product_id").on(t.productId),
    check("vd_inventory_quantity_check", sql`${t.quantity} >= 0`),
    check("vd_inventory_stock_status_check", sql`${t.stockStatus} IN ('IN_STOCK', 'OUT_OF_STOCK')`),
]);

export const vendorServiceLocations = vendorSchema.table("service_locations", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  state: varchar("state", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  isServiceable: boolean("is_serviceable").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_vd_service_locations_vendor_id").on(t.vendorId),
]);
