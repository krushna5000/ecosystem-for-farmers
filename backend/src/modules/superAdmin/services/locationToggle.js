import { eq, inArray } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { districts, cities, villages, pincodes } from "../../../db/schema/index.js";
import { snakeKeys } from "../../../lib/rowCase.js";

// Ancestors (active flag + name) of a city / village / pincode, for parent validation.
const getAncestors = async (tx, entityType, id) => {
  let rows;
  switch (entityType) {
    case "pincode":
      rows = await tx
        .select({
          district_active: districts.isActive,
          district_name: districts.districtName,
          city_active: cities.isActive,
          city_name: cities.cityName,
          village_active: villages.isActive,
          village_name: villages.villageName,
        })
        .from(pincodes)
        .innerJoin(villages, eq(pincodes.villageId, villages.villageId))
        .innerJoin(cities, eq(villages.cityId, cities.cityId))
        .innerJoin(districts, eq(cities.districtId, districts.districtId))
        .where(eq(pincodes.pincodeId, id));
      break;
    case "village":
      rows = await tx
        .select({
          district_active: districts.isActive,
          district_name: districts.districtName,
          city_active: cities.isActive,
          city_name: cities.cityName,
        })
        .from(villages)
        .innerJoin(cities, eq(villages.cityId, cities.cityId))
        .innerJoin(districts, eq(cities.districtId, districts.districtId))
        .where(eq(villages.villageId, id));
      break;
    case "city":
      rows = await tx
        .select({
          district_active: districts.isActive,
          district_name: districts.districtName,
        })
        .from(cities)
        .innerJoin(districts, eq(cities.districtId, districts.districtId))
        .where(eq(cities.cityId, id));
      break;
    default:
      return null;
  }
  return rows[0];
};

// Parent validation for enabling
const parentCheck = async (tx, entityType, id) => {
  const ancestors = await getAncestors(tx, entityType, id);
  if (!ancestors) return { valid: true }; // district has no parents

  switch (entityType) {
    case "city":
      return { valid: ancestors.district_active, ancestors };
    case "village":
      return { valid: ancestors.district_active && ancestors.city_active, ancestors };
    case "pincode":
      return {
        valid: ancestors.district_active && ancestors.city_active && ancestors.village_active,
        ancestors,
      };
    default:
      return { valid: true };
  }
};

const off = { isActive: false };

// Cascade disable children
const cascadeDisable = async (tx, entityType, id) => {
  switch (entityType) {
    case "district": {
      const cityIds = tx.select({ id: cities.cityId }).from(cities).where(eq(cities.districtId, id));
      const villageIds = tx
        .select({ id: villages.villageId })
        .from(villages)
        .where(inArray(villages.cityId, cityIds));

      await tx.update(pincodes).set(off).where(inArray(pincodes.villageId, villageIds));
      await tx.update(villages).set(off).where(inArray(villages.cityId, cityIds));
      await tx.update(cities).set(off).where(eq(cities.districtId, id));
      break;
    }

    case "city": {
      const villageIds = tx
        .select({ id: villages.villageId })
        .from(villages)
        .where(eq(villages.cityId, id));

      await tx.update(pincodes).set(off).where(inArray(pincodes.villageId, villageIds));
      await tx.update(villages).set(off).where(eq(villages.cityId, id));
      break;
    }

    case "village":
      await tx.update(pincodes).set(off).where(eq(pincodes.villageId, id));
      break;
  }
};

// Message builders for "cannot enable" (parent inactive)
const parentList = (a, parts, separator) =>
  parts.filter(([flag]) => !a[flag]).map(([, label, name]) => `${label} "${a[name]}"`).join(separator);

const LEVELS = {
  district: {
    table: districts,
    idCol: districts.districtId,
    notFound: "District not found",
    enableBlockedMessage: null,
  },
  city: {
    table: cities,
    idCol: cities.cityId,
    notFound: "City not found",
    enableBlockedMessage: (a) =>
      `Cannot enable city. Please enable the parent District "${a.district_name}" first.`,
  },
  village: {
    table: villages,
    idCol: villages.villageId,
    notFound: "Village not found",
    enableBlockedMessage: (a) =>
      `Cannot enable village. Please enable the parent ${parentList(
        a,
        [
          ["district_active", "District", "district_name"],
          ["city_active", "City", "city_name"],
        ],
        " and ",
      )} first.`,
  },
  pincode: {
    table: pincodes,
    idCol: pincodes.pincodeId,
    notFound: "Pincode not found",
    enableBlockedMessage: (a) =>
      `Cannot enable pincode. Please enable the parent ${parentList(
        a,
        [
          ["district_active", "District", "district_name"],
          ["city_active", "City", "city_name"],
          ["village_active", "Village", "village_name"],
        ],
        ", ",
      )} first.`,
  },
};

/**
 * Transactionally toggles is_active of a district/city/village/pincode.
 * Enabling requires every ancestor to be active; disabling cascades to descendants.
 * Returns { status: "ok", row } | { status: 404|400, message }.
 */
export const toggleActive = (entityType, id) => {
  const { table, idCol, notFound, enableBlockedMessage } = LEVELS[entityType];

  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({ isActive: table.isActive })
      .from(table)
      .where(eq(idCol, id))
      .for("update");

    if (!current) return { status: 404, message: notFound };

    const newState = !current.isActive;

    if (newState) {
      if (enableBlockedMessage) {
        const parent = await parentCheck(tx, entityType, id);
        if (!parent.valid) {
          return { status: 400, message: enableBlockedMessage(parent.ancestors) };
        }
      }
    } else {
      await cascadeDisable(tx, entityType, id);
    }

    const [row] = await tx.update(table).set({ isActive: newState }).where(eq(idCol, id)).returning();
    return { status: "ok", row: snakeKeys(row) };
  });
};
