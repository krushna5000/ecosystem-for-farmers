// Business rules for company inventory. Throws AppError subclasses; never touches req/res or db directly.
import {
  findOwnedProductInDB,
  inventoryExistsForProductInDB,
  createCompanyInventoryInDB,
  findOwnedCompanyInventoryInDB,
  updateCompanyInventoryInDB,
  countCompanyInventoryInDB,
  listCompanyInventoryInDB,
  getCompanyInventoryByIdInDB,
  deleteCompanyInventoryInDB,
  deleteCompanyInventoriesInDB,
} from "./companyInventory.factory.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { getPaginationMeta, pageOffset } from "../../utils/companyPagination.js";

const stockStatusFor = (quantity) => (quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK");

// The portal has always answered a missing inventory row with a 400 (not a 404).
const itemNotFound = () => new BadRequestError("Inventory item not found");

export async function createCompanyInventory(companyId, { product_id, quantity }) {
  if (!(await findOwnedProductInDB(product_id, companyId))) {
    throw new BadRequestError("Product not found for this company");
  }

  if (await inventoryExistsForProductInDB(companyId, product_id)) {
    throw new BadRequestError("Inventory already exists for this product");
  }

  return createCompanyInventoryInDB({
    companyId,
    productId: product_id,
    quantity,
    stockStatus: stockStatusFor(quantity),
  });
}

export async function updateCompanyInventory(id, companyId, { quantity }) {
  if (!(await findOwnedCompanyInventoryInDB(id, companyId))) throw itemNotFound();

  return updateCompanyInventoryInDB(id, companyId, {
    quantity,
    stockStatus: stockStatusFor(quantity),
  });
}

export async function listCompanyInventory(companyId, { page, limit }) {
  const totalItems = await countCompanyInventoryInDB(companyId);
  const rows = await listCompanyInventoryInDB(companyId, { limit, offset: pageOffset(page, limit) });
  return { rows, pagination: getPaginationMeta({ page, limit, totalItems }) };
}

export async function getCompanyInventoryById(id, companyId) {
  const row = await getCompanyInventoryByIdInDB(id, companyId);
  if (!row) throw itemNotFound();
  return row;
}

export async function deleteCompanyInventory(id, companyId) {
  const deleted = await deleteCompanyInventoryInDB(id, companyId);
  if (!deleted) throw itemNotFound();
}

export async function deleteCompanyInventories(companyId, ids) {
  const deleted = await deleteCompanyInventoriesInDB(companyId, ids);
  if (deleted.length === 0) throw new NotFoundError("No inventory items found to delete");
  return deleted;
}
