// Thin HTTP layer: take the validated request, call the service, send the response. Errors are not caught here —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as websiteJobService from "./websiteJob.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createJob(req, res) {
  const job = await websiteJobService.createJob(req.body);
  sendJson(res, { message: "Job created successfully", job: snakeKeys(job) }, 201);
}

export async function getJobs(req, res) {
  const rows = await websiteJobService.listJobs();
  sendJson(res, { jobs: snakeRows(rows) });
}

export async function updateJob(req, res) {
  await websiteJobService.updateJob(req.params.id, req.body);
  sendJson(res, { message: "Job updated successfully" });
}

export async function deleteJob(req, res) {
  await websiteJobService.deleteJob(req.params.id);
  sendJson(res, { message: "Job deleted successfully" });
}

export async function deleteMultipleJobs(req, res) {
  const { deletedCount } = await websiteJobService.deleteJobs(req.body.ids);
  sendJson(res, { success: true, deletedCount, message: "Jobs deleted successfully" });
}
