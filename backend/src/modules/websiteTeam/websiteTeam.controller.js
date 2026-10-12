// Thin HTTP layer: take the validated request, call the service, send the response. Errors are not caught here —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as websiteTeamService from "./websiteTeam.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createTeamMember(req, res) {
  const member = await websiteTeamService.createTeamMember(req.body, req.file);
  sendJson(res, { success: true, team_member: snakeKeys(member) }, 201);
}

export async function getAllTeamMembers(req, res) {
  const rows = await websiteTeamService.listTeamMembers();
  sendJson(res, { success: true, members: snakeRows(rows) });
}

export async function getTeamMemberById(req, res) {
  const member = await websiteTeamService.getTeamMemberById(req.params.emp_id);
  sendJson(res, { success: true, member: snakeKeys(member) });
}

export async function updateTeamMember(req, res) {
  const member = await websiteTeamService.updateTeamMember(req.params.emp_id, req.body ?? {}, req.file);
  // An unknown id still answers 200 `{ success: true }` (no team_member key), as before.
  sendJson(res, { success: true, team_member: member ? snakeKeys(member) : undefined });
}

export async function deleteTeamMember(req, res) {
  await websiteTeamService.deleteTeamMember(req.params.emp_id);
  sendJson(res, { success: true, message: "Team member deleted successfully" });
}

export async function deleteMultipleTeamMembers(req, res) {
  const { deletedCount } = await websiteTeamService.deleteTeamMembers(req.body.ids);
  sendJson(res, { success: true, deletedCount });
}
