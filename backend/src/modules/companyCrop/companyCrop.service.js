// Crop catalogue for the company portal. Never touches req/res or db directly.
import { countCropsInDB, listCropsInDB } from "./companyCrop.factory.js";
import { getPaginationMeta, pageOffset } from "../../utils/companyPagination.js";

export async function listCrops({ page, limit }) {
  const totalItems = await countCropsInDB();
  const rows = await listCropsInDB({ limit, offset: pageOffset(page, limit) });
  return { rows, pagination: getPaginationMeta({ page, limit, totalItems }) };
}
