// Drizzle tables of the location hierarchy (state > district > city > village > pincode) — re-exported
// from the canonical db/schema. Shared with other modules; the tables are never redefined here.
export { states, districts, cities, villages, pincodes } from "../../db/schema/index.js";
