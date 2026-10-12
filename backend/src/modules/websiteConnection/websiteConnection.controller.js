// Thin HTTP layer: take the validated request, call the service, send the response. Errors are not caught here —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as websiteConnectionService from "./websiteConnection.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createConnection(req, res) {
  const connection = await websiteConnectionService.createConnection(req.body ?? {});
  sendJson(res, { message: "Connection created successfully", connection: snakeKeys(connection) }, 201);
}

export async function getConnections(req, res) {
  const rows = await websiteConnectionService.listConnections();
  sendJson(res, { connections: snakeRows(rows) });
}

export async function getConnectionById(req, res) {
  const connection = await websiteConnectionService.getConnectionById(req.params.id);
  sendJson(res, { connection: snakeKeys(connection) });
}

export async function updateConnection(req, res) {
  const connection = await websiteConnectionService.updateConnection(req.params.id, req.body ?? {});
  sendJson(res, { message: "Connection updated successfully", connection });
}

export async function deleteConnection(req, res) {
  await websiteConnectionService.deleteConnection(req.params.id);
  sendJson(res, { message: "Connection deleted successfully" });
}

export async function deleteMultipleConnections(req, res) {
  const { deletedCount } = await websiteConnectionService.deleteConnections(req.body.ids);
  sendJson(res, { success: true, deletedCount, message: "Connections deleted successfully" });
}
