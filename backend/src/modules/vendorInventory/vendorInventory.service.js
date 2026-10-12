// Business rules for vendor inventory. Throws AppError subclasses; never touches the HTTP request or response or db directly.
import {
  productBelongsToVendorInDB,
  inventoryExistsForProductInDB,
  createVendorInventoryInDB,
  vendorInventoryExistsInDB,
  updateVendorInventoryInDB,
  listVendorInventoryInDB,
  getVendorInventoryByIdInDB,
  deleteVendorInventoryInDB,
} from "./vendorInventory.factory.js";
import { BadRequestError } from "../../errors/index.js";

const stockStatusFor = (quantity) => (quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK");

// Not-found is a 400 here, as it always was for this endpoint family (clients rely on it).
const NOT_FOUND = "Inventory item not found";

export async function createVendorInventory(vendorId, { product_id, quantity }) {
  if (!(await productBelongsToVendorInDB(product_id, vendorId))) {
    throw new BadRequestError("Product not found for this vendor");
  }

  if (await inventoryExistsForProductInDB(product_id, vendorId)) {
    throw new BadRequestError("Inventory already exists for this product");
  }

  return createVendorInventoryInDB({
    vendorId,
    productId: product_id,
    quantity,
    stockStatus: stockStatusFor(quantity),
  });
}

export async function updateVendorInventory(id, vendorId, { quantity }) {
  if (!(await vendorInventoryExistsInDB(id, vendorId))) throw new BadRequestError(NOT_FOUND);

  return updateVendorInventoryInDB(id, vendorId, { quantity, stockStatus: stockStatusFor(quantity) });
}

/** Rows are `{ inv, product_name }` (inventory LEFT JOIN products), newest first. */
export function listVendorInventory(vendorId) {
  return listVendorInventoryInDB(vendorId);
}

export async function getVendorInventoryById(id, vendorId) {
  const row = await getVendorInventoryByIdInDB(id, vendorId);
  if (!row) throw new BadRequestError(NOT_FOUND);
  return row;
}

export async function deleteVendorInventory(id, vendorId) {
  const deleted = await deleteVendorInventoryInDB(id, vendorId);
  if (!deleted) throw new BadRequestError(NOT_FOUND);
}
