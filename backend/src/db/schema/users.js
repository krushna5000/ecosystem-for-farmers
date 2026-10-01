import {
  pgSchema,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  numeric,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { states, districts } from "./location.js";

export const userSchema = pgSchema("user_schema");

export const users = userSchema.table("users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  language: varchar("language", { length: 20 }).default("English"),
  userType: varchar("user_type", { length: 10 }).default("app"), // app | webapp
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const otpVerifications = userSchema.table("otp_verifications", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  otpCode: varchar("otp_code", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
});

export const plans = userSchema.table("plans", {
  id: serial("id").primaryKey(),
  planName: varchar("plan_name", { length: 50 }).notNull(),
  planPrice: numeric("plan_price", { precision: 10, scale: 2 }).notNull(),
  planDescription: text("plan_description"),
  durationDays: integer("duration_days").notNull(),
  maxFields: integer("max_fields"),
  maxAreaPerField: integer("max_area_per_field"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = userSchema.table(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: integer("plan_id")
      .notNull()
      .references(() => plans.id),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    check(
      "subscriptions_status_check",
      sql`${t.status} IN ('active', 'expired', 'cancelled', 'pending')`,
    ),
  ],
);

export const payments = userSchema.table(
  "payments",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    planId: integer("plan_id")
      .notNull()
      .references(() => plans.id),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    transactionId: varchar("transaction_id", { length: 100 }).notNull().unique(),
    paymentStatus: varchar("payment_status", { length: 20 }).notNull(),
    paidAt: timestamp("paid_at").defaultNow(),
  },
  (t) => [
    check(
      "payments_payment_status_check",
      sql`${t.paymentStatus} IN ('initiated', 'success', 'failed')`,
    ),
  ],
);

export const yieldBatches = userSchema.table(
  "yield_batches",
  {
    id: serial("id").primaryKey(),
    batchNo: varchar("batch_no", { length: 50 }).notNull().unique(),
    minYield: numeric("min_yield", { precision: 10, scale: 2 }),
    maxYield: numeric("max_yield", { precision: 10, scale: 2 }),
    rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
    validityDays: integer("validity_days").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    check("yield_batches_status_check", sql`${t.status} IN ('sold', 'unsold')`),
  ],
);

export const kyc = userSchema.table(
  "kyc",
  {
    kycId: serial("kyc_id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    aadhaarNo: varchar("aadhaar_no", { length: 12 }).notNull().unique(),
    registeredPhoneNo: varchar("registered_phone_no", { length: 20 }).notNull(),
    kycStatus: varchar("kyc_status", { length: 20 }).default("pending"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("idx_kyc_user").on(t.userId),
    check(
      "kyc_kyc_status_check",
      sql`${t.kycStatus} IN ('pending', 'approved', 'rejected')`,
    ),
  ],
);

export const onboardingData = userSchema.table(
  "onboarding_data",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userName: varchar("user_name", { length: 255 }),
    stateId: integer("state_id").references(() => states.stateId),
    districtId: integer("district_id").references(() => districts.districtId),
    villageId: integer("village_id"), // no FK in the documented DDL
    villageName: varchar("village_name", { length: 255 }),
    landSizeHectares: numeric("land_size_hectares", { precision: 10, scale: 2 }),
    currentCropName: varchar("current_crop_name", { length: 255 }),
    sowingDate: varchar("sowing_date", { length: 50 }),
    cropStage: varchar("crop_stage", { length: 100 }),
    cropStageImageUrl: varchar("crop_stage_image_url", { length: 500 }),
    isCompleted: boolean("is_completed").default(false),
    language: varchar("language", { length: 5 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("idx_onboarding_user_id").on(t.userId),
    index("idx_onboarding_state_id").on(t.stateId),
    index("idx_onboarding_district_id").on(t.districtId),
    index("idx_onboarding_village_id").on(t.villageId),
    index("idx_onboarding_is_completed").on(t.isCompleted),
    index("idx_onboarding_created_at").on(t.createdAt),
  ],
);
