// Business rules for team members. Throws AppError subclasses; never touches req/res or db directly.
import crypto from "crypto";
import {
  createTeamMemberInDB,
  listTeamMembersInDB,
  getTeamMemberByIdInDB,
  updateTeamMemberInDB,
  deleteTeamMemberInDB,
  bulkDeleteTeamMembersInDB,
} from "./websiteTeam.factory.js";
import { NotFoundError } from "../../errors/index.js";
import { uploadFile } from "../../utils/storage.js";

const IMAGE_FOLDER = "team/images";

const toBool = (value) => value === "true" || value === true;

const uploadImage = (file) => uploadFile({ file, folder: IMAGE_FOLDER });

export async function createTeamMember(
  { name, position, thoughts, sub_thoughts, is_reversed_layout },
  file,
) {
  const empId = "EMP" + crypto.randomUUID().slice(0, 6).toUpperCase();

  const image = file ? await uploadImage(file) : null;

  return createTeamMemberInDB({
    empId,
    name,
    position,
    // SCHEMA-GAP: team_members.image_url is NOT NULL but the old code stored NULL when no image was sent
    imageUrl: image ?? "",
    thoughts: thoughts || null,
    subThoughts: sub_thoughts || null,
    isReversedLayout: toBool(is_reversed_layout),
  });
}

export function listTeamMembers() {
  return listTeamMembersInDB();
}

export async function getTeamMemberById(empId) {
  const member = await getTeamMemberByIdInDB(empId);
  if (!member) throw new NotFoundError("Team member not found");
  return member;
}

/** Returns the updated member, or null for an unknown id (which the endpoint has always answered with 200). */
export async function updateTeamMember(
  empId,
  { name, position, thoughts, sub_thoughts, is_reversed_layout },
  file,
) {
  const image = file ? await uploadImage(file) : null;

  // COALESCE semantics: only provided (non-null) fields are changed.
  // is_reversed_layout is always written (false when omitted), as in the old code.
  const changes = { isReversedLayout: toBool(is_reversed_layout) };
  if (name != null) changes.name = name;
  if (position != null) changes.position = position;
  if (image != null) changes.imageUrl = image;
  if (thoughts != null) changes.thoughts = thoughts;
  if (sub_thoughts != null) changes.subThoughts = sub_thoughts;

  return updateTeamMemberInDB(empId, changes);
}

export function deleteTeamMember(empId) {
  return deleteTeamMemberInDB(empId);
}

export async function deleteTeamMembers(empIds) {
  const deleted = await bulkDeleteTeamMembersInDB(empIds);
  return { deletedCount: deleted.length };
}
