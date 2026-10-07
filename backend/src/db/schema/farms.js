import {
  pgSchema,
  serial,
  integer,
  bigint,
  varchar,
  text,
  json,
  jsonb,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { pincodes } from "./location.js";

export const farmsSchema = pgSchema("farms_schema");

export const farms = farmsSchema.table("farms", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  farmName: varchar("farm_name", { length: 100 }).notNull(),
  fieldId: bigint("field_id", { mode: "number" }).notNull(), // Farmonaut field id
  pincodeId: integer("pincode_id")
    .notNull()
    .references(() => pincodes.pincodeId, { onDelete: "cascade" }),
  farmCoordinates: json("farm_coordinates").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
},
(t) => [
    index("idx_farms_user_id").on(t.userId),
    index("idx_farms_pincode_id").on(t.pincodeId),
    index("idx_farms_field_id").on(t.fieldId),
]);

export const cropCategories = farmsSchema.table("crop_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryName: varchar("category_name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cropStages = farmsSchema.table("crop_stages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  stageName: varchar("stage_name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// NOTE: the documented DDL also declares fk_crops_farm (farm_id) but the table
// has no farm_id column, so that dangling constraint is intentionally omitted.
export const crops = farmsSchema.table("crops", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => cropCategories.id, { onDelete: "cascade" }),
  cropName: varchar("crop_name", { length: 100 }).notNull(),
  cropStageId: jsonb("crop_stage_id"),
  tBase: integer("t_base").notNull(), // base temperature (Tbase) for GDD
  createdAt: timestamp("created_at").defaultNow(),
},
(t) => [
    index("idx_crops_category_id").on(t.categoryId),
]);

export const farmCrops = farmsSchema.table("farm_crops", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  farmId: integer("farm_id")
    .notNull()
    .references(() => farms.id, { onDelete: "cascade" }),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id, { onDelete: "cascade" }),
  currentStage: jsonb("current_stage"),
  sowingDate: date("sowing_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
},
(t) => [
    index("idx_farm_crops_farm_id").on(t.farmId),
    index("idx_farm_crops_crop_id").on(t.cropId),
]);
