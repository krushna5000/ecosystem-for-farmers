// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
//
// SECURITY NOTE: the vendor id comes from the request body / URL, not from req.vendor — the old authorization
// model is kept on purpose (docs/routes/vendor.md). Every body is bespoke (`{ success, serviceLocation(s) }`).
import * as vendorServiceLocationService from "./vendorServiceLocation.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createServiceLocation(req, res) {
  const serviceLocation = await vendorServiceLocationService.createServiceLocation(req.body);
  sendJson(
    res,
    {
      success: true,
      message: "Service location created successfully",
      serviceLocation: snakeKeys(serviceLocation),
    },
    201,
  );
}

export async function getServiceLocations(req, res) {
  const rows = await vendorServiceLocationService.listServiceLocations(req.params.vendor_id);
  sendJson(res, { success: true, serviceLocations: snakeRows(rows) });
}

export async function getServiceLocationById(req, res) {
  const serviceLocation = await vendorServiceLocationService.getServiceLocationById(req.params.id);
  sendJson(res, { success: true, serviceLocation: snakeKeys(serviceLocation) });
}

export async function updateServiceLocation(req, res) {
  const serviceLocation = await vendorServiceLocationService.updateServiceLocation(req.params.id, req.body);
  sendJson(res, {
    success: true,
    message: "Service location updated successfully",
    serviceLocation: snakeKeys(serviceLocation),
  });
}

export async function deleteServiceLocation(req, res) {
  await vendorServiceLocationService.deleteServiceLocation(req.params.id);
  sendJson(res, { success: true, message: "Service location deleted successfully" });
}
