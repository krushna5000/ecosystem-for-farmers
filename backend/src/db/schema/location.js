import {
  pgSchema,
  integer,
  varchar,
  boolean,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const locationSchema = pgSchema("location_schema");

export const states = locationSchema.table("states", {
  stateId: integer("state_id").primaryKey().generatedAlwaysAsIdentity(),
  stateName: varchar("state_name", { length: 100 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const districts = locationSchema.table(
  "districts",
  {
    districtId: integer("district_id").primaryKey().generatedAlwaysAsIdentity(),
    districtName: varchar("district_name", { length: 100 }).notNull(),
    stateId: integer("state_id")
      .notNull()
      .references(() => states.stateId, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [unique("unique_district_per_state").on(t.districtName, t.stateId)],
);

export const cities = locationSchema.table(
  "cities",
  {
    cityId: integer("city_id").primaryKey().generatedAlwaysAsIdentity(),
    cityName: varchar("city_name", { length: 100 }).notNull(),
    districtId: integer("district_id")
      .notNull()
      .references(() => districts.districtId, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [unique("unique_city_per_district").on(t.cityName, t.districtId)],
);

export const villages = locationSchema.table(
  "villages",
  {
    villageId: integer("village_id").primaryKey().generatedAlwaysAsIdentity(),
    villageName: varchar("village_name", { length: 150 }).notNull(),
    cityId: integer("city_id")
      .notNull()
      .references(() => cities.cityId, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [unique("unique_village_per_city").on(t.villageName, t.cityId)],
);

export const pincodes = locationSchema.table(
  "pincodes",
  {
    pincodeId: integer("pincode_id").primaryKey().generatedAlwaysAsIdentity(),
    pincode: varchar("pincode", { length: 6 }).notNull(),
    villageId: integer("village_id")
      .notNull()
      .references(() => villages.villageId, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [unique("unique_pincode_per_village").on(t.pincode, t.villageId)],
);
