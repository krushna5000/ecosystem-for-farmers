// Business rules for vendor service locations. Throws AppError subclasses; never touches the HTTP request or response or db directly.
//
// SECURITY NOTE: these functions deliberately keep the old authorization model — the vendor id comes from the
// request body / URL and ids are not checked against the authenticated vendor. See docs/routes/vendor.md.
import {
  serviceLocationExistsInDB,
  createServiceLocationInDB,
  listServiceLocationsByVendorInDB,
  getServiceLocationByIdInDB,
  updateServiceLocationInDB,
  deleteServiceLocationInDB,
} from "./vendorServiceLocation.factory.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { toBoolean } from "../../utils/vendorHelpers.js";

const NOT_FOUND = "Service location not found";

export async function createServiceLocation({ vendor_id, state, city, pincode, is_serviceable }) {
  if (await serviceLocationExistsInDB({ vendorId: vendor_id, state, city, pincode })) {
    throw new BadRequestError("Service location already exists for this vendor");
  }

  return createServiceLocationInDB({
    vendorId: vendor_id,
    state,
    city,
    pincode,
    isServiceable: toBoolean(is_serviceable) ?? true,
  });
}

export function listServiceLocations(vendorId) {
  return listServiceLocationsByVendorInDB(vendorId);
}

export async function getServiceLocationById(id) {
  const serviceLocation = await getServiceLocationByIdInDB(id);
  if (!serviceLocation) throw new NotFoundError(NOT_FOUND);
  return serviceLocation;
}

export async function updateServiceLocation(id, { state, city, pincode, is_serviceable }) {
  // All four columns are always written (missing -> NULL), exactly like the old UPDATE
  const serviceLocation = await updateServiceLocationInDB(id, {
    state: state ?? null,
    city: city ?? null,
    pincode: pincode ?? null,
    isServiceable: toBoolean(is_serviceable) ?? null,
  });
  if (!serviceLocation) throw new NotFoundError(NOT_FOUND);
  return serviceLocation;
}

export async function deleteServiceLocation(id) {
  const deleted = await deleteServiceLocationInDB(id);
  if (!deleted) throw new NotFoundError(NOT_FOUND);
}
