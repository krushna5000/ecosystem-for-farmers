// Response helpers — the only place controllers build a success body.
//
// The envelope follows the router's response style (middleware/responseStyle.js):
//   "flag"   (default)  { success: true,      message, data }
//   "status"            { status: "success",  message, data }
// Endpoints whose legacy contract is neither (e.g. `{ jobs: [...] }`) use sendJson().

export const successBody = (style, message, data) =>
  style === "status" ? { status: "success", message, data } : { success: true, message, data };

export const errorBody = (style, message) =>
  style === "status" ? { status: "error", message } : { success: false, message };

export function sendSuccess(res, data = null, message = "Success", statusCode = 200) {
  return res.status(statusCode).json(successBody(res.locals.responseStyle, message, data));
}

export function sendCreated(res, data = null, message = "Created successfully") {
  return sendSuccess(res, data, message, 201);
}

export function sendNoContent(res) {
  return res.status(204).send();
}

/** Legacy-contract passthrough: the body is sent exactly as given. */
export function sendJson(res, body, statusCode = 200) {
  return res.status(statusCode).json(body);
}
