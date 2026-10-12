// Thin HTTP layer. The prototype only validates the polygon (validator) and persists nothing,
// so there is no service or factory behind it.
import { sendJson } from "../../utils/response.js";

export function submitFarmBoundary(req, res) {
  sendJson(res, { success: true, message: "Farm boundary submitted successfully" });
}
