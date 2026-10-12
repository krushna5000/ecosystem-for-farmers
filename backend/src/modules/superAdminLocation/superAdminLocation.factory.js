// Pure DB I/O for the location hierarchy (state > district > city > village > pincode).
// No business rules, no HTTP types. Generic helpers take an entity key ("state" | "district" | "city" |
// "village" | "pincode"); lookups whose semantics differ per level are explicit functions.
//
// Single-row functions resolve to the row or `undefined` — the legacy responses omit the key when
// nothing matched (e.g. updating an unknown id answers just `{ success: true }`), and the controller
// relies on that.
import { eq, ne, and, asc, count, inArray, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { states, districts, cities, villages, pincodes } from "./superAdminLocation.schema.js";

const exec = (tx) => tx ?? db;

const ENTITIES = {
  state: { table: states, idCol: states.stateId },
  district: { table: districts, idCol: districts.districtId },
  city: { table: cities, idCol: cities.cityId },
  village: { table: villages, idCol: villages.villageId },
  pincode: { table: pincodes, idCol: pincodes.pincodeId },
};

const lowerEq = (col, value) => sql`lower(${col}) = lower(${value})`;

const firstRow = async (query) => {
  const [row] = await query;
  return row;
};

/* ---------------------------------------------------------------------------------------------- */
/* Generic CRUD                                                                                    */
/* ---------------------------------------------------------------------------------------------- */

/** One page ordered by id, plus the total row count. */
export async function listLocationsInDB(entity, { limit, offset }, tx) {
  const { table, idCol } = ENTITIES[entity];
  const rows = await exec(tx).select().from(table).orderBy(asc(idCol)).limit(limit).offset(offset);
  const [{ total }] = await exec(tx).select({ total: count() }).from(table);
  return { rows, total };
}

export function getLocationByIdInDB(entity, id, tx) {
  const { table, idCol } = ENTITIES[entity];
  return firstRow(exec(tx).select().from(table).where(eq(idCol, id)));
}

export function createLocationInDB(entity, values, tx) {
  const { table } = ENTITIES[entity];
  return firstRow(exec(tx).insert(table).values(values).returning());
}

export function updateLocationInDB(entity, id, changes, tx) {
  const { table, idCol } = ENTITIES[entity];
  return firstRow(exec(tx).update(table).set(changes).where(eq(idCol, id)).returning());
}

export function deleteLocationInDB(entity, id, tx) {
  const { table, idCol } = ENTITIES[entity];
  return firstRow(exec(tx).delete(table).where(eq(idCol, id)).returning());
}

/** DELETE ... WHERE id IN (ids) RETURNING id — resolves to the ids that were deleted. */
export async function bulkDeleteLocationsInDB(entity, ids, tx) {
  const { table, idCol } = ENTITIES[entity];
  const rows = await exec(tx).delete(table).where(inArray(idCol, ids)).returning({ id: idCol });
  return rows.map((row) => row.id);
}

/* ---------------------------------------------------------------------------------------------- */
/* Duplicate lookups (rules differ per level: case-insensitive or not, scoped to the parent or not) */
/* ---------------------------------------------------------------------------------------------- */

// STATES — global, case-insensitive
export function findStateByNameInDB(stateName, tx) {
  return firstRow(exec(tx).select().from(states).where(lowerEq(states.stateName, stateName)));
}

export function findStateByNameExcludingIdInDB(stateName, excludeId, tx) {
  return firstRow(
    exec(tx)
      .select()
      .from(states)
      .where(and(lowerEq(states.stateName, stateName), ne(states.stateId, excludeId))),
  );
}

// DISTRICTS — create: global, case-insensitive; update: same state, case-sensitive
export function findDistrictByNameInDB(districtName, tx) {
  return firstRow(exec(tx).select().from(districts).where(lowerEq(districts.districtName, districtName)));
}

export function findDistrictByNameExcludingIdInDB(districtName, stateId, excludeId, tx) {
  return firstRow(
    exec(tx)
      .select()
      .from(districts)
      .where(
        and(
          eq(districts.districtName, districtName),
          eq(districts.stateId, stateId),
          ne(districts.districtId, excludeId),
        ),
      ),
  );
}

// CITIES — within one district, case-insensitive
export function findCityByNameInDB(cityName, districtId, tx) {
  return firstRow(
    exec(tx)
      .select()
      .from(cities)
      .where(and(lowerEq(cities.cityName, cityName), eq(cities.districtId, districtId))),
  );
}

export function findCityByNameExcludingIdInDB(cityName, districtId, excludeId, tx) {
  return firstRow(
    exec(tx)
      .select()
      .from(cities)
      .where(
        and(
          lowerEq(cities.cityName, cityName),
          eq(cities.districtId, districtId),
          ne(cities.cityId, excludeId),
        ),
      ),
  );
}

// VILLAGES — within one city, case-insensitive
export function findVillageByNameInDB(villageName, cityId, tx) {
  return firstRow(
    exec(tx)
      .select()
      .from(villages)
      .where(and(lowerEq(villages.villageName, villageName), eq(villages.cityId, cityId))),
  );
}

export function findVillageByNameExcludingIdInDB(villageName, cityId, excludeId, tx) {
  return firstRow(
    exec(tx)
      .select()
      .from(villages)
      .where(
        and(
          lowerEq(villages.villageName, villageName),
          eq(villages.cityId, cityId),
          ne(villages.villageId, excludeId),
        ),
      ),
  );
}

// PINCODES — within one village, exact match
export function findPincodeByValueInDB(pincode, villageId, tx) {
  return firstRow(
    exec(tx)
      .select()
      .from(pincodes)
      .where(and(eq(pincodes.pincode, pincode), eq(pincodes.villageId, villageId))),
  );
}

export function findPincodeByValueExcludingIdInDB(pincode, villageId, excludeId, tx) {
  return firstRow(
    exec(tx)
      .select()
      .from(pincodes)
      .where(
        and(
          eq(pincodes.pincode, pincode),
          eq(pincodes.villageId, villageId),
          ne(pincodes.pincodeId, excludeId),
        ),
      ),
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Toggle support (run inside the service's transaction, so `tx` is always passed)                  */
/* ---------------------------------------------------------------------------------------------- */

/** Locks the row (SELECT ... FOR UPDATE) and resolves to `{ isActive }`, or `undefined` if missing. */
export function lockLocationActiveInDB(entity, id, tx) {
  const { table, idCol } = ENTITIES[entity];
  return firstRow(exec(tx).select({ isActive: table.isActive }).from(table).where(eq(idCol, id)).for("update"));
}

/**
 * Ancestors (active flag + name) of a city / village / pincode, for parent validation.
 * Districts have no ancestors → null.
 */
export async function getLocationAncestorsInDB(entity, id, tx) {
  const q = exec(tx);
  switch (entity) {
    case "pincode":
      return firstRow(
        q
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
          .where(eq(pincodes.pincodeId, id)),
      );
    case "village":
      return firstRow(
        q
          .select({
            district_active: districts.isActive,
            district_name: districts.districtName,
            city_active: cities.isActive,
            city_name: cities.cityName,
          })
          .from(villages)
          .innerJoin(cities, eq(villages.cityId, cities.cityId))
          .innerJoin(districts, eq(cities.districtId, districts.districtId))
          .where(eq(villages.villageId, id)),
      );
    case "city":
      return firstRow(
        q
          .select({
            district_active: districts.isActive,
            district_name: districts.districtName,
          })
          .from(cities)
          .innerJoin(districts, eq(cities.districtId, districts.districtId))
          .where(eq(cities.cityId, id)),
      );
    default:
      return null;
  }
}

const off = { isActive: false };

/** Disables every descendant of a district / city / village (a pincode has none). */
export async function disableLocationDescendantsInDB(entity, id, tx) {
  const q = exec(tx);
  switch (entity) {
    case "district": {
      const cityIds = q.select({ id: cities.cityId }).from(cities).where(eq(cities.districtId, id));
      const villageIds = q
        .select({ id: villages.villageId })
        .from(villages)
        .where(inArray(villages.cityId, cityIds));

      await q.update(pincodes).set(off).where(inArray(pincodes.villageId, villageIds));
      await q.update(villages).set(off).where(inArray(villages.cityId, cityIds));
      await q.update(cities).set(off).where(eq(cities.districtId, id));
      break;
    }

    case "city": {
      const villageIds = q
        .select({ id: villages.villageId })
        .from(villages)
        .where(eq(villages.cityId, id));

      await q.update(pincodes).set(off).where(inArray(pincodes.villageId, villageIds));
      await q.update(villages).set(off).where(eq(villages.cityId, id));
      break;
    }

    case "village":
      await q.update(pincodes).set(off).where(eq(pincodes.villageId, id));
      break;
  }
}

/* ---------------------------------------------------------------------------------------------- */
/* Hierarchy                                                                                        */
/* ---------------------------------------------------------------------------------------------- */

/** Flat state > district > city > village > pincode join (LEFT JOINs), ordered by every id. */
export function listLocationHierarchyRowsInDB(tx) {
  return exec(tx)
    .select({
      state_id: states.stateId,
      state_name: states.stateName,
      district_id: districts.districtId,
      district_name: districts.districtName,
      city_id: cities.cityId,
      city_name: cities.cityName,
      village_id: villages.villageId,
      village_name: villages.villageName,
      pincode_id: pincodes.pincodeId,
      pincode: pincodes.pincode,
    })
    .from(states)
    .leftJoin(districts, eq(districts.stateId, states.stateId))
    .leftJoin(cities, eq(cities.districtId, districts.districtId))
    .leftJoin(villages, eq(villages.cityId, cities.cityId))
    .leftJoin(pincodes, eq(pincodes.villageId, villages.villageId))
    .orderBy(
      asc(states.stateId),
      asc(districts.districtId),
      asc(cities.cityId),
      asc(villages.villageId),
      asc(pincodes.pincodeId),
    );
}
