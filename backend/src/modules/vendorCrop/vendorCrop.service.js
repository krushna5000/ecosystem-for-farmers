// Read-only crop catalogue for vendors (used to tag products with the crops they serve).
import { listCropsInDB } from "./vendorCrop.factory.js";

export function listCrops() {
  return listCropsInDB();
}
