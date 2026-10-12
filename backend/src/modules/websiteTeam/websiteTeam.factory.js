// Pure DB I/O for website_schema.team_members. No business rules, no HTTP types.
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { teamMembers } from "./websiteTeam.schema.js";

const exec = (tx) => tx ?? db;

export async function createTeamMemberInDB(values, tx) {
  const [member] = await exec(tx).insert(teamMembers).values(values).returning();
  return member;
}

export function listTeamMembersInDB(tx) {
  return exec(tx).select().from(teamMembers).orderBy(asc(teamMembers.createdAt));
}

export async function getTeamMemberByIdInDB(empId, tx) {
  const [member] = await exec(tx).select().from(teamMembers).where(eq(teamMembers.empId, empId));
  return member ?? null;
}

export async function updateTeamMemberInDB(empId, changes, tx) {
  const [member] = await exec(tx)
    .update(teamMembers)
    .set(changes)
    .where(eq(teamMembers.empId, empId))
    .returning();
  return member ?? null;
}

export async function deleteTeamMemberInDB(empId, tx) {
  await exec(tx).delete(teamMembers).where(eq(teamMembers.empId, empId));
}

export function bulkDeleteTeamMembersInDB(empIds, tx) {
  return exec(tx)
    .delete(teamMembers)
    .where(inArray(teamMembers.empId, empIds))
    .returning({ id: teamMembers.empId });
}
