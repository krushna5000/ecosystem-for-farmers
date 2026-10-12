// Thin HTTP layer: take the request, call the service, send the response. Errors are not caught here —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as prototypeGddService from "./prototypeGdd.service.js";
import { sendJson } from "../../utils/response.js";

export async function transformGdd(req, res) {
  const { forecast, GDD } = await prototypeGddService.calculateGdd(req.body ?? {});
  sendJson(res, { forecast, GDD });
}
